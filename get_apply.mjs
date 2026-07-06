import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');
let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const applyRevision = async (action: string) => {")) start = i;
  if (start !== -1 && lines[i].includes("  // --- Prompt Builder Compiler ---")) { end = i; break; }
}
console.log(start, end);
