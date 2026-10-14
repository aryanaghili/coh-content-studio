/**
 * Quality Gate - validates AI output before presenting to user across all studio workflows
 */

const ALLOWED_META_PROPER_WORDS = new Set([
  'The', 'This', 'That', 'These', 'Those', 'Source', 'Statement', 'Supported',
  'Claim', 'Fact', 'Verified', 'Grounded', 'Climate', 'Opera', 'Haus', 'COH',
  'In', 'On', 'At', 'For', 'With', 'From', 'By', 'As', 'To', 'During', 'After',
  'Before', 'Across', 'Through', 'Within', 'Between', 'Under', 'Over', 'When',
  'While', 'Where', 'Because', 'Although', 'However', 'Furthermore', 'Moreover'
]);

const GROUNDING_STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'with', 'from', 'this', 'into', 'over', 'under',
  'have', 'has', 'had', 'were', 'was', 'are', 'been', 'being', 'will', 'would',
  'could', 'should', 'about', 'through', 'across', 'between', 'within', 'their',
  'there', 'where', 'which', 'while', 'when', 'what', 'who', 'whom', 'whose',
  'climate', 'opera', 'haus', 'source', 'grounded', 'statement', 'supported',
  'claim', 'confirmed', 'directly', 'stated', 'based', 'piece', 'content'
]);

function normalizeText(str) {
  return String(str || '').replace(/\s+/g, ' ').trim();
}

function semanticTokens(str) {
  return new Set(
    (String(str || '').toLowerCase().match(/\b[a-z]{4,}\b/g) || [])
      .filter((token) => !GROUNDING_STOPWORDS.has(token))
  );
}

function tokenSimilarity(a, b) {
  const aSet = semanticTokens(a);
  const bSet = semanticTokens(b);
  if (aSet.size === 0 || bSet.size === 0) return 0;
  let overlap = 0;
  for (const token of aSet) {
    if (bSet.has(token)) overlap += 1;
  }
  return overlap / Math.max(aSet.size, bSet.size);
}

function hasLongDash(text) {
  return /[—–―]/.test(String(text || ''));
}

function isExactSubstringInSource(rawSource, excerpt) {
  const cleanExcerpt = normalizeText(excerpt).replace(/^["“”']+|["“”']+$/g, '').trim();
  if (!cleanExcerpt) return false;
  const cleanSource = normalizeText(rawSource);
  return cleanSource.toLowerCase().includes(cleanExcerpt.toLowerCase());
}

function isClaimGroundedInSourceText(claimText, rawSourceText) {
  const cleanClaim = String(claimText || '')
    .trim()
    .replace(/^(?:source[- ]grounded\s+statement|verified\s+fact|supported\s+claim|fact|claim)\s*:\s*/i, '')
    .trim();
  if (!cleanClaim) return false;
  const rawLower = String(rawSourceText || '').toLowerCase();
  if (!rawLower) return false;

  const nums = cleanClaim.match(/\b\d+(?:[.,]\d+)?%?\b/g) || [];
  for (const num of nums) {
    if (!rawLower.includes(num.toLowerCase())) return false;
  }

  const caps = cleanClaim.match(/\b(?:[A-Z]{2,}|[A-Z][a-z]{2,})\b/g) || [];
  for (const cap of caps) {
    if (ALLOWED_META_PROPER_WORDS.has(cap)) continue;
    if (!rawLower.includes(cap.toLowerCase())) return false;
  }

  const words = (cleanClaim.toLowerCase().match(/\b[a-z]{4,}\b/g) || []).filter(
    (word) => !GROUNDING_STOPWORDS.has(word)
  );
  if (words.length === 0) return false;

  const matched = words.filter(
    (word) => rawLower.includes(word) || (word.length >= 6 && rawLower.includes(word.slice(0, 5)))
  );
  return matched.length / words.length >= 0.6;
}

function containsPersianScript(text) {
  return /[\u0600-\u06FF]/.test(String(text || ''));
}

function appearsUnchangedEnglish(revisedCopy, previousDraft) {
  const cleanRev = normalizeText(revisedCopy);
  const cleanPrev = normalizeText(previousDraft);
  if (!cleanRev) return true;
  if (cleanPrev && cleanRev.toLowerCase() === cleanPrev.toLowerCase()) return true;
  const englishStopwords = (cleanRev.toLowerCase().match(/\b(the|and|with|that|from|this|their|through|about|would)\b/g) || []).length;
  const portugueseMarkers = (cleanRev.toLowerCase().match(/\b(para|com|uma|dos|das|pelos|pelas|através|sobre|como|não|está|são)\b|[ãõç]/g) || []).length;
  return englishStopwords >= 4 && portugueseMarkers === 0;
}

function validateVisualBrief(brief, issues) {
  if (!brief || typeof brief !== 'object') {
    issues.push('Visual direction is missing from the generated content package.');
    return;
  }

  const required = [
    ['visualConcept', 30],
    ['visualRationale', 20],
    ['composition', 35],
    ['colorMaterial', 20],
    ['aiImagePrompt', 120],
    ['negativePrompt', 20],
  ];

  for (const [field, minLength] of required) {
    const value = normalizeText(brief[field]);
    if (!value || value.length < minLength) {
      issues.push(`Visual direction field "${field}" is missing or too generic.`);
    }
  }

  const allowedTextPolicies = new Set(['TEXT_FREE', 'TEXT_LED', 'OPTIONAL_OVERLAY']);
  if (!allowedTextPolicies.has(String(brief.textPolicy || '').trim())) {
    issues.push('Visual direction is missing a valid textPolicy (TEXT_FREE, TEXT_LED, or OPTIONAL_OVERLAY).');
  }

  if (brief.textPolicy === 'TEXT_FREE' && normalizeText(brief.textContent)) {
    issues.push('Visual direction conflicts with itself: textPolicy is TEXT_FREE but textContent is populated.');
  }

  const conceptAndPrompt = `${brief.visualConcept || ''} ${brief.aiImagePrompt || ''}`.toLowerCase();
  const genericVisualFailures = [
    'hands holding a seedling',
    'green leaves around the globe',
    'recycling symbol',
    'generic corporate stock',
  ];
  for (const phrase of genericVisualFailures) {
    if (conceptAndPrompt.includes(phrase)) {
      issues.push(`Visual direction falls into a prohibited generic visual pattern: "${phrase}".`);
    }
  }

  if (hasLongDash(JSON.stringify(brief))) {
    issues.push('Visual direction contains prohibited long-dash punctuation.');
  }
}

export function runQualityGate(output, input = {}) {
  const issues = [];
  const rawInput = (input.rawInput || '').toLowerCase();
  const mode = input.mode || input.taskType || 'draft';

  if (!output || typeof output !== 'object') {
    return { passed: false, issues: ['No valid structured output received from provider.'] };
  }

  // 1. Source Analysis Quality Gate
  if (mode === 'source_analysis' || mode === 'source-analysis') {
    if (
      !Array.isArray(output.keyFacts) ||
      !Array.isArray(output.supportedClaims) ||
      !Array.isArray(output.cautionsAndAmbiguities) ||
      !Array.isArray(output.usefulExcerpts)
    ) {
      issues.push('Source analysis response is missing required structured arrays (keyFacts, supportedClaims, cautionsAndAmbiguities, usefulExcerpts).');
    }

    const sourceType = input.sourceType || output.sourceType || '';
    const isRestrictedType = sourceType === 'Approved Example' || sourceType === 'Visual Reference';

    if (isRestrictedType) {
      if (Array.isArray(output.keyFacts) && output.keyFacts.length > 0) {
        issues.push(`${sourceType} cannot produce factual keyFacts.`);
      }
      if (Array.isArray(output.supportedClaims) && output.supportedClaims.length > 0) {
        issues.push(`${sourceType} cannot produce factual supportedClaims.`);
      }
    }

    const rawSource = `${input.rawInput || input.sourceContent || ''}\n${input.sourceNotes || ''}`.trim();
    if (rawSource.length > 0) {
      if (Array.isArray(output.usefulExcerpts)) {
        for (const excerpt of output.usefulExcerpts) {
          if (!isExactSubstringInSource(rawSource, excerpt)) {
            issues.push(`Excerpt is not an exact substring of the raw source: "${excerpt}"`);
          }
        }
      }
      if (!isRestrictedType) {
        for (const fact of output.keyFacts || []) {
          if (!isClaimGroundedInSourceText(fact, rawSource)) {
            issues.push(`Unanchored or unsupported fact in keyFacts: "${fact}"`);
          }
        }
        for (const claim of output.supportedClaims || []) {
          if (!isClaimGroundedInSourceText(claim, rawSource)) {
            issues.push(`Unanchored or unsupported claim in supportedClaims: "${claim}"`);
          }
        }
      }
    }

    if (hasLongDash(JSON.stringify(output))) {
      issues.push('Source analysis contains prohibited long-dash punctuation.');
    }
    return { passed: issues.length === 0, issues };
  }

  // 2. Ideation Quality Gate
  if (mode === 'ideation') {
    const groups = Array.isArray(output.ideaGroups) ? output.ideaGroups : [];
    const flatIdeas = Array.isArray(output.ideas)
      ? output.ideas
      : groups.flatMap((group) => (Array.isArray(group?.ideas) ? group.ideas : []));

    if (flatIdeas.length === 0) {
      issues.push('Ideation response contains no opportunity proposals.');
      return { passed: false, issues };
    }
    if (flatIdeas.length > 10) {
      issues.push('Ideation response is over-generated. Prefer a focused portfolio of strong opportunities rather than excessive volume.');
    }

    const rawSource = `${input.sourceContent || input.pastedNotes || input.operatingCoreInstructions || ''}`.trim();

    for (const idea of flatIdeas) {
      const title = idea?.title || 'Untitled Idea';
      if (!idea?.title || !idea?.communicationJob || (!idea?.shortExplanation && !idea?.explanation)) {
        issues.push(`Opportunity "${title}" is missing required opportunity fields (title, communicationJob, explanation).`);
      }
      if (!idea?.coreTension || !idea?.desiredAudienceResponse || !idea?.strategicAngle) {
        issues.push(`Opportunity "${title}" is under-resolved: coreTension, desiredAudienceResponse, and strategicAngle are required.`);
      }

      const serializedIdea = JSON.stringify(idea);
      if (/\[INSERT[^\]]*\]|\[TBD[^\]]*\]/i.test(serializedIdea)) {
        issues.push(`Opportunity "${title}" contains placeholder-style fabricated blocker tokens ([INSERT]/[TBD]).`);
      }

      if (Array.isArray(idea?.availableEvidence) && rawSource.length > 0) {
        for (const evidence of idea.availableEvidence) {
          if (
            typeof evidence === 'string' &&
            !evidence.includes('Protected COH Kernel') &&
            !isClaimGroundedInSourceText(evidence, rawSource)
          ) {
            issues.push(`Opportunity "${title}" claims unanchored availableEvidence: "${evidence}"`);
          }
        }
      }
    }

    if (hasLongDash(JSON.stringify(output))) {
      issues.push('Ideation response contains prohibited long-dash punctuation.');
    }
    return { passed: issues.length === 0, issues };
  }

  // 3. Revision Quality Gate
  if (mode === 'revision') {
    const revisedCopy = typeof output.revisedCopy === 'string' ? output.revisedCopy.trim() : '';
    if (!revisedCopy || revisedCopy.length < 10) {
      issues.push('Revision response is missing non-empty revisedCopy.');
      return { passed: false, issues };
    }

    if (hasLongDash(revisedCopy)) {
      issues.push('Revised copy contains prohibited long-dash punctuation.');
    }

    if (/\[Translated to [^\]]+\]|\[Localized to [^\]]+\]|\[Offline Fallback\]/i.test(revisedCopy)) {
      issues.push('Revised copy contains fake offline translation fallback markers.');
    }

    const previousDraft = String(input.previousDraft || '').trim();
    if (previousDraft && normalizeText(revisedCopy).toLowerCase() === normalizeText(previousDraft).toLowerCase()) {
      issues.push('Revision returned the original draft unchanged.');
    }

    const targetLang = String(input.language || '').toLowerCase();
    const actionId = String(input.selectedRevisionAction || input.revisionInstruction || '').toLowerCase();
    const isPersianTarget = targetLang.includes('persian') || actionId.includes('persian') || actionId.includes('farsi');
    const isPortugueseTarget = targetLang.includes('portuguese') || actionId.includes('portuguese');

    if (isPersianTarget && !containsPersianScript(revisedCopy)) {
      issues.push('Persian revision/translation failed script validation: output does not contain Persian script.');
    }

    if (isPortugueseTarget && appearsUnchangedEnglish(revisedCopy, previousDraft)) {
      issues.push('Portuguese (PT-EU) translation failed language validation: output remains unchanged or predominantly English.');
    }

    return { passed: issues.length === 0, issues };
  }

  // 4. Reframe Quality Gate
  if (mode === 'reframe') {
    const reframedCopy = typeof output.reframedCopy === 'string' ? output.reframedCopy.trim() : '';
    if (!reframedCopy || reframedCopy.length < 15) {
      issues.push('Reframe response is missing non-empty reframedCopy.');
    }
    if (!Array.isArray(output.changedExplanation) || output.changedExplanation.length === 0) {
      issues.push('Reframe response is missing changedExplanation array.');
    }
    if (!Array.isArray(output.preservedExplanation) || output.preservedExplanation.length === 0) {
      issues.push('Reframe response is missing preservedExplanation array.');
    }
    if (hasLongDash(reframedCopy)) {
      issues.push('Reframed copy contains prohibited long-dash punctuation.');
    }
    if (reframedCopy.includes('As noted directly in the source material:')) {
      issues.push('Reframed copy contains synthetic auto-appended quote wrapper.');
    }

    const sourceContent = String(input.sourceContent || '').trim();
    if (sourceContent.length > 0 && reframedCopy.length > 0) {
      if (normalizeText(sourceContent).toLowerCase() === normalizeText(reframedCopy).toLowerCase()) {
        issues.push('Reframing returned the source text unchanged.');
      }

      const outputNums = reframedCopy.match(/\b\d+(?:[.,]\d+)?%?\b/g) || [];
      for (const num of outputNums) {
        if (!sourceContent.includes(num) && !(input.operatingCoreInstructions || '').includes(num)) {
          issues.push(`Reframed copy introduces untraceable number or date "${num}" not present in source.`);
        }
      }
    }

    return { passed: issues.length === 0, issues };
  }

  // 5. Standard Draft Generation Quality Gate
  const drafts = output.drafts || [];

  for (const draft of drafts) {
    const copy = draft.copy || '';

    if (!copy || copy.trim().length < 20) {
      issues.push(`${draft.label}: Copy is too short or empty.`);
      continue;
    }

    if (rawInput.length > 10 && copy.toLowerCase().startsWith(rawInput.substring(0, 40))) {
      issues.push(`${draft.label}: Copy starts with a direct repeat of the raw input topic.`);
    }

    if (hasLongDash(copy)) {
      issues.push(`${draft.label}: Contains prohibited long-dash punctuation.`);
    }

    const cliches = [
      'now more than ever',
      'in a world where',
      'at the intersection',
      "it's important to note",
      'dive into',
      'rapidly evolving landscape',
      'paradigm shift',
    ];
    for (const cliche of cliches) {
      if (copy.toLowerCase().includes(cliche)) {
        issues.push(`${draft.label}: Contains AI-style phrase: "${cliche}".`);
      }
    }

    if (copy.includes('Option A:') || copy.includes('Option B:') || copy.includes('[DRAFT]')) {
      issues.push(`${draft.label}: Copy contains metadata markers. Remove before publishing.`);
    }
  }

  if (drafts.length < 2) {
    issues.push('Provider returned fewer than 2 draft options.');
  }

  if (drafts.length >= 2) {
    const similarity = tokenSimilarity(drafts[0]?.copy, drafts[1]?.copy);
    if (similarity > 0.88) {
      issues.push('Draft options are too similar. Option B should use a materially different opening and narrative movement rather than paraphrasing Option A.');
    }
  }

  if (!output?.interpretedIntent?.centralProposition) {
    issues.push('Generated content package is missing a resolved centralProposition.');
  }

  validateVisualBrief(output.visualDesignBrief, issues);

  return { passed: issues.length === 0, issues };
}
