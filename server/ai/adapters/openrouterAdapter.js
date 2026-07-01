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
  const { apiKey, model, baseUrl } = config;
  const prompt = buildGenerationPrompt(input);
  const systemPrompt = 'You are an expert content strategist. Always return valid JSON matching the requested schema exactly. Never include markdown codeblock wrappers. Return only raw JSON.';
  const rawText = await callOpenRouter(apiKey, model, baseUrl, systemPrompt, prompt);
  const parsed = repairJson(rawText);
  if (!parsed) throw new Error('Could not parse response from OpenRouter. Raw: ' + (rawText || '').substring(0, 200));
  const qg = runQualityGate(parsed, input);
  parsed.qualityCheck = qg;
  return parsed;
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
