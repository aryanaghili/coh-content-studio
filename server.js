import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as providerManager from './server/ai/providerManager.js';
import { buildGenerationPrompt } from './server/ai/promptBuilder.js';

import crypto from 'crypto';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

// Load AI provider config from .env on startup
providerManager.loadFromEnv();

// ─── Authentication Middleware & Routes ──────────────────────────────────────────
function requireAuth(req, res, next) {
  const authUsername = process.env.APP_AUTH_USERNAME;
  const authPassword = process.env.APP_AUTH_PASSWORD;
  
  if (!authUsername || !authPassword) {
    return next();
  }

  const cookies = req.headers.cookie || '';
  const match = cookies.match(/coh_session=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
  }

  const [signature, username, expiryStr] = token.split(':');
  const expiry = parseInt(expiryStr || '0', 10);

  const expectedSig = crypto.createHmac('sha256', process.env.APP_AUTH_SECRET || 'fallback_secret')
    .update(`${username}:${expiry}`)
    .digest('hex');

  if (signature === expectedSig && expiry > Date.now() && username === authUsername) {
    return next();
  }

  res.status(401).json({ error: 'Session expired or invalid. Please sign in.' });
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const authUsername = process.env.APP_AUTH_USERNAME;
  const authPassword = process.env.APP_AUTH_PASSWORD;

  if (!authUsername || !authPassword) {
    return res.status(503).json({ error: 'Authentication is not configured on the server.' });
  }

  if (username === authUsername && password === authPassword) {
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    const signature = crypto.createHmac('sha256', process.env.APP_AUTH_SECRET || 'fallback_secret')
      .update(`${username}:${expiry}`)
      .digest('hex');
    const token = `${signature}:${username}:${expiry}`;

    res.setHeader('Set-Cookie', `coh_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${process.env.NODE_ENV === 'production' || process.env.VERCEL ? '; Secure' : ''}`);
    return res.json({ ok: true, username });
  }

  res.status(401).json({ error: 'Invalid username or password.' });
});

app.post('/api/auth/logout', (req, res) => {
  res.setHeader('Set-Cookie', `coh_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${process.env.NODE_ENV === 'production' || process.env.VERCEL ? '; Secure' : ''}`);
  res.json({ ok: true });
});

app.get('/api/auth/session', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const authUsername = process.env.APP_AUTH_USERNAME;
  const authPassword = process.env.APP_AUTH_PASSWORD;

  if (!authUsername || !authPassword) {
    return res.json({ authenticated: true, bypass: true });
  }

  const cookies = req.headers.cookie || '';
  const match = cookies.match(/coh_session=([^;]+)/);
  const token = match ? match[1] : null;

  if (!token) {
    return res.json({ authenticated: false });
  }

  const [signature, username, expiryStr] = token.split(':');
  const expiry = parseInt(expiryStr || '0', 10);

  const expectedSig = crypto.createHmac('sha256', process.env.APP_AUTH_SECRET || 'fallback_secret')
    .update(`${username}:${expiry}`)
    .digest('hex');

  if (signature === expectedSig && expiry > Date.now() && username === authUsername) {
    return res.json({ authenticated: true, username });
  }

  res.json({ authenticated: false });
});

// ─── Status ──────────────────────────────────────────────────────────────────
app.get('/api/ai/status', requireAuth, async (req, res) => {
  try {
    const active = providerManager.getActiveConfig();
    if (active && active.apiKey && active.status !== 'connected' && active.apiKeySource === 'env') {
      const testRes = await providerManager.testConnection(active);
      if (testRes.connected) {
        providerManager.setConfig({
          ...active,
          status: 'connected',
          lastTestedAt: new Date().toISOString()
        });
      } else {
        providerManager.setConfig({
          ...active,
          status: 'error',
          lastError: testRes.error || 'Connection failed'
        });
      }
    }
  } catch (err) {
    console.error('[status auto-test error]', err.message);
  }

  const cfg = providerManager.getMaskedConfig();
  res.json({
    connected: providerManager.isConnected(),
    activeConfig: cfg,
    serverTime: new Date().toISOString(),
  });
});

// ─── Test Connection ──────────────────────────────────────────────────────────
app.post('/api/ai/test', requireAuth, async (req, res) => {
  try {
    let { provider, textModel, imageModel, apiKey, baseUrl } = req.body;
    
    if (!provider) return res.status(400).json({ error: 'Please select an AI provider.' });
    if (!textModel) return res.status(400).json({ error: 'Text generation model is required.' });
    if ((provider === 'openai' || provider === 'openrouter') && !imageModel) {
      return res.status(400).json({ error: 'Image generation model is required.' });
    }
    
    // For testing backward compatibility or simple tests
    const modelToTest = textModel || req.body.model || 'gpt-3.5-turbo';

    if (!apiKey || apiKey === '••••••••') {
      const active = providerManager.getActiveConfig();
      if (active && active.provider === provider && active.apiKey) {
        apiKey = active.apiKey;
      } else {
        return res.status(400).json({ error: 'API key is not configured on the backend.' });
      }
    }

    const result = await providerManager.testConnection({ provider, textModel, imageModel, model: modelToTest, apiKey, baseUrl });
    res.json(result);
  } catch (err) {
    console.error('[/api/ai/test]', err.message);
    res.status(500).json({ connected: false, error: err.message.substring(0, 200) });
  }
});

// ─── Configure / Apply Provider ───────────────────────────────────────────────
app.post('/api/ai/configure', (req, res) => {
  try {
    let { provider, textModel, imageModel, apiKey, baseUrl, displayName, lastTestedAt } = req.body;
    
    // Fallback for older UI calling with `model`
    if (!textModel && req.body.model) textModel = req.body.model;
    
    if (!provider || !textModel) {
      return res.status(400).json({ error: 'Provider and text model are required.' });
    }
    
    if (!apiKey || apiKey === '••••••••') {
      const active = providerManager.getActiveConfig();
      if (active && active.provider === provider && active.apiKey) {
        apiKey = active.apiKey;
      } else {
        return res.status(400).json({ error: 'API key is required.' });
      }
    }

    providerManager.updateConfig({
      provider,
      textModel,
      imageModel: imageModel || '',
      apiKey,
      baseUrl,
      status: 'connected',
      lastTestedAt: lastTestedAt || new Date().toISOString()
    });

    res.json({ success: true, activeConfig: providerManager.getMaskedConfig() });
  } catch (err) {
    console.error('[/api/ai/configure]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Generate Content ─────────────────────────────────────────────────────────
app.post('/api/ai/generate', requireAuth, async (req, res) => {
  try {
    const input = req.body;
    if (!input || !input.rawInput) {
      return res.status(400).json({ error: 'rawInput is required.' });
    }
    if (!providerManager.isConnected()) {
      return res.status(503).json({
        error: 'AI provider is not connected. Configure a provider in Settings first.',
        fallback: true,
      });
    }
    const result = await providerManager.generate(input);
    res.json(result);
  } catch (err) {
    console.error('[/api/ai/generate]', err.message);
    res.status(500).json({ error: friendlyServerError(err) });
  }
});

app.post('/api/ai/generate-image', requireAuth, async (req, res) => {
  try {
    const { prompt, promptBuildMode, aspectRatio, visualStyle, visualBrief, inputMode, provider, model } = req.body;
    
    // Compile prompt on the backend
    let compiledPrompt = '';
    
    // 1. Base components
    let baseConcept = '';
    let baseFormat = '';
    let baseMood = '';
    let baseComposition = '';
    let basePalette = '';
    let baseTypography = '';
    let baseElements = '';
    let baseAvoid = '';
    let baseNotes = '';
    let baseAiPrompt = '';

    if (promptBuildMode === 'Full' || promptBuildMode === 'Full + AI') {
      if (visualBrief?.concept) baseConcept = `Visual Concept: ${visualBrief.concept}\n`;
      if (visualBrief?.format) baseFormat = `Format/Context: ${visualBrief.format} (Translate this into composition guidance rather than creating a literal text-heavy poster design.)\n`;
      if (visualBrief?.mood) baseMood = `Mood/Atmosphere: ${visualBrief.mood}\n`;
      if (visualBrief?.composition) baseComposition = `Composition: ${visualBrief.composition}\n`;
      if (visualBrief?.palette) basePalette = `Color / Material Direction: ${visualBrief.palette}\n`;
      if (visualBrief?.typography) baseTypography = `Typography Notes: ${visualBrief.typography} (Note: Typography and layout notes are for downstream graphic design. Do NOT generate large readable text, headlines, captions, or slogans inside the image unless specifically requested below.)\n`;
      if (visualBrief?.elements) baseElements = `Key Visual Elements: ${visualBrief.elements}\n`;
      if (visualBrief?.avoid) baseAvoid = `Negative Prompt (Avoid these completely): ${visualBrief.avoid}\n`;
      if (visualBrief?.notes) baseNotes = `Designer Notes: ${visualBrief.notes}\n`;
    }
    
    if (promptBuildMode === 'AI Only' || promptBuildMode === 'Full + AI') {
      if (visualBrief?.aiPrompt) baseAiPrompt = `\nSpecific AI Prompt Instructions: ${visualBrief.aiPrompt}\n`;
    }

    let corePrompt = baseConcept + baseFormat + baseMood + baseComposition + basePalette + baseTypography + baseElements + baseAvoid + baseNotes + baseAiPrompt;

    // 2. Handle Manual Prompts vs Structured Prompts
    if (inputMode === 'Manual' && prompt) {
      if (promptBuildMode === 'Manual Only' || !promptBuildMode) {
        compiledPrompt = `Raw Visual Direction:\n${prompt}`;
      } else {
        compiledPrompt = `Raw Visual Direction:\n${prompt}\n\nStructured Brief:\n${corePrompt}`;
      }
    } else {
      compiledPrompt = corePrompt;
    }
    
    // 3. Inject Visual Style Rules
    let styleRules = '';
    const style = visualStyle || 'Editorial Photomontage';
    
    if (style === 'Editorial Photomontage') {
      styleRules = 'Create a refined, premium editorial image with cinematic realism and subtle mixed-media layering. The image should feel like a high-end cultural publication, not a social media poster, infographic, cartoon, or flat illustration. Avoid generic "eco-symbols" (like literal green leaves or recycling icons). NO cartoon characters. NO large text inside the image.';
    } else if (style === 'Cinematic Realism') {
      styleRules = 'Prioritize stunning photographic cinematic realism. High-end lighting, atmospheric depth, realistic textures. NO illustrations, NO vectors, NO cartoons, NO text.';
    } else if (style === 'Premium Illustration') {
      styleRules = 'Create a premium, sophisticated illustration. Avoid childish vector graphics, flat corporate art, or cheap stock vectors. Aim for mature, refined, detailed, artistic rendering. NO large typography.';
    } else if (style === 'Minimal Graphic') {
      styleRules = 'Use restrained, highly minimal graphic design. Clean lines, negative space, bold but sparse forms. Avoid clutter, realistic photography, or cartoonish graphics.';
    } else if (style === 'Social Poster') {
      styleRules = 'Create a stylized social poster format. Text is allowed if requested. Keep graphics bold, eye-catching, and vibrant.';
    } else {
      styleRules = 'Create a refined, premium editorial image with cinematic realism.';
    }

    let systemInstructions = `SYSTEM INSTRUCTION: ${styleRules}\n\nCRITICAL QUALITY RULES:\n- Respect the System Instruction style above.\n- Typography and layout notes are for external composition context; DO NOT place unrequested big text inside the image.\n- Negative Prompt rules MUST be strictly followed.`;

    let finalCompiledPrompt = compiledPrompt;
    
    // 4. Use LLM 2-step pipeline to rewrite the prompt
    const isGPTImage = (model || providerManager.getMaskedConfig()?.imageModel || '').startsWith('gpt-image');
    if (compiledPrompt && promptBuildMode !== 'Manual Only' && !isGPTImage) {
      try {
        const textPrompt = `You are an expert Midjourney and DALL-E prompt engineer. Rewrite the following visual direction into a single, cohesive, highly detailed image generation prompt optimized for DALL-E 3. Do not include markdown or conversational text. Return only the raw prompt string.\n\n${compiledPrompt}`;
        
        const optimizedPrompt = await providerManager.compileImagePrompt(systemInstructions, textPrompt);
        
        if (optimizedPrompt && optimizedPrompt.trim()) {
          finalCompiledPrompt = optimizedPrompt;
        } else {
          // Fallback if LLM fails
          finalCompiledPrompt = `${systemInstructions}\n\n---\n\n${compiledPrompt}`;
        }
      } catch (err) {
        console.warn('Failed to compile image prompt with LLM, falling back to raw compiler:', err.message);
        finalCompiledPrompt = `${systemInstructions}\n\n---\n\n${compiledPrompt}`;
      }
    } else if (compiledPrompt) {
      finalCompiledPrompt = `${systemInstructions}\n\n---\n\n${compiledPrompt}`;
    }
    
    if (!finalCompiledPrompt.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt is empty. Please provide visual directions or a manual prompt.' });
    }

    // Call the provider manager with the compiled prompt
    const generateInput = {
      ...req.body,
      prompt: finalCompiledPrompt,
      quality: req.body.quality || 'high'
    };
    
    console.log("=== Visual Studio Prompt Compilation ===");
    console.log("Raw Visual Brief:", visualBrief || "None");
    console.log("Compiled Prompt Length:", finalCompiledPrompt.length);
    console.log("First 800 chars:", finalCompiledPrompt.substring(0, 800));
    console.log("Included AI Image Prompt?", !!visualBrief?.aiPrompt);
    console.log("Included Negative Prompt?", !!visualBrief?.avoid);
    console.log("Visual Style:", visualStyle);
    console.log("Model:", model || providerManager.getMaskedConfig()?.imageModel || 'dall-e-3');
    console.log("Quality:", generateInput.quality);
    console.log("Size:", generateInput.aspectRatio || '1024x1024');
    console.log("========================================");

    const imagesRaw = await providerManager.generateImage(generateInput);
    
    // Format response to requested shape
    const formattedImages = imagesRaw.map((imgUrl, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      url: imgUrl,
      mimeType: imgUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
      promptUsed: finalCompiledPrompt,
      provider: provider || providerManager.getMaskedConfig()?.provider || 'unknown',
      model: model || providerManager.getMaskedConfig()?.model || 'unknown'
    }));

    res.json({ success: true, images: formattedImages });
  } catch (err) {
    console.error('[Generate Image error]', err.message);
    try {
      const parsedErr = JSON.parse(err.message);
      if (parsedErr.isProviderError) {
        return res.status(500).json({
          success: false,
          error: parsedErr.message,
          debug: parsedErr.debug
        });
      }
    } catch (parseErr) {
      // Not a JSON error string
    }
    res.status(500).json({ success: false, error: err.message || 'Image generation failed' });
  }
});

// ─── Ideate ───────────────────────────────────────────────────────────────────
app.post('/api/ai/ideate', requireAuth, async (req, res) => {
  try {
    const input = { ...req.body, mode: 'ideation' };
    if (!input.rawInput) {
      return res.status(400).json({ error: 'rawInput is required.' });
    }
    if (!providerManager.isConnected()) {
      return res.status(503).json({
        error: 'AI provider is not connected. Configure a provider in Settings first.',
        fallback: true,
      });
    }
    const result = await providerManager.generate(input);
    res.json(result);
  } catch (err) {
    console.error('[/api/ai/ideate]', err.message);
    res.status(500).json({ error: friendlyServerError(err) });
  }
});

// ─── Revise ───────────────────────────────────────────────────────────────────
app.post('/api/ai/revise', requireAuth, async (req, res) => {
  try {
    const input = { ...req.body, mode: 'revision' };
    if (!input.previousDraft) {
      return res.status(400).json({ error: 'previousDraft is required.' });
    }
    if (!providerManager.isConnected()) {
      return res.status(503).json({
        error: 'AI provider is not connected. Configure a provider in Settings first.',
        fallback: true,
      });
    }
    const result = await providerManager.generate(input);
    res.json(result);
  } catch (err) {
    console.error('[/api/ai/revise]', err.message);
    res.status(500).json({ error: friendlyServerError(err) });
  }
});

// ─── Prompt Builder ───────────────────────────────────────────────────────────
app.post('/api/ai/prompt', requireAuth, (req, res) => {
  try {
    const prompt = buildGenerationPrompt(req.body);
    const cfg = providerManager.getMaskedConfig();
    res.json({
      prompt,
      provider: cfg?.provider || null,
      model: cfg?.model || null,
      apiKeySource: cfg?.apiKeySource || 'not_configured',
    });
  } catch (err) {
    res.status(500).json({ error: err.message.substring(0, 200) });
  }
});

function friendlyServerError(err) {
  const msg = err.message || '';
  if (msg.toLowerCase().includes('api key')) return 'Invalid or missing API key.';
  if (msg.toLowerCase().includes('rate limit') || msg.includes('429')) return 'Rate limit reached. Try again in a moment.';
  if (msg.toLowerCase().includes('network') || msg.includes('fetch')) return 'Network error reaching AI provider.';
  if (msg.toLowerCase().includes('not configured')) return msg;
  
  // Pass through safe rejection messages from our adapters
  if (msg.includes('rejected the text generation request') || msg.includes('Text model is missing') || msg.includes('Provider is missing') || msg.includes('Compiled prompt is empty')) {
    return msg;
  }
  
  return msg || 'AI generation error. Check server logs.';
}

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`[COH AI Server] Running at http://localhost:${PORT}`);
    const cfg = providerManager.getMaskedConfig();
    if (cfg) {
      console.log(`[COH AI Server] Active provider: ${cfg.provider} / ${cfg.model}`);
    } else {
      console.log('[COH AI Server] No provider configured. Add keys to .env and restart, or configure in Settings.');
    }
  });
  server.on('error', (e) => console.error('[Server Error]', e));
}

export default app;
