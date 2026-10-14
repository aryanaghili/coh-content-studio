export type RevisionActionGroup =
  | 'Clean & Polish'
  | 'Voice & Tone'
  | 'COH & Strategic Fit'
  | 'Structure & Alternatives'
  | 'Format & Structure'
  | 'Evidence & Claim Discipline'
  | 'Translation & Localization'
  | 'Creative Actions';

export interface RevisionActionDef {
  id: string;
  label: string;
  group: RevisionActionGroup;
  description?: string;
  executionStage?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const REVISION_ACTIONS: RevisionActionDef[] = [
  // Clean & Polish
  {
    id: 'clean-ai-punctuation',
    label: '🧼 Clean AI-Style Characters',
    group: 'Clean & Polish',
    description: 'Removes em dashes, hidden Unicode characters, awkward AI punctuation, excessive separators, and export-unfriendly symbols.',
    executionStage: 5
  },
  { id: 'improve-clarity', label: 'Improve clarity', group: 'Clean & Polish', executionStage: 5 },
  { id: 'shorter', label: '✂️ Make it shorter', group: 'Clean & Polish', executionStage: 3 },
  { id: 'smoother', label: 'Make it smoother', group: 'Clean & Polish', executionStage: 5 },
  { id: 'remove-repetition', label: 'Remove repetition', group: 'Clean & Polish', executionStage: 3 },
  { id: 'fix-grammar', label: 'Fix grammar and punctuation', group: 'Clean & Polish', executionStage: 5 },
  { id: 'remove-awkward', label: 'Remove awkward phrasing', group: 'Clean & Polish', executionStage: 5 },

  // Voice & Tone
  { id: 'human', label: '👤 Make it more human', group: 'Voice & Tone', executionStage: 5 },
  { id: 'sharper', label: '⚡ Make it sharper', group: 'Voice & Tone', executionStage: 5 },
  { id: 'warmer', label: 'Make it warmer', group: 'Voice & Tone', executionStage: 5 },
  { id: 'direct', label: 'Make it more direct', group: 'Voice & Tone', executionStage: 5 },
  { id: 'less-corporate', label: '💼 Make it less corporate', group: 'Voice & Tone', executionStage: 5 },
  { id: 'less-ngo', label: '🌱 Make it less NGO-like', group: 'Voice & Tone', executionStage: 5 },
  { id: 'less-poetic', label: '📐 Make it less poetic', group: 'Voice & Tone', executionStage: 5 },
  { id: 'premium', label: 'Make it more premium', group: 'Voice & Tone', executionStage: 5 },
  { id: 'natural', label: 'Make it more natural', group: 'Voice & Tone', executionStage: 5 },

  // COH & Strategic Fit
  { id: 'coh-specific', label: '🎭 Make it more COH-specific', group: 'COH & Strategic Fit', executionStage: 4 },
  { id: 'institutional', label: '🏛️ Make it more institutional', group: 'COH & Strategic Fit', executionStage: 4 },
  { id: 'sponsor-facing', label: '💰 Make it more sponsor-facing', group: 'COH & Strategic Fit', executionStage: 4 },
  { id: 'audience-friendly', label: '🤝 Make it more audience-friendly', group: 'COH & Strategic Fit', executionStage: 4 },
  { id: 'channel-ready', label: '📱 Make it more channel-ready', group: 'COH & Strategic Fit', executionStage: 4 },
  { id: 'culturally-grounded', label: 'Make it more culturally grounded', group: 'COH & Strategic Fit', executionStage: 4 },
  { id: 'strategic', label: 'Make it more strategic', group: 'COH & Strategic Fit', executionStage: 4 },
  { id: 'less-generic', label: 'Make it less generic', group: 'COH & Strategic Fit', executionStage: 4 },

  // Structure & Alternatives
  { id: 'openings', label: '📝 Create 3 alternative openings', group: 'Structure & Alternatives', executionStage: 3 },
  { id: 'ctas', label: '📣 Create 3 CTA options', group: 'Structure & Alternatives', executionStage: 3 },
  { id: 'stronger-headline', label: 'Create a stronger headline', group: 'Structure & Alternatives', executionStage: 3 },
  { id: 'shorter-version', label: 'Create a shorter version', group: 'Structure & Alternatives', executionStage: 3 },
  { id: 'longer-version', label: 'Create a longer version', group: 'Structure & Alternatives', executionStage: 3 },
  { id: 'bullet-points', label: 'Turn into bullet points', group: 'Structure & Alternatives', executionStage: 3 },
  { id: 'paragraph', label: 'Turn into a paragraph', group: 'Structure & Alternatives', executionStage: 3 },
  { id: 'email', label: 'Turn into an email', group: 'Structure & Alternatives', executionStage: 4 },
  { id: 'social-post', label: 'Turn into a social post', group: 'Structure & Alternatives', executionStage: 4 },

  // Format & Structure aliases (preserved for RevisionStudio backward compatibility)
  { id: 'adapt-channel', label: 'Adapt for selected channel', group: 'Format & Structure', executionStage: 4 },
  { id: 'extract-quotes', label: 'Extract key quotes', group: 'Format & Structure', executionStage: 3 },
  { id: 'to-bullets', label: 'Convert to bullet points', group: 'Format & Structure', executionStage: 3 },
  { id: 'add-hook', label: 'Add a stronger hook', group: 'Format & Structure', executionStage: 3 },
  { id: 'add-cta', label: 'Add a call to action', group: 'Format & Structure', executionStage: 3 },

  // Evidence & Claim Discipline
  { id: 'remove-unsupported', label: '🛡️ Remove unsupported claims', group: 'Evidence & Claim Discipline', executionStage: 2 },
  { id: 'flag-claims', label: 'Flag claims that need proof', group: 'Evidence & Claim Discipline', executionStage: 2 },
  { id: 'more-careful', label: 'Make claims more careful', group: 'Evidence & Claim Discipline', executionStage: 2 },
  { id: 'stronger-proof', label: '📊 Expand with stronger proof', group: 'Evidence & Claim Discipline', executionStage: 2 },
  { id: 'less-exaggerated', label: 'Make it less exaggerated', group: 'Evidence & Claim Discipline', executionStage: 2 },
  { id: 'simplify-claims', label: 'Simplify factual claims', group: 'Evidence & Claim Discipline', executionStage: 2 },

  // Translation & Localization
  { id: 'translate', label: 'Translate to selected language', group: 'Translation & Localization', executionStage: 6 },
  { id: 'translate-selected', label: 'Translate to selected language', group: 'Translation & Localization', executionStage: 6 },
  { id: 'localize', label: 'Localize for natural tone', group: 'Translation & Localization', executionStage: 6 },
  { id: 'localize-selected', label: 'Localize for selected language', group: 'Translation & Localization', executionStage: 6 },
  { id: 'preserve-meaning', label: 'Preserve meaning and improve flow', group: 'Translation & Localization', executionStage: 1 },
  { id: 'preserve-meaning-flow', label: 'Preserve meaning, improve flow', group: 'Translation & Localization', executionStage: 1 },
  { id: 'preserve-meaning-improve-flow', label: 'Preserve meaning and improve flow', group: 'Translation & Localization', executionStage: 1 },
  { id: 'adapt-channel-lang', label: 'Adapt translation for selected channel', group: 'Translation & Localization', executionStage: 6 },
  { id: 'persian-natural', label: 'Make Persian more natural and spoken', group: 'Translation & Localization', executionStage: 6 },
  { id: 'english-polished', label: 'Make English more polished', group: 'Translation & Localization', executionStage: 6 },

  // Creative Actions
  { id: 'make-controversial', label: 'Make it slightly provocative', group: 'Creative Actions', executionStage: 4 },
  { id: 'make-story', label: 'Turn into a story', group: 'Creative Actions', executionStage: 4 }
];

export const REVISION_GROUP_ORDER: RevisionActionGroup[] = [
  'Clean & Polish',
  'Voice & Tone',
  'COH & Strategic Fit',
  'Evidence & Claim Discipline',
  'Structure & Alternatives',
  'Format & Structure',
  'Translation & Localization',
  'Creative Actions'
];

export function getCanonicalRevisionAction(id: string): RevisionActionDef | undefined {
  return REVISION_ACTIONS.find(a => a.id === id);
}
