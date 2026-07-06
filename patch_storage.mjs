import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes("import { safeLocalStorageGet, safeLocalStorageSet } from './utils/storage';")) {
  content = content.replace(
    /import React, { useState, useEffect, useRef, useMemo } from 'react';/,
    "import React, { useState, useEffect, useRef, useMemo } from 'react';\nimport { safeLocalStorageGet, safeLocalStorageSet } from './utils/storage';"
  );
}

// Replace coh_sources_v11
content = content.replace(
  /const local = localStorage.getItem\('coh_sources_v11'\);\n\s*if \(local\) return JSON.parse\(local\);\n\s*return \[\];/g,
  "return safeLocalStorageGet('coh_sources_v11', []);"
);

// Replace coh_saved_content_v11
content = content.replace(
  /const local = localStorage.getItem\('coh_saved_content_v11'\);\n\s*if \(!local\) return \[\];\n\s*try \{\n\s*const parsed = JSON.parse\(local\) as SavedContent\[\];\n\s*return parsed.map\(item => \{\n\s*if \(!item.createdAt\) item.createdAt = new Date\(\).toISOString\(\);\n\s*if \(!item.status\) item.status = 'Draft';\n\s*return item;\n\s*\}\);\n\s*\} catch \(e\) \{\n\s*console.error\("Failed to parse saved content", e\);\n\s*return \[\];\n\s*\}/g,
  `const parsed = safeLocalStorageGet<SavedContent[]>('coh_saved_content_v11', []);
    return parsed.map(item => {
      if (!item.createdAt) item.createdAt = new Date().toISOString();
      if (!item.status) item.status = 'Draft';
      return item;
    });`
);

// Replace coh_active_work_item_v1
content = content.replace(
  /const local = localStorage.getItem\('coh_active_work_item_v1'\);\n\s*if \(local\) \{\n\s*try \{\n\s*return JSON.parse\(local\) as WorkItem;\n\s*\} catch \(e\) \{\n\s*console.error\("Failed to parse active work item", e\);\n\s*\}\n\s*\}/g,
  "const parsed = safeLocalStorageGet<WorkItem | null>('coh_active_work_item_v1', null);\n    if (parsed) return parsed;"
);

// Replace coh_saved_ideas_v1
content = content.replace(
  /const local = localStorage.getItem\('coh_saved_ideas_v1'\);\n\s*if \(local\) return JSON.parse\(local\);\n\s*return \[\];/g,
  "return safeLocalStorageGet('coh_saved_ideas_v1', []);"
);

// Replace setItems
content = content.replace(/localStorage.setItem\(/g, "safeLocalStorageSet(");

fs.writeFileSync('src/App.tsx', content, 'utf8');
