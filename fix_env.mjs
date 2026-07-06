import fs from 'fs';

function fixFile(file) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/process\.env\.NODE_ENV === 'development'/g, 'import.meta.env.DEV');
    content = content.replace(/process\.env\.NODE_ENV !== 'production'/g, 'import.meta.env.DEV');
    
    // Fix imports more robustly
    content = content.replace(
      /import React, \{\s*Component,\s*ErrorInfo,\s*ReactNode\s*\} from 'react';/g,
      "import React, { Component } from 'react';\nimport type { ErrorInfo, ReactNode } from 'react';"
    );
    fs.writeFileSync(file, content, 'utf8');
  }
}

fixFile('src/components/ErrorBoundary.tsx');
fixFile('src/ErrorBoundary.tsx');
