import { repairJson } from '../jsonRepair.js';
import { buildGenerationPrompt } from '../promptBuilder.js';
import { runQualityGate } from '../qualityGate.js';

async function callGemini(apiKey, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      }
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

export async function generate(config, input) {
  const { apiKey, baseUrl } = config;
  const model = config.textModel || config.model;
  if (!model) return { success: false, errorType: 'CONFIGURATION_ERROR', userMessage: 'Text model is missing from generation request.' };
  
  const prompt = 'Always return valid JSON matching the requested schema exactly. Never include markdown codeblock wrappers.\n\n' + buildGenerationPrompt(input);
  
  let rawText;
  try {
    rawText = await callGemini(apiKey, model, prompt);
  } catch (err) {
    return { success: false, errorType: 'PROVIDER_ERROR', userMessage: friendlyError(err), debug: { message: err.message } };
  }

  let parsed = repairJson(rawText);
  
  // Retry logic
  if (parsed && parsed.success === false && parsed.errorType === 'AI_PARSE_ERROR') {
      try {
          const repairPrompt = `Repair this into valid JSON matching this schema. Do not add commentary. Raw Output: ${rawText}`;
          const repairedText = await callGemini(apiKey, model, repairPrompt);
          const repairedParsed = repairJson(repairedText);
          if (repairedParsed && repairedParsed.success !== false) {
              parsed = repairedParsed;
          }
      } catch (e) {
          console.error("JSON Repair retry failed for gemini", e);
      }
  }

  if (parsed && parsed.success === false && parsed.errorType === 'AI_PARSE_ERROR') {
      return parsed; // pass the fallback object straight through
  }
  
  if (!parsed) {
     return { success: false, errorType: 'AI_PARSE_ERROR', userMessage: 'Could not parse response from gemini.', fallbackText: rawText };
  }
  
  const qg = runQualityGate(parsed, input);
  if (parsed.qualityCheck) { parsed.qualityCheck = qg; } else { parsed.qualityCheck = qg; }
  
  return { success: true, data: parsed };
}

export async function testConnection(config) {
  const { apiKey, model } = config;
  const start = Date.now();
  const prompt = 'Respond with exactly this JSON and nothing else: { "ok": true, "provider": "gemini", "model": "' + model + '" }';
  try {
    const rawText = await callGemini(apiKey, model, prompt);
    const parsed = repairJson(rawText);
    if (!parsed?.ok) throw new Error('Invalid test response: ' + rawText);
    return { connected: true, provider: 'gemini', model, latency: Date.now() - start };
  } catch (err) {
    return { connected: false, provider: 'gemini', model, latency: Date.now() - start, error: friendlyError(err) };
  }
}

function friendlyError(err) {
  const msg = err.message || '';
  if (msg.includes('400')) return 'Invalid request. Check API key and model name.';
  if (msg.includes('403')) return 'Access denied. Check your Gemini API key.';
  if (msg.includes('404')) return 'Model not found. Try gemini-1.5-pro or gemini-2.0-flash.';
  if (msg.includes('429')) return 'Rate limit reached. Try again in a moment.';
  if (msg.includes('fetch')) return 'Network error. Could not reach Google AI.';
  return msg.substring(0, 150);
}
