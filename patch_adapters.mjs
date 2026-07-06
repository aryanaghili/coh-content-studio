import fs from 'fs';

function patchAdapter(file, name) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    const searchStr = `export async function generate(config, input) {`;
    const endStr = `return parsed;\n}`;
    
    // Quick regex to capture the current generate body
    const generateRegex = /export async function generate\(config, input\) \{[\s\S]*?return parsed;\n\}/;
    const match = content.match(generateRegex);
    
    if (!match) {
        console.warn('Could not find generate function in ' + file);
        return;
    }
    
    const callFunctionName = name === 'gemini' ? 'callGemini' : 
                             name === 'anthropic' ? 'callAnthropic' :
                             name === 'mistral' ? 'callMistral' : 'callOpenRouter';
                             
    let promptSetup = "";
    if (name === 'gemini') {
        promptSetup = `const prompt = 'Always return valid JSON matching the requested schema exactly. Never include markdown codeblock wrappers.\\n\\n' + buildGenerationPrompt(input);`;
    } else {
        promptSetup = `const prompt = buildGenerationPrompt(input);\n  const systemPrompt = 'You are an expert content strategist. Always return valid JSON matching the requested schema exactly. Never include markdown codeblock wrappers. Return only raw JSON.';`;
    }
    
    let callStatement = "";
    if (name === 'gemini') {
        callStatement = `rawText = await callGemini(apiKey, model, prompt);`;
    } else {
        callStatement = `rawText = await ${callFunctionName}(apiKey, model, baseUrl, systemPrompt, prompt, true);`;
    }
    
    let retryCallStatement = "";
    if (name === 'gemini') {
        retryCallStatement = `const repairedText = await callGemini(apiKey, model, repairPrompt);`;
    } else {
        retryCallStatement = `const repairedText = await ${callFunctionName}(apiKey, model, baseUrl, systemPrompt, repairPrompt, true);`;
    }

    const newGenerate = `export async function generate(config, input) {
  const { apiKey, baseUrl } = config;
  const model = config.textModel || config.model;
  if (!model) return { success: false, errorType: 'CONFIGURATION_ERROR', userMessage: 'Text model is missing from generation request.' };
  
  ${promptSetup}
  
  let rawText;
  try {
    ${callStatement}
  } catch (err) {
    return { success: false, errorType: 'PROVIDER_ERROR', userMessage: friendlyError(err), debug: { message: err.message } };
  }

  let parsed = repairJson(rawText);
  
  // Retry logic
  if (parsed && parsed.success === false && parsed.errorType === 'AI_PARSE_ERROR') {
      try {
          const repairPrompt = \`Repair this into valid JSON matching this schema. Do not add commentary. Raw Output: \${rawText}\`;
          ${retryCallStatement}
          const repairedParsed = repairJson(repairedText);
          if (repairedParsed && repairedParsed.success !== false) {
              parsed = repairedParsed;
          }
      } catch (e) {
          console.error("JSON Repair retry failed for ${name}", e);
      }
  }

  if (parsed && parsed.success === false && parsed.errorType === 'AI_PARSE_ERROR') {
      return parsed; // pass the fallback object straight through
  }
  
  if (!parsed) {
     return { success: false, errorType: 'AI_PARSE_ERROR', userMessage: 'Could not parse response from ${name}.', fallbackText: rawText };
  }
  
  const qg = runQualityGate(parsed, input);
  if (parsed.qualityCheck) { parsed.qualityCheck = qg; } else { parsed.qualityCheck = qg; }
  
  return { success: true, data: parsed };
}`;

    content = content.replace(match[0], newGenerate);
    fs.writeFileSync(file, content, 'utf8');
}

patchAdapter('server/ai/adapters/geminiAdapter.js', 'gemini');
patchAdapter('server/ai/adapters/anthropicAdapter.js', 'anthropic');
patchAdapter('server/ai/adapters/mistralAdapter.js', 'mistral');
patchAdapter('server/ai/adapters/openrouterAdapter.js', 'openrouter');

