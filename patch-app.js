const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldCode = `  // --- Visual Studio Logic ---
  const handleSendToVisualStudio = (item: any, rawDirection: string, type: 'Idea' | 'Content' | 'Library') => {
    setVsSourceItem({ id: item.id, title: item.title || item.originalInput || 'Untitled', type });
    
    // Attempt basic parsing
    const conceptMatch = rawDirection.match(/Concept:\\s*(.*?)(?=\\n-|$)/i);
    const formatMatch = rawDirection.match(/Recommendation:\\s*(.*?)(?=\\n-|$)/i) || rawDirection.match(/Format:\\s*(.*?)(?=\\n-|$)/i);
    const moodMatch = rawDirection.match(/Mood.*?:\\s*(.*?)(?=\\n-|$)/i);
    const compMatch = rawDirection.match(/Composition:\\s*(.*?)(?=\\n-|$)/i);
    const colorMatch = rawDirection.match(/Color.*?:\\s*(.*?)(?=\\n-|$)/i);
    const typoMatch = rawDirection.match(/Typography.*?:\\s*(.*?)(?=\\n-|$)/i);
    const elMatch = rawDirection.match(/Key.*?Elements:\\s*(.*?)(?=\\n-|$)/i);
    const avoidMatch = rawDirection.match(/Avoid:\\s*(.*?)(?=\\n-|$)/i);
    const aiMatch = rawDirection.match(/AI Image Prompt:\\s*(.*?)(?=\\n-|$)/i);
    const notesMatch = rawDirection.match(/Designer Notes:\\s*(.*?)(?=\\n-|$)/i);

    setVsConcept(conceptMatch ? conceptMatch[1].trim() : rawDirection);
    setVsFormat(formatMatch ? formatMatch[1].trim() : '');
    setVsMood(moodMatch ? moodMatch[1].trim() : '');
    setVsComposition(compMatch ? compMatch[1].trim() : '');
    setVsPalette(colorMatch ? colorMatch[1].trim() : '');
    setVsTypography(typoMatch ? typoMatch[1].trim() : '');
    setVsElements(elMatch ? elMatch[1].trim() : '');
    setVsAvoid(avoidMatch ? avoidMatch[1].trim() : '');
    setVsAIPrompt(aiMatch ? aiMatch[1].trim() : '');
    setVsNotes(notesMatch ? notesMatch[1].trim() : '');`;

const newCode = `  // --- Visual Studio Logic ---
  const handleSendToVisualStudio = (item: any, rawDirection: string, type: 'Idea' | 'Content' | 'Library') => {
    setVsSourceItem({ id: item.id, title: item.title || item.originalInput || 'Untitled', type });
    
    // Strip markdown bolding to make matching robust
    const cleanDir = rawDirection.replace(/\\*\\*/g, '');
    
    // Helper to extract by key, stopping at the next key or end of string
    const extract = (keyPattern: string) => {
      const regex = new RegExp(\`\${keyPattern}:\\\\s*([\\\\s\\\\S]*?)(?=\\\\n-?\\\\s*[A-Z][a-zA-Z\\\\s/]*:|$)\`, 'i');
      const match = cleanDir.match(regex);
      return match ? match[1].trim() : '';
    };

    const conceptMatch = extract('Concept');
    const formatMatch = extract('Recommendation') || extract('Format');
    const moodMatch = extract('Mood.*?');
    const compMatch = extract('Composition');
    const colorMatch = extract('Color.*?');
    const typoMatch = extract('Typography.*?');
    const elMatch = extract('Key.*?Elements');
    const avoidMatch = extract('Avoid');
    const aiMatch = extract('AI Image Prompt');
    const notesMatch = extract('Designer Notes');

    setVsConcept(conceptMatch || cleanDir);
    setVsFormat(formatMatch);
    setVsMood(moodMatch);
    setVsComposition(compMatch);
    setVsPalette(colorMatch);
    setVsTypography(typoMatch);
    setVsElements(elMatch);
    setVsAvoid(avoidMatch);
    setVsAIPrompt(aiMatch);
    setVsNotes(notesMatch);`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(file, content, 'utf8');
