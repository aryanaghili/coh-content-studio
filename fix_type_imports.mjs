import fs from 'fs';

function fixFile(file) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
      "import React, { Component, ErrorInfo, ReactNode } from 'react';",
      "import React, { Component } from 'react';\nimport type { ErrorInfo, ReactNode } from 'react';"
    );
    // Fix process error (since process isn't in @types/node we can just use // @ts-ignore)
    content = content.replace("if (process.env.NODE_ENV", "// @ts-ignore\n    if (process.env.NODE_ENV");
    fs.writeFileSync(file, content, 'utf8');
  }
}

fixFile('src/components/ErrorBoundary.tsx');
fixFile('src/ErrorBoundary.tsx');
