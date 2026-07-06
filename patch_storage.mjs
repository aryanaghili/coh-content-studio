import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import for safeRead
if (!content.includes('safeRead')) {
  content = content.replace(
    "import { safeMergeOperatingCore } from './lib/operatingCore';",
    "import { safeMergeOperatingCore } from './lib/operatingCore';\nimport { safeRead } from './lib/storage';"
  );
}

// 1. Update Operating Core
content = content.replace(
  /const saved = localStorage\.getItem\('coh_operating_core_v1'\);\n\s*if \(saved\) \{\n\s*try \{\n\s*setOperatingCore\(safeMergeOperatingCore\(JSON\.parse\(saved\)\)\);\n\s*\} catch \(err\) \{\n\s*console\.error\("Failed to parse core", err\);\n\s*\}\n\s*\}/g,
  "setOperatingCore(safeMergeOperatingCore(safeRead('coh_operating_core_v1', {})));"
);
content = content.replace(
  /const saved = localStorage\.getItem\('coh_operating_core_v1'\);\n\s*if \(saved\) setOperatingCore\(safeMergeOperatingCore\(JSON\.parse\(saved\)\)\);/g,
  "setOperatingCore(safeMergeOperatingCore(safeRead('coh_operating_core_v1', {})));"
);


// 2. Update Sources
// const local = localStorage.getItem('coh_sources_v11');
// if (local) return JSON.parse(local);
// return DEFAULT_COH_SOURCES.map...
const oldSources = `  const [sources, setSources] = useState<SourceFile[]>(() => {
    const local = localStorage.getItem('coh_sources_v11');
    if (local) return JSON.parse(local);
    return DEFAULT_COH_SOURCES.map(s => ({
      ...s,
      type: s.title.includes('Facts') ? 'Approved Example' : 'Tone of Voice',
      status: 'Active' as const,
    }));
  });`;
  
const newSources = `  const [sources, setSources] = useState<SourceFile[]>(() => {
    const local = safeRead<SourceFile[] | null>('coh_sources_v11', null);
    if (local) return local;
    return DEFAULT_COH_SOURCES.map(s => ({
      ...s,
      type: s.title.includes('Facts') ? 'Approved Example' : 'Tone of Voice',
      status: 'Active' as const,
    }));
  });`;
content = content.replace(oldSources, newSources);

// 3. Update Saved Content
const oldSavedContent = `  const [savedContent, setSavedContent] = useState<SavedItem[]>(() => {
    const local = localStorage.getItem('coh_saved_content_v11');
    if (local) return JSON.parse(local);
    return [];
  });`;
const newSavedContent = `  const [savedContent, setSavedContent] = useState<SavedItem[]>(() => {
    return safeRead<SavedItem[]>('coh_saved_content_v11', []);
  });`;
content = content.replace(oldSavedContent, newSavedContent);

// 4. Update Active Work Item
const oldActiveWorkItem = `  const [activeWorkItem, setActiveWorkItem] = useState<any>(() => {
    const local = localStorage.getItem('coh_active_work_item_v1');
    if (local) return JSON.parse(local);
    return null;
  });`;
const newActiveWorkItem = `  const [activeWorkItem, setActiveWorkItem] = useState<any>(() => {
    return safeRead<any>('coh_active_work_item_v1', null);
  });`;
content = content.replace(oldActiveWorkItem, newActiveWorkItem);

// 5. Update Saved Ideas
const oldSavedIdeas = `  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>(() => {
    const local = localStorage.getItem('coh_saved_ideas_v1');
    if (local) return JSON.parse(local);
    return [];
  });`;
const newSavedIdeas = `  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>(() => {
    return safeRead<SavedIdea[]>('coh_saved_ideas_v1', []);
  });`;
content = content.replace(oldSavedIdeas, newSavedIdeas);

fs.writeFileSync('src/App.tsx', content, 'utf8');

