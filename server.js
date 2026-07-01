import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as providerManager from './server/ai/providerManager.js';
import { buildGenerationPrompt } from './server/ai/promptBuilder.js';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '2mb' }));

// Load AI provider config from .env on startup
providerManager.loadFromEnv();

// ─── Status ──────────────────────────────────────────────────────────────────
app.get('/api/ai/status', async (req, res) => {
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
app.post('/api/ai/test', async (req, res) => {
  try {
    let { provider, model, apiKey, baseUrl } = req.body;
    if (!provider) return res.status(400).json({ error: 'Provider is required.' });
    if (!model) return res.status(400).json({ error: 'Model is required.' });

    if (!apiKey || apiKey === '••••••••') {
      const active = providerManager.getActiveConfig();
      if (active && active.provider === provider && active.apiKey) {
        apiKey = active.apiKey;
      } else {
        return res.status(400).json({ error: 'API key is required.' });
      }
    }

    const result = await providerManager.testConnection({ provider, model, apiKey, baseUrl });
    res.json(result);
  } catch (err) {
    console.error('[/api/ai/test]', err.message);
    res.status(500).json({ connected: false, error: err.message.substring(0, 200) });
  }
});

// ─── Configure / Apply Provider ───────────────────────────────────────────────
app.post('/api/ai/configure', (req, res) => {
  try {
    let { provider, model, apiKey, baseUrl, displayName, lastTestedAt } = req.body;
    if (!provider || !model) {
      return res.status(400).json({ error: 'Provider and model are required.' });
    }
    
    if (!apiKey || apiKey === '••••••••') {
      const active = providerManager.getActiveConfig();
      if (active && active.provider === provider && active.apiKey) {
        apiKey = active.apiKey;
      } else {
        return res.status(400).json({ error: 'API key is required.' });
      }
    }

    const active = providerManager.getActiveConfig();
    providerManager.setConfig({
      provider,
      displayName: displayName || provider,
      apiKey,
      model,
      baseUrl: baseUrl || null,
      apiKeySource: (active && apiKey === active.apiKey) ? (active.apiKeySource || 'runtime') : 'runtime',
      status: 'connected',
      lastTestedAt: lastTestedAt || new Date().toISOString(),
    });
    res.json({ ok: true, message: `Provider "${provider}" applied.` });
  } catch (err) {
    console.error('[/api/ai/configure]', err.message);
    res.status(500).json({ error: err.message.substring(0, 200) });
  }
});

// ─── Generate Content ─────────────────────────────────────────────────────────
app.post('/api/ai/generate', async (req, res) => {
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

// ─── Ideate ───────────────────────────────────────────────────────────────────
app.post('/api/ai/ideate', async (req, res) => {
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
app.post('/api/ai/revise', async (req, res) => {
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
app.post('/api/ai/prompt', (req, res) => {
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
  return 'AI generation error. Check server logs.';
}

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[COH AI Server] Running at http://localhost:${PORT}`);
    const cfg = providerManager.getMaskedConfig();
    if (cfg) {
      console.log(`[COH AI Server] Active provider: ${cfg.provider} / ${cfg.model}`);
    } else {
      console.log('[COH AI Server] No provider configured. Add keys to .env and restart, or configure in Settings.');
    }
  });
}

export default app;
