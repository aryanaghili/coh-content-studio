import { repairJson } from '../jsonRepair.js';
import { buildGenerationPrompt } from '../promptBuilder.js';
import { runQualityGate } from '../qualityGate.js';

async function callMistral(apiKey, model, systemPrompt, userPrompt) {
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || null;
}

export async function generate(config, input) {
  const { apiKey, model } = config;
  const prompt = buildGenerationPrompt(input);
  const systemPrompt = 'You are an expert content strategist. Always return valid JSON matching the requested schema exactly. Never include markdown codeblock wrappers. Return only raw JSON.';
  const rawText = await callMistral(apiKey, model, systemPrompt, prompt);
  const parsed = repairJson(rawText);
  if (!parsed) throw new Error('Could not parse response from Mistral. Raw: ' + (rawText || '').substring(0, 200));
  const qg = runQualityGate(parsed, input);
  parsed.qualityCheck = qg;
  return parsed;
}

export async function testConnection(config) {
  const { apiKey, model } = config;
  const start = Date.now();
  const systemPrompt = 'You are a test assistant. Return only valid JSON.';
  const userPrompt = 'Respond with exactly: { "ok": true, "provider": "mistral", "model": "' + model + '" }';
  try {
    const rawText = await callMistral(apiKey, model, systemPrompt, userPrompt);
    const parsed = repairJson(rawText);
    if (!parsed?.ok) throw new Error('Invalid test response: ' + rawText);
    return { connected: true, provider: 'mistral', model, latency: Date.now() - start };
  } catch (err) {
    return { connected: false, provider: 'mistral', model, latency: Date.now() - start, error: friendlyError(err) };
  }
}

function friendlyError(err) {
  const msg = err.message || '';
  if (msg.includes('401')) return 'Invalid API key. Check your Mistral key.';
  if (msg.includes('404')) return 'Model not found. Try mistral-large-latest.';
  if (msg.includes('429')) return 'Rate limit reached. Try again in a moment.';
  if (msg.includes('fetch')) return 'Network error. Could not reach Mistral.';
  return msg.substring(0, 150);
}
