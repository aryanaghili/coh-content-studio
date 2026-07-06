import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Extract REVISION_ACTIONS
const revisionActionsMatch = content.match(/export const REVISION_ACTIONS[\s\S]*?\];/);
const revisionActionsStr = revisionActionsMatch ? revisionActionsMatch[0] : '';

// Extract REVISION_GROUP_ORDER
const revisionGroupOrderMatch = content.match(/export const REVISION_GROUP_ORDER[\s\S]*?\];/);
const revisionGroupOrderStr = revisionGroupOrderMatch ? revisionGroupOrderMatch[0] : '';

// Define the type alias if it's not defined at top
const typeAlias = `
export type RevisionActionGroup = 
  | 'Clean & Polish' 
  | 'Voice & Tone' 
  | 'COH & Strategic Fit' 
  | 'Structure & Alternatives' 
  | 'Evidence & Claim Discipline' 
  | 'Translation & Localization';

export interface RevisionActionDef {
  id: string;
  label: string;
  group: RevisionActionGroup;
  description?: string;
}
`;

// Combine all definitions
const definitionsToInsert = `
${typeAlias}

${revisionActionsStr}

${revisionGroupOrderStr}
`;

// Remove the definitions from the corrupted section so they don't break anything before we delete the section
content = content.replace(revisionActionsStr, '');
content = content.replace(/export const REVISION_GROUP_ORDER[\s\S]*?\];/g, '');

// Insert before PROTECTED_COH_KERNEL
content = content.replace(
  "export const PROTECTED_COH_KERNEL =",
  definitionsToInsert + "\nexport const PROTECTED_COH_KERNEL ="
);

// Write it back
fs.writeFileSync('src/App.tsx', content, 'utf8');

