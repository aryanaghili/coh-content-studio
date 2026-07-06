import fs from 'fs';

let content = fs.readFileSync('/Users/aryanaghili/.gemini/antigravity/brain/f7550636-30ae-4165-84ab-d592a40650f0/task.md', 'utf8');
content = content.replace(
  "- `[ ]` Standardize hover states, focus rings, and clickable areas across the application.",
  "- `[x]` Standardize hover states, focus rings, and clickable areas across the application."
);
fs.writeFileSync('/Users/aryanaghili/.gemini/antigravity/brain/f7550636-30ae-4165-84ab-d592a40650f0/task.md', content, 'utf8');
