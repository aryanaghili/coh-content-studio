/**
 * Quality Gate - validates AI output before presenting to user
 */
export function runQualityGate(output, input) {
  const issues = [];
  const rawInput = (input.rawInput || '').toLowerCase();
  const lang = input.language || 'English';

  if (!output) {
    return { passed: false, issues: ['No output received from provider.'] };
  }

  const drafts = output.drafts || [];

  for (const draft of drafts) {
    const copy = draft.copy || '';

    // Check for empty copy
    if (!copy || copy.trim().length < 20) {
      issues.push(`${draft.label}: Copy is too short or empty.`);
      continue;
    }

    // Check if raw input is directly repeated as the opening
    if (rawInput.length > 10 && copy.toLowerCase().startsWith(rawInput.substring(0, 40))) {
      issues.push(`${draft.label}: Copy starts with a direct repeat of the raw input topic.`);
    }

    // Check for em dash
    if (copy.includes('—') || copy.includes('–')) {
      issues.push(`${draft.label}: Contains em dash or en dash (avoid AI-looking punctuation).`);
    }

    // Check for common AI clichés
    const cliches = ['now more than ever', 'in a world where', 'at the intersection', 'it\'s important to note', 'dive into'];
    for (const cliche of cliches) {
      if (copy.toLowerCase().includes(cliche)) {
        issues.push(`${draft.label}: Contains AI-style phrase: "${cliche}".`);
      }
    }

    // Check for metadata inside copy
    if (copy.includes('Option A:') || copy.includes('Option B:') || copy.includes('[DRAFT]')) {
      issues.push(`${draft.label}: Copy contains metadata markers. Remove before publishing.`);
    }
  }

  if (drafts.length < 2) {
    issues.push('Provider returned fewer than 2 draft options.');
  }

  const passed = issues.length === 0;
  return { passed, issues };
}
