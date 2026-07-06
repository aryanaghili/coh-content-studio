import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace URL Context
content = content.replace(/>URL Context</g, ">URL<");
content = content.replace(/'URL Context'/g, "'URL'");
content = content.replace(/"URL Context"/g, '"URL"');

// Add interactive-btn to primary action buttons
// Generate Drafts button
content = content.replace(/className="w-full py-4 bg-coh-navy text-white rounded font-serif text-lg font-bold shadow-md hover:bg-coh-navy-light transition-colors relative"/g, 
  'className="w-full py-4 bg-coh-navy text-white rounded font-serif text-lg font-bold shadow-md hover:bg-coh-navy-light transition-colors relative interactive-btn"');

// Generate Ideas button
content = content.replace(/className="w-full py-3 bg-coh-navy text-white rounded font-serif text-lg font-bold hover:bg-coh-navy-light transition-colors relative"/g, 
  'className="w-full py-3 bg-coh-navy text-white rounded font-serif text-lg font-bold hover:bg-coh-navy-light transition-colors relative interactive-btn"');

content = content.replace(/className="w-full bg-coh-gold text-coh-navy py-4 rounded font-serif text-xl shadow-md hover:bg-coh-gold\/90 font-bold relative transition"/g,
  'className="w-full bg-coh-gold text-coh-navy py-4 rounded font-serif text-xl shadow-md hover:bg-coh-gold/90 font-bold relative transition interactive-btn"');

content = content.replace(/className="w-full bg-coh-navy text-white py-4 rounded font-serif text-lg shadow-md hover:bg-coh-navy-light font-bold relative transition"/g,
  'className="w-full bg-coh-navy text-white py-4 rounded font-serif text-lg shadow-md hover:bg-coh-navy-light font-bold relative transition interactive-btn"');

// Save buttons
content = content.replace(/className="px-4 py-2 bg-coh-gold text-coh-navy rounded font-bold text-sm shadow-sm hover:bg-coh-gold\/90 transition-colors"/g,
  'className="px-4 py-2 bg-coh-gold text-coh-navy rounded font-bold text-sm shadow-sm hover:bg-coh-gold/90 transition-colors interactive-btn"');

content = content.replace(/className="px-4 py-2 bg-coh-gold text-coh-navy font-bold rounded text-sm hover:bg-coh-gold\/90 transition"/g,
  'className="px-4 py-2 bg-coh-gold text-coh-navy font-bold rounded text-sm hover:bg-coh-gold/90 transition interactive-btn"');

// Revision Apply
content = content.replace(/className="text-xs px-3 py-1 bg-coh-navy text-white rounded font-bold hover:bg-coh-navy-light transition"/g,
  'className="text-xs px-3 py-1 bg-coh-navy text-white rounded font-bold hover:bg-coh-navy-light transition interactive-btn"');

// Replace any <button ... className="... that doesn't have interactive-btn or interactive-tab but is a primary looking button
content = content.replace(/(<button[^>]+className="[^"]+bg-coh-navy[^"]+text-white[^"]+)(")/g, '$1 interactive-btn$2');
content = content.replace(/(<button[^>]+className="[^"]+bg-coh-gold[^"]+text-coh-navy[^"]+)(")/g, '$1 interactive-btn$2');

// Clean up duplicates if any
content = content.replace(/interactive-btn interactive-btn/g, 'interactive-btn');

// Tabs (Simple Mode, Quick Create, Advanced Brief)
// In App.tsx these are rendered using conditional classes
// Let's just find `w-1/3 py-3 text-sm font-semibold transition-colors border-b-2`
content = content.replace(/className={`w-1\/3 py-3 text-sm font-semibold transition-colors border-b-2/g,
  'className={`w-1/3 py-3 text-sm font-semibold transition-colors border-b-2 interactive-tab');
  
// Visual Studio Mode Tabs
content = content.replace(/className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors/g,
  'className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors interactive-tab');

// Replace interactive-btn interactive-btn
content = content.replace(/interactive-btn\s+interactive-btn/g, 'interactive-btn');
content = content.replace(/interactive-tab\s+interactive-tab/g, 'interactive-tab');

fs.writeFileSync('src/App.tsx', content, 'utf8');

