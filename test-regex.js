const rawDirection = `### Visual Design Brief: LinkedIn Post
- **Visual Concept**: Clean quote card or editorial executive layout.
- **Format Recommendation**: Text post with single high-resolution quote card graphic (1200x1200px).
- **Mood / Atmosphere**: Professional, sober, institutional.
- **Composition**: Text-heavy quote box layout with wide borders and clean padding.
- **Color / Material**: Light warm cream background (#FAF9F6) with navy blue serif text (#0C1B2A).
- **Typography / Layout**: Serif display quote text, small sans-serif nameplate.
- **Key Visual Elements**: Symmetrical line frame, COH logo watermark.
- **What to Avoid**: Generic business handshakes, cartoon icons, or decorative green elements.
- **AI Image Prompt**: "Professional corporate editorial portrait, soft office natural lighting, moody stage style, neutral colors --ar 1:1"
- **Designer Notes**: The post performs best as a text-only card or with an authentic production image.`;

const cleanDir = rawDirection.replace(/\*\*/g, '');

const extract = (keyPattern) => {
  const regex = new RegExp(`${keyPattern}:\\s*([\\s\\S]*?)(?=\\n-?\\s*[A-Z][a-zA-Z\\s/]*:|$)`, 'i');
  const match = cleanDir.match(regex);
  return match ? match[1].trim() : '';
};

console.log("Concept:", extract('Concept'));
console.log("Format:", extract('Recommendation') || extract('Format'));
console.log("Mood:", extract('Mood.*?'));
console.log("Composition:", extract('Composition'));
console.log("Color:", extract('Color.*?'));
console.log("Typography:", extract('Typography.*?'));
console.log("Elements:", extract('Key.*?Elements'));
console.log("Avoid:", extract('Avoid'));
console.log("AI:", extract('AI Image Prompt'));
console.log("Notes:", extract('Designer Notes'));

