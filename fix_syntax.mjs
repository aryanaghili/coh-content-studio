import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const revisionCode = `type RevisionActionGroup = 
  | 'Clean & Polish'
  | 'Voice & Tone'
  | 'COH & Strategic Fit'
  | 'Structure & Alternatives'
  | 'Evidence & Claim Discipline'
  | 'Translation & Localization';

interface RevisionActionDef {
  id: string;
  label: string;
  group: RevisionActionGroup;
  description?: string;
}

export const REVISION_ACTIONS: RevisionActionDef[] = [
  { id: 'clean-ai-punctuation', label: '🧼 Clean AI-Style Characters', group: 'Clean & Polish', description: 'Removes em dashes, hidden Unicode characters, awkward AI punctuation, excessive separators, and export-unfriendly symbols.' },
  { id: 'improve-clarity', label: 'Improve clarity', group: 'Clean & Polish' },
  { id: 'shorter', label: '✂️ Make it shorter', group: 'Clean & Polish' },
  { id: 'smoother', label: 'Make it smoother', group: 'Clean & Polish' },
  { id: 'remove-repetition', label: 'Remove repetition', group: 'Clean & Polish' },
  { id: 'fix-grammar', label: 'Fix grammar and punctuation', group: 'Clean & Polish' },
  { id: 'remove-awkward', label: 'Remove awkward phrasing', group: 'Clean & Polish' },

  { id: 'human', label: '👤 Make it more human', group: 'Voice & Tone' },
  { id: 'sharper', label: '⚡ Make it sharper', group: 'Voice & Tone' },
  { id: 'warmer', label: 'Make it warmer', group: 'Voice & Tone' },
  { id: 'direct', label: 'Make it more direct', group: 'Voice & Tone' },
  { id: 'less-corporate', label: '💼 Make it less corporate', group: 'Voice & Tone' },
  { id: 'less-ngo', label: '🌱 Make it less NGO-like', group: 'Voice & Tone' },
  { id: 'less-poetic', label: '📐 Make it less poetic', group: 'Voice & Tone' },
  { id: 'premium', label: 'Make it more premium', group: 'Voice & Tone' },
  { id: 'natural', label: 'Make it more natural', group: 'Voice & Tone' },

  { id: 'coh-specific', label: '🎭 Make it more COH-specific', group: 'COH & Strategic Fit' },
  { id: 'institutional', label: '🏛️ Make it more institutional', group: 'COH & Strategic Fit' },
  { id: 'sponsor-facing', label: '💰 Make it more sponsor-facing', group: 'COH & Strategic Fit' },
  { id: 'audience-friendly', label: '🤝 Make it more audience-friendly', group: 'COH & Strategic Fit' },
  { id: 'channel-ready', label: '📱 Make it more channel-ready', group: 'COH & Strategic Fit' },
  { id: 'culturally-grounded', label: 'Make it more culturally grounded', group: 'COH & Strategic Fit' },
  { id: 'strategic', label: 'Make it more strategic', group: 'COH & Strategic Fit' },
  { id: 'less-generic', label: 'Make it less generic', group: 'COH & Strategic Fit' },

  { id: 'openings', label: '📝 Create 3 alternative openings', group: 'Structure & Alternatives' },
  { id: 'ctas', label: '📣 Create 3 CTA options', group: 'Structure & Alternatives' },
  { id: 'stronger-headline', label: 'Create a stronger headline', group: 'Structure & Alternatives' },
  { id: 'shorter-version', label: 'Create a shorter version', group: 'Structure & Alternatives' },
  { id: 'longer-version', label: 'Create a longer version', group: 'Structure & Alternatives' },
  { id: 'bullet-points', label: 'Turn into bullet points', group: 'Structure & Alternatives' },
  { id: 'paragraph', label: 'Turn into a paragraph', group: 'Structure & Alternatives' },
  { id: 'email', label: 'Turn into an email', group: 'Structure & Alternatives' },
  { id: 'social-post', label: 'Turn into a social post', group: 'Structure & Alternatives' },

  { id: 'remove-unsupported', label: '🛡️ Remove unsupported claims', group: 'Evidence & Claim Discipline' },
  { id: 'flag-claims', label: 'Flag claims that need proof', group: 'Evidence & Claim Discipline' },
  { id: 'more-careful', label: 'Make claims more careful', group: 'Evidence & Claim Discipline' },
  { id: 'stronger-proof', label: '📊 Expand with stronger proof', group: 'Evidence & Claim Discipline' },
  { id: 'less-exaggerated', label: 'Make it less exaggerated', group: 'Evidence & Claim Discipline' },
  { id: 'simplify-claims', label: 'Simplify factual claims', group: 'Evidence & Claim Discipline' },

  { id: 'translate', label: 'Translate to selected language', group: 'Translation & Localization' },
  { id: 'localize', label: 'Localize for natural tone', group: 'Translation & Localization' },
  { id: 'preserve-meaning', label: 'Preserve meaning and improve flow', group: 'Translation & Localization' },
  { id: 'adapt-channel', label: 'Adapt translation for selected channel', group: 'Translation & Localization' },
  { id: 'persian-natural', label: 'Make Persian more natural and spoken', group: 'Translation & Localization' },
  { id: 'english-polished', label: 'Make English more polished', group: 'Translation & Localization' },
];

export const REVISION_GROUP_ORDER: RevisionActionGroup[] = [
  'Clean & Polish',
  'Voice & Tone',
  'COH & Strategic Fit',
  'Structure & Alternatives',
  'Evidence & Claim Discipline',
  'Translation & Localization'
];`;

content = content.replace(revisionCode, '');
content = content.replace('import {\n\n\n  LayoutDashboard,', 'import {\n  LayoutDashboard,');

// Re-insert revisionCode properly after imports
const lastImportIdx = content.lastIndexOf('import ');
const insertIdx = content.indexOf('\n', lastImportIdx) + 1;
content = content.substring(0, insertIdx) + '\n' + revisionCode + '\n' + content.substring(insertIdx);

fs.writeFileSync('src/App.tsx', content, 'utf8');
