import { repairJson } from '../jsonRepair.js';
import { buildGenerationPrompt } from '../promptBuilder.js';
import { runQualityGate } from '../qualityGate.js';

async function callOpenAI(apiKey, model, baseUrl, systemPrompt, userPrompt, jsonMode = true) {
  const url = `${baseUrl || 'https://api.openai.com'}/v1/chat/completions`;
  
  const payload = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8,
  };
  
  if (jsonMode && (model.startsWith('gpt-4') || model.startsWith('gpt-3.5'))) {
    payload.response_format = { type: 'json_object' };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

export async function generate(config, input) {
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
}

export async function compileImagePrompt(config, systemPrompt, userPrompt) {
  const { apiKey, baseUrl } = config;
  const model = config.textModel || config.model || 'gpt-4o';
  // Use a capable text model for this
  const compileModel = model.startsWith('gpt-image') || model.startsWith('dall-e') ? 'gpt-4o' : model;
  const rawText = await callOpenAI(apiKey, compileModel, baseUrl, systemPrompt, userPrompt, false);
  return rawText;
}

export async function testConnection(config) {
  const { apiKey, baseUrl } = config;
  const model = config.textModel || config.model;
  if (!model) return { connected: false, provider: 'openai', error: 'Text model is missing.' };
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
  
  if (msg.includes('insufficient_quota') || msg.includes('billing_hard_limit_reached')) {
    return 'Billing or quota limit reached. Check the OpenAI billing/project limits.';
  }
  if (msg.includes('401') || msg.includes('invalid_api_key')) {
    return 'API key is invalid or unauthorized.';
  }
  if (msg.includes('404') || msg.includes('model_not_found')) {
    return 'Selected model is not available for this API key.';
  }
  if (msg.includes('429') || msg.includes('rate_limit_exceeded')) {
    return 'Rate limit reached. Wait a moment and try again.';
  }
  if (msg.includes('fetch')) {
    return 'Network error. Could not reach OpenAI.';
  }
  
  return msg.substring(0, 150);
}

export async function generateImage(config, input) {
  const { apiKey, baseUrl, imageModel } = config;
  let prompt = input.prompt;
  if (input.operatingCoreInstructions) {
    prompt = `${input.operatingCoreInstructions}\n\n${prompt}`;
  }
  const requestedModel = input.model || imageModel || 'dall-e-3';
  const url = `${baseUrl || 'https://api.openai.com'}/v1/images/generations`;

  const isGPTImage = requestedModel.startsWith('gpt-image');
  
  let reqWidth = input.width || 1024;
  let reqHeight = input.height || 1024;
  let sizeStr = `${reqWidth}x${reqHeight}`;
  
  let mappedWidth = reqWidth;
  let mappedHeight = reqHeight;
  let mappedSizeStr = sizeStr;
  
  let requestBody = {
    model: requestedModel,
    prompt: prompt,
    n: 1
  };

  // Validation & Mapping
  if (isGPTImage) {
    // Exact sizing validation for GPT Image 2
    if (reqWidth % 16 !== 0 || reqHeight % 16 !== 0) {
      throw new Error("Width and height must be multiples of 16.");
    }
    const maxEdge = Math.max(reqWidth, reqHeight);
    const minEdge = Math.min(reqWidth, reqHeight);
    if (maxEdge > 3840) {
      throw new Error("The maximum dimension cannot exceed 3840 pixels.");
    }
    if (maxEdge / minEdge > 3) {
      throw new Error("The longest side cannot be more than 3x the shortest side.");
    }
    const totalPixels = reqWidth * reqHeight;
    // We assume pixels are within valid range for gpt-image-2
    
    requestBody.size = sizeStr;
    const q = input.quality === 'hd' ? 'high' : (input.quality || 'high');
    const supportedQualities = ['low', 'medium', 'high', 'auto'];
    if (supportedQualities.includes(q)) requestBody.quality = q;
    
  } else if (requestedModel.startsWith('dall-e-3')) {
    requestBody.response_format = 'b64_json';
    requestBody.quality = input.quality === 'hd' ? 'hd' : 'standard';
    
    // DALL-E 3 only supports 1024x1024, 1024x1792, 1792x1024
    if (reqWidth === reqHeight) {
       mappedSizeStr = '1024x1024';
    } else if (reqWidth > reqHeight) {
       mappedSizeStr = '1792x1024';
    } else {
       mappedSizeStr = '1024x1792';
    }
    requestBody.size = mappedSizeStr;
    
  } else if (requestedModel.startsWith('dall-e-2')) {
    requestBody.response_format = 'b64_json';
    // DALL-E 2 only supports square sizes
    mappedSizeStr = '1024x1024';
    requestBody.size = mappedSizeStr;
  } else {
    requestBody.size = sizeStr;
    if (input.quality === 'hd') requestBody.quality = 'hd';
  }

  console.log("Visual Studio image request", {
    selectedAspectRatio: input.aspectRatio,
    mappedSize: size,
    provider: 'openai',
    model: requestedModel,
    quality: requestBody.quality,
    response_format: requestBody.response_format,
    requestKeys: Object.keys(requestBody)
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const err = await res.text();
    let cleanErr = err;
    try {
      const parsedErr = JSON.parse(err);
      if (parsedErr.error && parsedErr.error.message) {
        cleanErr = parsedErr.error.message;
      }
    } catch (e) {}

    let userFriendlyErr = cleanErr;
    if (cleanErr.includes('response_format')) {
      userFriendlyErr = 'Image generation failed because the selected model does not support response_format.';
    } else if (cleanErr.includes('quality value')) {
      userFriendlyErr = 'Image generation failed because the selected model does not support quality value hd.';
    } else if (cleanErr.includes('model')) {
      userFriendlyErr = 'The selected image model is unavailable for this API key. Choose another image model.';
    }
    
    throw new Error(JSON.stringify({
      isProviderError: true,
      message: userFriendlyErr,
      debug: {
        provider: 'openai',
        model: requestedModel,
        size: requestBody.size,
        requestKeys: Object.keys(requestBody)
      }
    }));
  }

  const data = await res.json();
  const imageData = data.data?.[0];
  
  if (imageData?.b64_json) {
    return [`data:image/png;base64,${imageData.b64_json}`];
  } else if (imageData?.url) {
    return [imageData.url];
  } else {
    throw new Error('Failed to extract image data from response. Missing url or b64_json.');
  }
}

