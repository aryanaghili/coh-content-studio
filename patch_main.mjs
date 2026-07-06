import fs from 'fs';

let content = fs.readFileSync('src/main.tsx', 'utf8');

if (!content.includes('ToastProvider')) {
  content = content.replace(
    /import App from '\.\/App';/,
    "import App from './App';\nimport { ToastProvider } from './components/ui/Toast';"
  );
  
  content = content.replace(
    /<App \/>/,
    "<ToastProvider>\n      <App />\n    </ToastProvider>"
  );

  fs.writeFileSync('src/main.tsx', content, 'utf8');
}
