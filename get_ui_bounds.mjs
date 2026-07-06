import fs from 'fs';
const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');
let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("activeTab === 'revision-studio'")) start = i;
  if (lines[i].includes("TAB 4: CONTENT LIBRARY")) { end = i; break; }
}
console.log(start, end);
