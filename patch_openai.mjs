import fs from 'fs';

let content = fs.readFileSync('server/ai/adapters/openaiAdapter.js', 'utf8');

const regex = /export async function generateImage\(config, input\) \{[\s\S]*?\n\n  console\.log\("Visual Studio image request"/;

const newImplementation = `export async function generateImage(config, input) {
  const { apiKey, baseUrl, imageModel } = config;
  let prompt = input.prompt;
  if (input.operatingCoreInstructions) {
    prompt = \`\${input.operatingCoreInstructions}\\n\\n\${prompt}\`;
  }
  const requestedModel = input.model || imageModel || 'dall-e-3';
  const url = \`\${baseUrl || 'https://api.openai.com'}/v1/images/generations\`;

  const isGPTImage = requestedModel.startsWith('gpt-image');
  
  let reqWidth = input.width || 1024;
  let reqHeight = input.height || 1024;
  let sizeStr = \`\${reqWidth}x\${reqHeight}\`;
  
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

  console.log("Visual Studio image request"`;

content = content.replace(regex, newImplementation);

// We need to also return metadata back from generateImage!
const retRegex = /return \{\n      success: true,\n      images: \[\n        \{\n          url: imageUrl,\n          revised_prompt: /;

const newReturn = `return {
      success: true,
      images: [
        {
          url: imageUrl,
          presetLabel: input.presetId,
          requestedDimensions: \`\${reqWidth}x\${reqHeight}\`,
          returnedDimensions: mappedSizeStr,
          model: requestedModel,
          revised_prompt: `;

content = content.replace(retRegex, newReturn);

fs.writeFileSync('server/ai/adapters/openaiAdapter.js', content, 'utf8');
