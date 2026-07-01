import { repairJson } from '../jsonRepair.js';
import { buildGenerationPrompt } from '../promptBuilder.js';
import { runQualityGate } from '../qualityGate.js';

async function callOpenAI(apiKey, model, baseUrl, systemPrompt, userPrompt) {
  const url = `${baseUrl || 'https://api.openai.com'}/v1/chat/completions`;
  const res = await fetch(url, {
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
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

export async function generate(config, input) {
  const { apiKey, model, baseUrl } = config;
  const prompt = buildGenerationPrompt(input);
  const systemPrompt = 'You are an expert content strategist. Always return valid JSON matching the requested schema exactly. Never include markdown codeblock wrappers. Return only raw JSON.';
  const rawText = await callOpenAI(apiKey, model, baseUrl, systemPrompt, prompt);
  const parsed = repairJson(rawText);
  if (!parsed) throw new Error('Could not parse response from OpenAI. Raw: ' + (rawText || '').substring(0, 200));
  const qg = runQualityGate(parsed, input);
  if (parsed.qualityCheck) { parsed.qualityCheck = qg; } else { parsed.qualityCheck = qg; }
  return parsed;
}

export async function testConnection(config) {
  const { apiKey, model, baseUrl } = config;
  const start = Date.now();
  const systemPrompt = 'You are a connection test assistant. Return only valid JSON.';
  const userPrompt = 'Respond with exactly: { "ok": true, "provider": "openai", "model": "' + model + '" }';
  try {
    const rawText = await callOpenAI(apiKey, model, baseUrl, systemPrompt, userPrompt);
    const parsed = repairJson(rawText);
    if (!parsed?.ok) throw new Error('Invalid test response: ' + rawText);
    return { connected: true, provider: 'openai', model, latency: Date.now() - start };
  } catch (err) {
    return { connected: false, provider: 'openai', model, latency: Date.now() - start, error: friendlyError(err) };
  }
}

function friendlyError(err) {
  const msg = err.message || '';
  if (msg.includes('401')) return 'Invalid API key. Check your OpenAI key.';
  if (msg.includes('404')) return 'Model not found. Check the model name.';
  if (msg.includes('429')) return 'Rate limit reached. Try again in a moment.';
  if (msg.includes('fetch')) return 'Network error. Could not reach OpenAI.';
  return msg.substring(0, 150);
}
