import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Patch Command Center
content = content.replace(
  /{activeTab === 'command-center' && \(\s*<div className="space-y-8 animate-fadeIn max-w-6xl">/,
  "{activeTab === 'command-center' && (<ErrorBoundary fallbackTitle=\"Command Center Error\">\n          <div className=\"space-y-8 animate-fadeIn max-w-6xl\">"
);

// We need to find the end of command center. It ends right before activeTab === 'ideation-workspace'.
// A safer way is to use a regex or string replacement that matches the end.
