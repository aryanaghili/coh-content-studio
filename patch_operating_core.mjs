import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// The file has multiple occurrences of this pattern:
// const saved = localStorage.getItem('coh_operating_core_v1');
// if (saved) { try { setOperatingCore(safeMergeOperatingCore(JSON.parse(saved))); } catch (e) { ... } }

content = content.replace(
  /const saved = localStorage.getItem\('coh_operating_core_v1'\);\n\s*if \(saved\) \{\n\s*try \{\n\s*setOperatingCore\(safeMergeOperatingCore\(JSON.parse\(saved\)\)\);\n\s*\} catch \(e\) \{ console.error\('Failed to parse local core'\); \}\n\s*\}/g,
  "const parsed = safeLocalStorageGet<any>('coh_operating_core_v1', null);\n          if (parsed) {\n            setOperatingCore(safeMergeOperatingCore(parsed));\n          }"
);

// There is one more occurrence with normalizer:
content = content.replace(
  /const saved = localStorage.getItem\('coh_operating_core_v1'\);\n\s*if \(saved\) \{\n\s*try \{\n\s*const parsed = JSON.parse\(saved\);/g,
  "const parsed = safeLocalStorageGet<any>('coh_operating_core_v1', null);\n    if (parsed) {\n      try {"
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
