const parseVisualDirection = (rawDirection) => {
  // 1. Normalize line endings
  let text = rawDirection.replace(/\r\n/g, '\n');
  
  // 2. State fields
  const fields = {
    visualConcept: '',
    formatRecommendation: '',
    moodAtmosphere: '',
    composition: '',
    colorMaterialDirection: '',
    typographyLayout: '',
    keyVisualElements: '',
    whatToAvoid: '',
    aiImagePrompt: '',
    negativePrompt: '',
    designerNotes: ''
  };

  // 3. Define heading patterns with field mapping
  const headingPatterns = [
    { key: 'visualConcept', pattern: /^(?:#+\s*|\*?\*\s*|-?\s*\*\*)?Visual Concept\b[*:_]*$/i },
    { key: 'formatRecommendation', pattern: /^(?:#+\s*|\*?\*\s*|-?\s*\*\*)?(?:Format Recommendation|Format(?:s)?\b)[*:_]*$/i },
    { key: 'moodAtmosphere', pattern: /^(?:#+\s*|\*?\*\s*|-?\s*\*\*)?Mood(?:\s*(?:[\/&]|and)\s*Atmosphere)?\b[*:_]*$/i },
    { key: 'composition', pattern: /^(?:#+\s*|\*?\*\s*|-?\s*\*\*)?Composition\b[*:_]*$/i },
    { key: 'colorMaterialDirection', pattern: /^(?:#+\s*|\*?\*\s*|-?\s*\*\*)?Color(?:\s*(?:[\/&]|and)\s*Material\b.*?)?[*:_]*$/i },
    { key: 'typographyLayout', pattern: /^(?:#+\s*|\*?\*\s*|-?\s*\*\*)?Typography(?:\s*(?:[\/&]|and)\s*Layout)?\b[*:_]*$/i },
    { key: 'keyVisualElements', pattern: /^(?:#+\s*|\*?\*\s*|-?\s*\*\*)?(?:Key )?Visual Elements\b[*:_]*$/i },
    { key: 'whatToAvoid', pattern: /^(?:#+\s*|\*?\*\s*|-?\s*\*\*)?(?:What to )?Avoid\b[*:_]*$/i },
    { key: 'aiImagePrompt', pattern: /^(?:#+\s*|\*?\*\s*|-?\s*\*\*)?AI Image Prompt\b[*:_]*$/i },
    { key: 'negativePrompt', pattern: /^(?:#+\s*|\*?\*\s*|-?\s*\*\*)?Negative Prompt\b[*:_]*$/i },
    { key: 'designerNotes', pattern: /^(?:#+\s*|\*?\*\s*|-?\s*\*\*)?Designer Notes\b[*:_]*$/i }
  ];

  // 4. Line by line parsing
  const lines = text.split('\n');
  let currentField = null;
  
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check if line matches a heading but values are on the SAME line (e.g., "**Visual Concept**: Clean quote card")
    let isHeadingLine = false;
    
    for (const { key, pattern } of headingPatterns) {
      // Test standalone heading (no value on same line)
      if (pattern.test(trimmed)) {
        currentField = key;
        isHeadingLine = true;
        break;
      }
      
      // Test heading with inline value (e.g. "**Mood**: Sober")
      const inlineMatch = trimmed.match(/^(?:#+\s*|\*?\*\s*|-?\s*\*\*)?(Visual Concept|Format Recommendation|Format|Mood(?:\s*(?:[\/&]|and)\s*Atmosphere)?|Composition|Color(?:\s*(?:[\/&]|and)\s*Material.*?)?|Typography(?:\s*(?:[\/&]|and)\s*Layout)?|(?:Key )?Visual Elements|(?:What to )?Avoid|AI Image Prompt|Negative Prompt|Designer Notes)[*:_]+\s*(.*)$/i);
      
      if (inlineMatch && inlineMatch[1]) {
        // Need to figure out which key this matches
        for (const hp of headingPatterns) {
           if (hp.pattern.test(inlineMatch[1])) {
             currentField = hp.key;
             const val = inlineMatch[2].trim();
             if (val) {
                // Strip markdown artifacts from start/end
                fields[currentField] += (fields[currentField] ? '\n' : '') + val.replace(/^["'\-\*\s]+/, '').replace(/["'\-\*\s]+$/, '');
             }
             isHeadingLine = true;
             break;
           }
        }
        if (isHeadingLine) break;
      }
    }
    
    // If not a heading, append to current field
    if (!isHeadingLine && currentField) {
       const cleaned = trimmed.replace(/^[\*\-\s]+/, ''); // Strip leading bullets/asterisks on continuation lines
       if (cleaned) {
          fields[currentField] += (fields[currentField] ? '\n' : '') + cleaned;
       }
    }
  }

  return fields;
}

const raw = `Visual Concept:
Clean quote card or editorial executive layout.

Format Recommendation:
Text post with single high-resolution quote card graphic (1200x1200px).

Mood / Atmosphere:
Professional, sober, institutional.

Composition:
Text-heavy quote box layout with wide borders and clean padding.

Color / Material Direction:
Light warm cream background (#FAF9F6) with navy blue serif text (#0C1B2A).

Typography / Layout:
Serif display quote text, small sans-serif nameplate.

Key Visual Elements:
Symmetrical line frame, COH logo watermark.

What to Avoid:
Generic business handshakes, cartoon icons, or decorative green elements.

AI Image Prompt:
Create a refined editorial visual for LinkedIn Post. Show a clean quote card or editorial executive layout with a text-heavy quote box, wide borders, and clean padding. The mood should feel professional, sober, and institutional. Use a restrained light warm cream background (#FAF9F6) with navy blue serif text (#0C1B2A). Include a symmetrical line frame and a restrained COH logo watermark. The image should feel editorial, clean, high-contrast, prestigious, and minimalist. Avoid generic business handshakes, cartoon icons, decorative green elements, cliché climate imagery, protest signs, disaster scenes, generic green leaves, and overdramatic apocalypse imagery. Suitable for a LinkedIn card or editorial graphic.

Negative Prompt:
No disaster imagery, no protest signs, no generic green leaves, no melting-earth cliché, no stock-photo corporate handshake, no dystopian city, no exaggerated apocalypse imagery, no decorative climate icons, no unreadable text inside the image.

Designer Notes:
The post performs best as a text-only card or with an authentic production image.`;

console.log(parseVisualDirection(raw));

