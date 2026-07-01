import { repairJson } from '../jsonRepair.js';
import { buildGenerationPrompt } from '../promptBuilder.js';
import { runQualityGate } from '../qualityGate.js';

async function callAnthropic(apiKey, model, systemPrompt, userPrompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.8,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data?.content?.[0]?.text || null;
}

export async function generate(config, input) {
  const { apiKey, model } = config;
  const prompt = buildGenerationPrompt(input);
  const systemPrompt = 'You are an expert content strategist. Always return valid JSON matching the requested schema exactly. Never include markdown codeblock wrappers. Return only raw JSON.';
  const rawText = await callAnthropic(apiKey, model, systemPrompt, prompt);
  const parsed = repairJson(rawText);
  if (!parsed) throw new Error('Could not parse response from Anthropic. Raw: ' + (rawText || '').substring(0, 200));
  const qg = runQualityGate(parsed, input);
  parsed.qualityCheck = qg;
  return parsed;
}

export async function testConnection(config) {
  const { apiKey, model } = config;
  const start = Date.now();
  const systemPrompt = 'You are a test assistant. Return only valid JSON.';
  const userPrompt = 'Respond with exactly: { "ok": true, "provider": "anthropic", "model": "' + model + '" }';
  try {
    const rawText = await callAnthropic(apiKey, model, systemPrompt, userPrompt);
    const parsed = repairJson(rawText);
    if (!parsed?.ok) throw new Error('Invalid test response: ' + rawText);
    return { connected: true, provider: 'anthropic', model, latency: Date.now() - start };
  } catch (err) {
    return { connected: false, provider: 'anthropic', model, latency: Date.now() - start, error: friendlyError(err) };
  }
}

function friendlyError(err) {
  const msg = err.message || '';
  if (msg.includes('401')) return 'Invalid API key. Check your Anthropic key.';
  if (msg.includes('404')) return 'Model not found. Try claude-3-5-sonnet-latest.';
  if (msg.includes('429')) return 'Rate limit reached. Try again in a moment.';
  if (msg.includes('fetch')) return 'Network error. Could not reach Anthropic.';
  return msg.substring(0, 150);
}
