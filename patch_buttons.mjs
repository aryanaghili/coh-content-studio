import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Ensure Button is imported
if (!content.includes("import { Button }")) {
  content = content.replace(
    /import React, \{ useState, useEffect, useRef, useMemo \} from 'react';/,
    "import React, { useState, useEffect, useRef, useMemo } from 'react';\nimport { Button } from './components/ui/Button';\nimport { Card, CardHeader, CardTitle } from './components/ui/Card';\nimport { Badge } from './components/ui/Badge';"
  );
}

// Replace handleGenerateIdeas button
content = content.replace(
  /<button\s*onClick=\{handleGenerateIdeas\}\s*disabled=\{isIdeating\}\s*className="bg-coh-gold text-coh-navy font-semibold px-4 py-2 rounded flex items-center gap-2 hover:bg-coh-gold\/90 transition-colors disabled:opacity-50"\s*>\s*<Wand2 size=\{16\} \/>\s*\{isIdeating \? 'Generating\.\.\.' : 'Generate'\}\s*<\/button>/g,
  `<Button onClick={handleGenerateIdeas} disabled={isIdeating} icon={<Wand2 size={16} />}>{isIdeating ? 'Generating...' : 'Generate'}</Button>`
);

// Replace handleGenerateDrafts (main)
content = content.replace(
  /<button\s*onClick=\{handleGenerateDrafts\}\s*disabled=\{isGeneratingDrafts\}\s*className="w-full flex items-center justify-center gap-2 bg-coh-gold text-coh-navy font-semibold px-4 py-3 rounded hover:bg-coh-gold\/90 transition-colors disabled:opacity-50"\s*>\s*<Wand2 size=\{16\} \/>\s*\{isGeneratingDrafts \? 'Generating\.\.\.' : 'Generate'\}\s*<\/button>/g,
  `<Button onClick={handleGenerateDrafts} disabled={isGeneratingDrafts} className="w-full py-3 h-auto" size="lg" icon={<Wand2 size={16} />}>{isGeneratingDrafts ? 'Generating...' : 'Generate'}</Button>`
);

// Replace handleGenerateDrafts (again)
content = content.replace(
  /<button\s*onClick=\{handleGenerateDrafts\}\s*disabled=\{isGeneratingDrafts\}\s*className="flex items-center gap-2 px-3 py-1\.5 bg-coh-gold text-coh-navy text-xs font-semibold rounded hover:bg-coh-gold\/90 transition-colors disabled:opacity-50"\s*>\s*<Wand2 size=\{12\} \/>\s*\{isGeneratingDrafts \? 'Generating\.\.\.' : 'Generate Again'\}\s*<\/button>/g,
  `<Button onClick={handleGenerateDrafts} disabled={isGeneratingDrafts} size="sm" icon={<Wand2 size={12} />}>{isGeneratingDrafts ? 'Generating...' : 'Generate Again'}</Button>`
);

// Replace handleGenerateImage
content = content.replace(
  /<button\s*onClick=\{handleGenerateImage\}\s*disabled=\{isGeneratingImage || !visualStudioInput\.trim\(\)\}\s*className="bg-coh-gold text-coh-navy font-semibold px-4 py-2 rounded flex items-center gap-2 hover:bg-coh-gold\/90 transition-colors disabled:opacity-50"\s*>\s*<Camera size=\{16\} \/>\s*\{isGeneratingImage \? 'Generating\.\.\.' : 'Generate'\}\s*<\/button>/g,
  `<Button onClick={handleGenerateImage} disabled={isGeneratingImage || !visualStudioInput.trim()} icon={<Camera size={16} />}>{isGeneratingImage ? 'Generating...' : 'Generate'}</Button>`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
