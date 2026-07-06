import fs from 'fs';

let content = fs.readFileSync('server/ai/adapters/openaiAdapter.js', 'utf8');

// Replace the generate function
const oldGenerate = `export async function generate(config, input) {
  const { apiKey, baseUrl } = config;
  const model = config.textModel || config.model;
  if (!model) throw new Error('Text model is missing from generation request.');
  const prompt = buildGenerationPrompt(input);
  const systemPrompt = 'You are an expert content strategist. Always return valid JSON matching the requested schema exactly. Never include markdown codeblock wrappers. Return only raw JSON.';
  const rawText = await callOpenAI(apiKey, model, baseUrl, systemPrompt, prompt, true);
  const parsed = repairJson(rawText);
  if (!parsed) throw new Error('Could not parse response from OpenAI. Raw: ' + (rawText || '').substring(0, 200));
  const qg = runQualityGate(parsed, input);
  if (parsed.qualityCheck) { parsed.qualityCheck = qg; } else { parsed.qualityCheck = qg; }
  return parsed;
}`;

const newGenerate = `export async function generate(config, input) {
  const { apiKey, baseUrl } = config;
  const model = config.textModel || config.model;
  if (!model) return { success: false, errorType: 'CONFIGURATION_ERROR', userMessage: 'Text model is missing from generation request.' };
  const prompt = buildGenerationPrompt(input);
  const systemPrompt = 'You are an expert content strategist. Always return valid JSON matching the requested schema exactly. Never include markdown codeblock wrappers. Return only raw JSON.';
  
  let rawText;
  try {
    rawText = await callOpenAI(apiKey, model, baseUrl, systemPrompt, prompt, true);
  } catch (err) {
    return {
      success: false,
      errorType: 'PROVIDER_ERROR',
      userMessage: friendlyError(err),
      debug: { message: err.message }
    };
  }

  const parsed = repairJson(rawText);
  
  if (parsed && parsed.success === false && parsed.errorType === 'AI_PARSE_ERROR') {
      return parsed; // pass the fallback object straight through
  }
  
  if (!parsed) {
     return { success: false, errorType: 'AI_PARSE_ERROR', userMessage: 'Could not parse response from OpenAI.', fallbackText: rawText };
  }
  
  const qg = runQualityGate(parsed, input);
  if (parsed.qualityCheck) { parsed.qualityCheck = qg; } else { parsed.qualityCheck = qg; }
  
  // Wrap standard success response in our envelope
  return {
    success: true,
    data: parsed
  };
}`;

content = content.replace(oldGenerate, newGenerate);

fs.writeFileSync('server/ai/adapters/openaiAdapter.js', content, 'utf8');
