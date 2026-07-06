import fs from 'fs';

let main = fs.readFileSync('src/main.tsx', 'utf8');
if (!main.includes("import { ToastProvider }")) {
  main = "import { ToastProvider } from './components/ui/Toast';\n" + main;
  fs.writeFileSync('src/main.tsx', main, 'utf8');
}

let app = fs.readFileSync('src/App.tsx', 'utf8');
if (!app.includes("import { safeLocalStorageGet")) {
  app = "import { safeLocalStorageGet, safeLocalStorageSet } from './utils/storage';\n" + app;
  fs.writeFileSync('src/App.tsx', app, 'utf8');
}

let toast = fs.readFileSync('src/components/ui/Toast.tsx', 'utf8');
toast = toast.replace(
  "import React, { createContext, useContext, useState, ReactNode } from 'react';",
  "import React, { createContext, useContext, useState } from 'react';\nimport type { ReactNode } from 'react';"
);
fs.writeFileSync('src/components/ui/Toast.tsx', toast, 'utf8');
