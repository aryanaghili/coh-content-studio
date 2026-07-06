import fs from 'fs';

let content = fs.readFileSync('server/ai/adapters/openaiAdapter.js', 'utf8');

// 1. Update callOpenAI to accept responseFormat parameter
// Find callOpenAI signature and body
content = content.replace(
  /async function callOpenAI\(apiKey, model, baseUrl, systemPrompt, userPrompt, isJson = false\) \{/g,
  "async function callOpenAI(apiKey, model, baseUrl, systemPrompt, userPrompt, isJson = false) {"
);

const oldPayloadStr = `  const payload = {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
  };`;
const newPayloadStr = `  const payload = {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
  };
  if (isJson) {
      // Use structured output if possible, else json_object
      // Assume newer models support response_format: { type: 'json_object' }
      payload.response_format = { type: 'json_object' };
  }`;
content = content.replace(oldPayloadStr, newPayloadStr);

// 2. Update generate to implement retry
const oldGenerate = `export async function generate(config, input) {
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
    return { success: false, errorType: 'PROVIDER_ERROR', userMessage: friendlyError(err), debug: { message: err.message } };
  }

  let parsed = repairJson(rawText);
  
  // If parsing fails, try one repair retry
  if (parsed && parsed.success === false && parsed.errorType === 'AI_PARSE_ERROR') {
      try {
          const repairPrompt = \`Repair this into valid JSON matching this schema. Do not add commentary. Raw Output: \${rawText}\`;
          const repairedText = await callOpenAI(apiKey, model, baseUrl, systemPrompt, repairPrompt, true);
          const repairedParsed = repairJson(repairedText);
          if (repairedParsed && repairedParsed.success !== false) {
              parsed = repairedParsed;
          }
      } catch (e) {
          console.error("JSON Repair retry failed", e);
      }
  }

  if (parsed && parsed.success === false && parsed.errorType === 'AI_PARSE_ERROR') {
      return parsed; // pass the fallback object straight through
  }
  
  if (!parsed) {
     return { success: false, errorType: 'AI_PARSE_ERROR', userMessage: 'Could not parse response from OpenAI.', fallbackText: rawText };
  }
  
  const qg = runQualityGate(parsed, input);
  if (parsed.qualityCheck) { parsed.qualityCheck = qg; } else { parsed.qualityCheck = qg; }
  
  return { success: true, data: parsed };
}`;

content = content.replace(oldGenerate, newGenerate);

fs.writeFileSync('server/ai/adapters/openaiAdapter.js', content, 'utf8');
