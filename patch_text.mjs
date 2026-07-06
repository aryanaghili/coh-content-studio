import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<p className="text-sm text-coh-navy/60 font-serif italic mb-3">No active work right now.</p>',
  '<p className="text-sm text-coh-navy/60 font-serif italic mb-3">You don\\'t have an active work item right now. Start a new draft or explore ideas from the options above.</p>'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
