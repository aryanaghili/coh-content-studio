export type RevisionActionGroup =
  | 'Clean & Polish'
  | 'Voice & Tone'
  | 'COH & Strategic Fit'
  | 'Structure & Alternatives'
  | 'Format & Structure'
  | 'Evidence & Claim Discipline'
  | 'Translation & Localization'
  | 'Creative Actions';

export type RevisionExecutionMode = 'deterministic-safe' | 'ai-required';

export interface RevisionActionDef {
  id: string;
  label: string;
  group: RevisionActionGroup;
  description?: string;
  executionStage?: 1 | 2 | 3 | 4 | 5 | 6;
  executionMode: RevisionExecutionMode;
}

export const REVISION_ACTIONS: RevisionActionDef[] = [
  // Clean & Polish
  {
    id: 'clean-ai-punctuation',
    label: '🧼 Clean AI-Style Characters',
    group: 'Clean & Polish',
    description: 'Removes em dashes, hidden Unicode characters, awkward AI punctuation, excessive separators, and export-unfriendly symbols.',
    executionStage: 5,
    executionMode: 'deterministic-safe'
  },
  { id: 'improve-clarity', label: 'Improve clarity', group: 'Clean & Polish', executionStage: 5, executionMode: 'deterministic-safe' },
  { id: 'shorter', label: '✂️ Make it shorter', group: 'Clean & Polish', executionStage: 3, executionMode: 'deterministic-safe' },
  { id: 'smoother', label: 'Make it smoother', group: 'Clean & Polish', executionStage: 5, executionMode: 'deterministic-safe' },
  { id: 'remove-repetition', label: 'Remove repetition', group: 'Clean & Polish', executionStage: 3, executionMode: 'deterministic-safe' },
  { id: 'fix-grammar', label: 'Fix grammar and punctuation', group: 'Clean & Polish', executionStage: 5, executionMode: 'deterministic-safe' },
  { id: 'remove-awkward', label: 'Remove awkward phrasing', group: 'Clean & Polish', executionStage: 5, executionMode: 'deterministic-safe' },

  // Voice & Tone
  { id: 'human', label: '👤 Make it more human', group: 'Voice & Tone', executionStage: 5, executionMode: 'deterministic-safe' },
  { id: 'sharper', label: '⚡ Make it sharper', group: 'Voice & Tone', executionStage: 5, executionMode: 'deterministic-safe' },
  { id: 'warmer', label: 'Make it warmer', group: 'Voice & Tone', executionStage: 5, executionMode: 'deterministic-safe' },
  { id: 'direct', label: 'Make it more direct', group: 'Voice & Tone', executionStage: 5, executionMode: 'deterministic-safe' },
  { id: 'less-corporate', label: '💼 Make it less corporate', group: 'Voice & Tone', executionStage: 5, executionMode: 'deterministic-safe' },
  { id: 'less-ngo', label: '🌱 Make it less NGO-like', group: 'Voice & Tone', executionStage: 5, executionMode: 'deterministic-safe' },
  { id: 'less-poetic', label: '📐 Make it less poetic', group: 'Voice & Tone', executionStage: 5, executionMode: 'deterministic-safe' },
  { id: 'premium', label: 'Make it more premium', group: 'Voice & Tone', executionStage: 5, executionMode: 'deterministic-safe' },
  { id: 'natural', label: 'Make it more natural', group: 'Voice & Tone', executionStage: 5, executionMode: 'deterministic-safe' },

  // COH & Strategic Fit
  { id: 'coh-specific', label: '🎭 Make it more COH-specific', group: 'COH & Strategic Fit', executionStage: 4, executionMode: 'deterministic-safe' },
  { id: 'institutional', label: '🏛️ Make it more institutional', group: 'COH & Strategic Fit', executionStage: 4, executionMode: 'deterministic-safe' },
  { id: 'sponsor-facing', label: '💰 Make it more sponsor-facing', group: 'COH & Strategic Fit', executionStage: 4, executionMode: 'deterministic-safe' },
  { id: 'audience-friendly', label: '🤝 Make it more audience-friendly', group: 'COH & Strategic Fit', executionStage: 4, executionMode: 'deterministic-safe' },
  { id: 'channel-ready', label: '📱 Make it more channel-ready', group: 'COH & Strategic Fit', executionStage: 4, executionMode: 'deterministic-safe' },
  { id: 'culturally-grounded', label: 'Make it more culturally grounded', group: 'COH & Strategic Fit', executionStage: 4, executionMode: 'deterministic-safe' },
  { id: 'strategic', label: 'Make it more strategic', group: 'COH & Strategic Fit', executionStage: 4, executionMode: 'deterministic-safe' },
  { id: 'less-generic', label: 'Make it less generic', group: 'COH & Strategic Fit', executionStage: 4, executionMode: 'deterministic-safe' },

  // Structure & Alternatives
  { id: 'openings', label: '📝 Create 3 alternative openings', group: 'Structure & Alternatives', executionStage: 3, executionMode: 'deterministic-safe' },
  { id: 'ctas', label: '📣 Create 3 CTA options', group: 'Structure & Alternatives', executionStage: 3, executionMode: 'deterministic-safe' },
  { id: 'stronger-headline', label: 'Create a stronger headline', group: 'Structure & Alternatives', executionStage: 3, executionMode: 'deterministic-safe' },
  { id: 'shorter-version', label: 'Create a shorter version', group: 'Structure & Alternatives', executionStage: 3, executionMode: 'deterministic-safe' },
  { id: 'longer-version', label: 'Create a longer version', group: 'Structure & Alternatives', executionStage: 3, executionMode: 'deterministic-safe' },
  { id: 'bullet-points', label: 'Turn into bullet points', group: 'Structure & Alternatives', executionStage: 3, executionMode: 'deterministic-safe' },
  { id: 'paragraph', label: 'Turn into a paragraph', group: 'Structure & Alternatives', executionStage: 3, executionMode: 'deterministic-safe' },
  { id: 'email', label: 'Turn into an email', group: 'Structure & Alternatives', executionStage: 4, executionMode: 'deterministic-safe' },
  { id: 'social-post', label: 'Turn into a social post', group: 'Structure & Alternatives', executionStage: 4, executionMode: 'deterministic-safe' },

  // Format & Structure aliases (preserved for RevisionStudio backward compatibility)
  { id: 'adapt-channel', label: 'Adapt for selected channel', group: 'Format & Structure', executionStage: 4, executionMode: 'deterministic-safe' },
  { id: 'extract-quotes', label: 'Extract key quotes', group: 'Format & Structure', executionStage: 3, executionMode: 'deterministic-safe' },
  { id: 'to-bullets', label: 'Convert to bullet points', group: 'Format & Structure', executionStage: 3, executionMode: 'deterministic-safe' },
  { id: 'add-hook', label: 'Add a stronger hook', group: 'Format & Structure', executionStage: 3, executionMode: 'deterministic-safe' },
  { id: 'add-cta', label: 'Add a call to action', group: 'Format & Structure', executionStage: 3, executionMode: 'deterministic-safe' },

  // Evidence & Claim Discipline
  { id: 'remove-unsupported', label: '🛡️ Remove unsupported claims', group: 'Evidence & Claim Discipline', executionStage: 2, executionMode: 'deterministic-safe' },
  { id: 'flag-claims', label: 'Flag claims that need proof', group: 'Evidence & Claim Discipline', executionStage: 2, executionMode: 'deterministic-safe' },
  { id: 'more-careful', label: 'Make claims more careful', group: 'Evidence & Claim Discipline', executionStage: 2, executionMode: 'deterministic-safe' },
  { id: 'stronger-proof', label: '📊 Expand with stronger proof', group: 'Evidence & Claim Discipline', executionStage: 2, executionMode: 'deterministic-safe' },
  { id: 'less-exaggerated', label: 'Make it less exaggerated', group: 'Evidence & Claim Discipline', executionStage: 2, executionMode: 'deterministic-safe' },
  { id: 'simplify-claims', label: 'Simplify factual claims', group: 'Evidence & Claim Discipline', executionStage: 2, executionMode: 'deterministic-safe' },

  // Translation & Localization (AI-required for real translation/localization)
  { id: 'translate', label: 'Translate to selected language', group: 'Translation & Localization', executionStage: 6, executionMode: 'ai-required' },
  { id: 'translate-selected', label: 'Translate to selected language', group: 'Translation & Localization', executionStage: 6, executionMode: 'ai-required' },
  { id: 'localize', label: 'Localize for natural tone', group: 'Translation & Localization', executionStage: 6, executionMode: 'ai-required' },
  { id: 'localize-selected', label: 'Localize for selected language', group: 'Translation & Localization', executionStage: 6, executionMode: 'ai-required' },
  { id: 'preserve-meaning', label: 'Preserve meaning and improve flow', group: 'Translation & Localization', executionStage: 1, executionMode: 'deterministic-safe' },
  { id: 'preserve-meaning-flow', label: 'Preserve meaning, improve flow', group: 'Translation & Localization', executionStage: 1, executionMode: 'deterministic-safe' },
  { id: 'preserve-meaning-improve-flow', label: 'Preserve meaning and improve flow', group: 'Translation & Localization', executionStage: 1, executionMode: 'deterministic-safe' },
  { id: 'adapt-channel-lang', label: 'Adapt translation for selected channel', group: 'Translation & Localization', executionStage: 6, executionMode: 'ai-required' },
  { id: 'persian-natural', label: 'Make Persian more natural and spoken', group: 'Translation & Localization', executionStage: 6, executionMode: 'ai-required' },
  { id: 'english-polished', label: 'Make English more polished', group: 'Translation & Localization', executionStage: 6, executionMode: 'deterministic-safe' },

  // Creative Actions
  { id: 'make-controversial', label: 'Make it slightly provocative', group: 'Creative Actions', executionStage: 4, executionMode: 'ai-required' },
  { id: 'make-story', label: 'Turn into a story', group: 'Creative Actions', executionStage: 4, executionMode: 'ai-required' }
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

/**
 * Determines whether a revision action or recipe requires live AI execution
 * (e.g. translation to a non-English language, natural Persian rewriting, or localization).
 */
export function isAiRequiredRevisionAction(
  actionIds: string | string[],
  settings?: { targetLanguage?: string; customInstruction?: string }
): boolean {
  const ids = Array.isArray(actionIds) ? actionIds : [actionIds];
  const targetLang = (settings?.targetLanguage || 'English').trim();

  for (const id of ids) {
    const def = getCanonicalRevisionAction(id);
    if (def?.executionMode === 'ai-required') {
      // If it's a generic translate/localize action and targetLanguage is English, only require AI if action is persian-natural or creative
      if (
        (id === 'translate' || id === 'translate-selected' || id === 'localize' || id === 'localize-selected' || id === 'adapt-channel-lang') &&
        targetLang.toLowerCase() === 'english'
      ) {
        return true;
      }
      return true;
    }
  }

  // Also treat any revision where targetLanguage is explicitly non-English and translation is requested in customInstruction as AI-required
  if (
    targetLang.toLowerCase() !== 'english' &&
    /\b(translate|persian|farsi|portuguese|pt-eu|localize)\b/i.test(settings?.customInstruction || '')
  ) {
    return true;
  }

  return false;
}
