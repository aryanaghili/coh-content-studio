import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace ideation-workspace start
content = content.replace(
  /{activeTab === 'ideation-workspace' && \(\s*<div className="space-y-8 animate-fadeIn max-w-6xl">/,
  `{activeTab === 'ideation-workspace' && (<ErrorBoundary fallbackTitle="Ideation Workspace Error">\n          <div className="space-y-8 animate-fadeIn max-w-6xl">`
);

// We need to replace the closing brace of ideation-workspace.
// Looking at the grep output, it ends at line 4731 with `        )}` just before `idea-library`
content = content.replace(
  /        \)\}\n        \{activeTab === 'idea-library' && \(\<ErrorBoundary fallbackTitle="Idea Library Error"\>/,
  `        </ErrorBoundary>)}\n        {activeTab === 'idea-library' && (<ErrorBoundary fallbackTitle="Idea Library Error">`
);

// Replace command-center start
content = content.replace(
  /{activeTab === 'command-center' && \(\s*<div className="space-y-8 animate-fadeIn max-w-6xl">/,
  `{activeTab === 'command-center' && (<ErrorBoundary fallbackTitle="Command Center Error">\n          <div className="space-y-8 animate-fadeIn max-w-6xl">`
);

// Replace command-center end
content = content.replace(
  /        \)\}\n        \{\/\* --- TAB 2: CONTENT WORKSPACE --- \*\/\}\n        \{activeTab === 'content-workspace' && \(\<ErrorBoundary fallbackTitle="Content Workspace Error"\>/,
  `        </ErrorBoundary>)}\n        {/* --- TAB 2: CONTENT WORKSPACE --- */}\n        {activeTab === 'content-workspace' && (<ErrorBoundary fallbackTitle="Content Workspace Error">`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
