import fs from 'fs';

let content = fs.readFileSync('server.js', 'utf8');

content = content.replace(
  'const { prompt, promptBuildMode, aspectRatio, visualStyle, visualBrief, inputMode, provider, model } = req.body;',
  'const { prompt, promptBuildMode, aspectRatio, presetId, width, height, visualStyle, visualBrief, inputMode, provider, model } = req.body;'
);

content = content.replace(
  `const generateInput = {
      ...req.body,
      prompt: finalCompiledPrompt,
      quality: req.body.quality || 'high'
    };`,
  `const generateInput = {
      ...req.body,
      presetId, width, height,
      prompt: finalCompiledPrompt,
      quality: req.body.quality || 'high'
    };`
);

fs.writeFileSync('server.js', content, 'utf8');
