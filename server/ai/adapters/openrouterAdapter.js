import { repairJson } from '../jsonRepair.js';
import { buildGenerationPrompt } from '../promptBuilder.js';
import { runQualityGate } from '../qualityGate.js';

// OpenRouter uses the OpenAI-compatible chat completions format
async function callOpenRouter(apiKey, model, baseUrl, systemPrompt, userPrompt) {
  const url = `${baseUrl || 'https://openrouter.ai/api/v1'}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://coh-content-studio.local',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || null;
}

export async function generate(config, input) {
  const { apiKey, baseUrl } = config;
  const model = config.textModel || config.model;
  if (!model) return { success: false, errorType: 'CONFIGURATION_ERROR', userMessage: 'Text model is missing from generation request.' };
  
  const prompt = buildGenerationPrompt(input);
  const systemPrompt = 'You are an expert content strategist. Always return valid JSON matching the requested schema exactly. Never include markdown codeblock wrappers. Return only raw JSON.';
  
  let rawText;
  try {
    rawText = await callOpenRouter(apiKey, model, baseUrl, systemPrompt, prompt, true);
  } catch (err) {
    return { success: false, errorType: 'PROVIDER_ERROR', userMessage: friendlyError(err), debug: { message: err.message } };
  }

  let parsed = repairJson(rawText);
  
  // Retry logic
  if (parsed && parsed.success === false && parsed.errorType === 'AI_PARSE_ERROR') {
      try {
          const repairPrompt = `Repair this into valid JSON matching this schema. Do not add commentary. Raw Output: ${rawText}`;
          const repairedText = await callOpenRouter(apiKey, model, baseUrl, systemPrompt, repairPrompt, true);
          const repairedParsed = repairJson(repairedText);
          if (repairedParsed && repairedParsed.success !== false) {
              parsed = repairedParsed;
          }
      } catch (e) {
          console.error("JSON Repair retry failed for openrouter", e);
      }
  }

  if (parsed && parsed.success === false && parsed.errorType === 'AI_PARSE_ERROR') {
      return parsed; // pass the fallback object straight through
  }
  
  if (!parsed) {
     return { success: false, errorType: 'AI_PARSE_ERROR', userMessage: 'Could not parse response from openrouter.', fallbackText: rawText };
  }
  
  const qg = runQualityGate(parsed, input);
  if (parsed.qualityCheck) { parsed.qualityCheck = qg; } else { parsed.qualityCheck = qg; }
  
  return { success: true, data: parsed };
}

export async function testConnection(config) {
  const { apiKey, model, baseUrl } = config;
  const start = Date.now();
  const systemPrompt = 'You are a test assistant. Return only valid JSON.';
  const userPrompt = 'Respond with exactly: { "ok": true, "provider": "openrouter", "model": "' + model + '" }';
  try {
    const rawText = await callOpenRouter(apiKey, model, baseUrl, systemPrompt, userPrompt);
    const parsed = repairJson(rawText);
    if (!parsed?.ok) throw new Error('Invalid test response: ' + rawText);
    return { connected: true, provider: 'openrouter', model, latency: Date.now() - start };
  } catch (err) {
    return { connected: false, provider: 'openrouter', model, latency: Date.now() - start, error: friendlyError(err) };
  }
}

function friendlyError(err) {
  const msg = err.message || '';
  if (msg.includes('401')) return 'Invalid API key. Check your OpenRouter key.';
  if (msg.includes('404')) return 'Model not found on OpenRouter. Check the model name.';
  if (msg.includes('429')) return 'Rate limit reached. Try again in a moment.';
  if (msg.includes('fetch')) return 'Network error. Could not reach OpenRouter.';
  return msg.substring(0, 150);
}
