const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add states
const stateStr = `  const [vsAvoid, setVsAvoid] = useState<string>('');
  const [vsAIPrompt, setVsAIPrompt] = useState<string>('');
  const [vsNotes, setVsNotes] = useState<string>('');
  const [vsPromptMode, setVsPromptMode] = useState<'Full' | 'AI Only' | 'Full + AI' | 'Manual Only'>('Full + AI');`;
  
const newStateStr = `  const [vsAvoid, setVsAvoid] = useState<string>('');
  const [vsNegativePrompt, setVsNegativePrompt] = useState<string>('');
  const [vsAIPrompt, setVsAIPrompt] = useState<string>('');
  const [vsNotes, setVsNotes] = useState<string>('');
  const [vsTextContent, setVsTextContent] = useState<string>('');
  const [vsAttribution, setVsAttribution] = useState<string>('');
  const [vsRawImportedDirection, setVsRawImportedDirection] = useState<string>('');
  const [vsImportValidation, setVsImportValidation] = useState<{ total: number, recognized: number, missing: string[] } | null>(null);
  const [vsPromptMode, setVsPromptMode] = useState<'Full' | 'AI Only' | 'Full + AI' | 'Manual Only'>('Full + AI');`;
  
content = content.replace(stateStr, newStateStr);

// 2. Replace handleSendToVisualStudio
const regexStart = content.indexOf('  // --- Visual Studio Logic ---');
const regexEnd = content.indexOf('  const handleGenerateImage = async () => {');
if (regexStart !== -1 && regexEnd !== -1) {
  const newParser = `  // --- Visual Studio Logic ---
  const handleSendToVisualStudio = (item: any, rawDirection: string, type: 'Idea' | 'Content' | 'Library') => {
    // Preserve existing item state
    setVsSourceItem({ id: item.id, title: item.title || item.originalInput || 'Untitled', type });
    setVsRawImportedDirection(rawDirection);
    
    // Check if it's already a canonical object vs raw string
    let parsedFields: any = {};
    if (typeof rawDirection === 'object' && rawDirection !== null) {
       parsedFields = rawDirection; // Assume it's already structured
    } else {
       // Legacy String Parser
       let text = (rawDirection || '').replace(/\\r\\n/g, '\\n');
       
       const fields = {
          visualConcept: '', formatRecommendation: '', moodAtmosphere: '', composition: '',
          colorMaterialDirection: '', typographyLayout: '', keyVisualElements: '', whatToAvoid: '',
          aiImagePrompt: '', negativePrompt: '', designerNotes: ''
       };
       
       const headingPatterns = [
          { key: 'visualConcept', pattern: /^(?:#+\\s*|\\*?\\*\\s*|-?\\s*\\*\\*)?Visual Concept\\b[*:_]*$/i },
          { key: 'formatRecommendation', pattern: /^(?:#+\\s*|\\*?\\*\\s*|-?\\s*\\*\\*)?(?:Format Recommendation|Format(?:s)?\\b)[*:_]*$/i },
          { key: 'moodAtmosphere', pattern: /^(?:#+\\s*|\\*?\\*\\s*|-?\\s*\\*\\*)?Mood(?:\\s*(?:[\\/&]|and)\\s*Atmosphere)?\\b[*:_]*$/i },
          { key: 'composition', pattern: /^(?:#+\\s*|\\*?\\*\\s*|-?\\s*\\*\\*)?Composition\\b[*:_]*$/i },
          { key: 'colorMaterialDirection', pattern: /^(?:#+\\s*|\\*?\\*\\s*|-?\\s*\\*\\*)?Color(?:\\s*(?:[\\/&]|and)\\s*Material\\b.*?)?[*:_]*$/i },
          { key: 'typographyLayout', pattern: /^(?:#+\\s*|\\*?\\*\\s*|-?\\s*\\*\\*)?Typography(?:\\s*(?:[\\/&]|and)\\s*Layout)?\\b[*:_]*$/i },
          { key: 'keyVisualElements', pattern: /^(?:#+\\s*|\\*?\\*\\s*|-?\\s*\\*\\*)?(?:Key )?Visual Elements\\b[*:_]*$/i },
          { key: 'whatToAvoid', pattern: /^(?:#+\\s*|\\*?\\*\\s*|-?\\s*\\*\\*)?(?:What to )?Avoid\\b[*:_]*$/i },
          { key: 'aiImagePrompt', pattern: /^(?:#+\\s*|\\*?\\*\\s*|-?\\s*\\*\\*)?AI Image Prompt\\b[*:_]*$/i },
          { key: 'negativePrompt', pattern: /^(?:#+\\s*|\\*?\\*\\s*|-?\\s*\\*\\*)?Negative Prompt\\b[*:_]*$/i },
          { key: 'designerNotes', pattern: /^(?:#+\\s*|\\*?\\*\\s*|-?\\s*\\*\\*)?Designer Notes\\b[*:_]*$/i }
       ];
       
       const lines = text.split('\\n');
       let currentField = null;
       
       for (let line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          
          let isHeadingLine = false;
          
          for (const { key, pattern } of headingPatterns) {
             if (pattern.test(trimmed)) {
                currentField = key;
                isHeadingLine = true;
                break;
             }
             
             // Regex for inline value like "**Visual Concept**: value"
             const inlineMatch = trimmed.match(/^(?:#+\\s*|\\*?\\*\\s*|-?\\s*\\*\\*)?(Visual Concept|Format Recommendation|Format|Mood(?:\\s*(?:[\\/&]|and)\\s*Atmosphere)?|Composition|Color(?:\\s*(?:[\\/&]|and)\\s*Material.*?)?|Typography(?:\\s*(?:[\\/&]|and)\\s*Layout)?|(?:Key )?Visual Elements|(?:What to )?Avoid|AI Image Prompt|Negative Prompt|Designer Notes)[*:_]+\\s*(.*)$/i);
             
             if (inlineMatch && inlineMatch[1]) {
                for (const hp of headingPatterns) {
                   if (hp.pattern.test(inlineMatch[1])) {
                      currentField = hp.key;
                      const val = inlineMatch[2].trim();
                      if (val) {
                         fields[currentField] += (fields[currentField] ? '\\n' : '') + val.replace(/^["'\\-\\*\s]+/, '').replace(/["'\\-\\*\s]+$/, '');
                      }
                      isHeadingLine = true;
                      break;
                   }
                }
                if (isHeadingLine) break;
             }
          }
          
          if (!isHeadingLine && currentField) {
             const cleaned = trimmed.replace(/^[\\*\\-\\s]+/, ''); // Strip leading bullets
             if (cleaned) {
                fields[currentField] += (fields[currentField] ? '\\n' : '') + cleaned;
             }
          }
       }
       parsedFields = fields;
    }
    
    // Determine Validation State
    const requiredFields = ['visualConcept', 'moodAtmosphere', 'composition', 'colorMaterialDirection', 'keyVisualElements'];
    const optionalFields = ['formatRecommendation', 'typographyLayout', 'whatToAvoid', 'aiImagePrompt', 'negativePrompt', 'designerNotes'];
    
    const allExpected = [...requiredFields, ...optionalFields];
    let recognized = 0;
    const missing: string[] = [];
    
    for (const f of allExpected) {
      if (parsedFields[f] && parsedFields[f].trim().length > 0) recognized++;
      else missing.push(f);
    }
    
    // Map parsed structured fields safely to React State
    setVsConcept(parsedFields.visualConcept || '');
    setVsFormat(parsedFields.formatRecommendation || parsedFields.format || '');
    setVsMood(parsedFields.moodAtmosphere || '');
    setVsComposition(parsedFields.composition || '');
    setVsPalette(parsedFields.colorMaterialDirection || '');
    setVsTypography(parsedFields.typographyLayout || '');
    setVsElements(parsedFields.keyVisualElements || '');
    setVsAvoid(parsedFields.whatToAvoid || '');
    setVsAIPrompt(parsedFields.aiImagePrompt || '');
    setVsNegativePrompt(parsedFields.negativePrompt || '');
    setVsNotes(parsedFields.designerNotes || '');
    
    setVsTextContent(parsedFields.textContent || '');
    setVsAttribution(parsedFields.attribution || '');
    
    setVsImportValidation({ total: allExpected.length, recognized, missing });
    
    setVsInputMode('Imported');
    setVsPromptMode('Full + AI');
    setActiveTab('visual-studio');
  };

`;
  content = content.substring(0, regexStart) + newParser + content.substring(regexEnd);
}

fs.writeFileSync(file, content, 'utf8');
