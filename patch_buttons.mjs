import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Strip hardcoded "cursor-not-allowed opacity-50" that make active buttons look disabled
content = content.replace(/className="cursor-not-allowed opacity-50 /g, 'className="');
content = content.replace(/className='cursor-not-allowed opacity-50 /g, 'className=\'');
content = content.replace(/className={`cursor-not-allowed opacity-50 /g, 'className={`');
content = content.replace(/className=\{"cursor-not-allowed opacity-50 /g, 'className=\{"');

// Fix buttons that have "disabled:opacity-50 action-button interactive-button" to use modern tailwind
// The global CSS now provides default button styles.

let changed = 0;
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log("Stripped erroneous disabled classes.");
