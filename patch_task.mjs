import fs from 'fs';

let content = fs.readFileSync('/Users/aryanaghili/.gemini/antigravity/brain/f7550636-30ae-4165-84ab-d592a40650f0/task.md', 'utf8');
content = content.replace(
  "- `[/]` Implement ErrorBoundary for all missing routes (Command Center, Ideation Workspace).\n- `[ ]` Create safe `localStorage` utilities (`src/utils/storage.ts`) and refactor `JSON.parse` usage in `App.tsx`.\n- `[ ]` Implement a robust `ToastProvider` or inline error component to replace `alert()` calls.",
  "- `[x]` Implement ErrorBoundary for all missing routes (Command Center, Ideation Workspace).\n- `[x]` Create safe `localStorage` utilities (`src/utils/storage.ts`) and refactor `JSON.parse` usage in `App.tsx`.\n- `[x]` Implement a robust `ToastProvider` or inline error component to replace `alert()` calls."
);
fs.writeFileSync('/Users/aryanaghili/.gemini/antigravity/brain/f7550636-30ae-4165-84ab-d592a40650f0/task.md', content, 'utf8');
