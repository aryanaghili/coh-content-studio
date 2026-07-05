import re

with open('server/ai/adapters/openaiAdapter.js', 'r') as f:
    content = f.read()

new_logic = """
  if (isGPTImage) {
    const q = input.quality === 'hd' ? 'high' : (input.quality || 'high');
    const supportedQualities = ['low', 'medium', 'high', 'auto'];
    if (supportedQualities.includes(q)) requestBody.quality = q;
  } else if (requestedModel.startsWith('dall-e-3')) {
    requestBody.response_format = 'b64_json';
    requestBody.quality = input.quality === 'hd' ? 'hd' : 'standard';
    // dall-e-3 only supports 1024x1024, 1024x1792, 1792x1024. Map others to nearest.
    if (!['1024x1024', '1024x1792', '1792x1024'].includes(size)) {
       requestBody.size = '1024x1024';
    }
  } else if (requestedModel.startsWith('dall-e-2')) {
    requestBody.response_format = 'b64_json';
    // dall-e-2 doesn't support hd quality
    if (size !== '256x256' && size !== '512x512' && size !== '1024x1024') {
        requestBody.size = '1024x1024'; // fallback
    }
  } else {
    // Other models might not support response_format or quality
    if (input.quality === 'hd') requestBody.quality = 'hd';
  }
"""

content = re.sub(
    r'  if \(isGPTImage\) \{.*?requestBody\.quality = input\.quality === \'hd\' \? \'hd\' : \'standard\';\n  \}',
    new_logic,
    content,
    flags=re.DOTALL
)

with open('server/ai/adapters/openaiAdapter.js', 'w') as f:
    f.write(content)

print("Step 11a: Fixed OpenAI Adapter image logic.")
