import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('const [authError, setAuthError]')) {
  content = content.replace(
    "export function App() {",
    "export function App() {\n  const [authError, setAuthError] = useState('');"
  );
  fs.writeFileSync('src/App.tsx', content, 'utf8');
}
