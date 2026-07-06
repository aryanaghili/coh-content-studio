import fs from 'fs';

let content = fs.readFileSync('/Users/aryanaghili/.gemini/antigravity/brain/f7550636-30ae-4165-84ab-d592a40650f0/task.md', 'utf8');
content = content.replace(
  "- `[ ]` Extract core UI components (`Button`, `Card`, `Badge`) to `./src/components/ui/`.",
  "- `[x]` Extract core UI components (`Button`, `Card`, `Badge`) to `./src/components/ui/`."
);
fs.writeFileSync('/Users/aryanaghili/.gemini/antigravity/brain/f7550636-30ae-4165-84ab-d592a40650f0/task.md', content, 'utf8');
