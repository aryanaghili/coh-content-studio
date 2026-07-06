import fs from 'fs';

let content = fs.readFileSync('src/index.css', 'utf8');

content = content.replace('@apply w-full max-w-6xl mx-auto space-y-8 animate-fadeIn;', '@apply w-full max-w-6xl mx-auto space-y-8;');
content = content.replace('@apply w-full max-w-4xl mx-auto space-y-8 animate-fadeIn;', '@apply w-full max-w-4xl mx-auto space-y-8;');

fs.writeFileSync('src/index.css', content, 'utf8');
console.log("Fixed CSS build");
