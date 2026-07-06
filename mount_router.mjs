import fs from 'fs';

const filePath = 'server.js';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('./server/operatingCore.js')) {
  // Add import
  content = content.replace(
    /import express from 'express';/,
    "import express from 'express';\nimport operatingCoreRouter from './server/operatingCore.js';"
  );
  
  // Mount
  const authMountIdx = content.indexOf('app.use(requireAuth);');
  if (authMountIdx !== -1) {
      const splitIdx = content.indexOf('\n', authMountIdx) + 1;
      content = content.substring(0, splitIdx) + "\napp.use('/api/operating-core', operatingCoreRouter);\n" + content.substring(splitIdx);
  } else {
      // Fallback
      content += "\napp.use('/api/operating-core', operatingCoreRouter);\n";
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Router mounted.");
} else {
  console.log("Router already mounted.");
}
