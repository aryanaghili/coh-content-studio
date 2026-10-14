import type { CalendarItem } from '../components/EditorialCalendarStudio';

export function isAdvisoryProofNotice(text: string): boolean {
  const trimmed = (text || '').trim();
  if (!trimmed) return true;
  return /^(proof needed|source needed|evidence needed|add partner|need |needs |tbd|specific evidence|confirm )/i.test(
    trimmed
  ) || /\{[^}]+\}/.test(trimmed);
}

export function sanitizePlaceholderTokens(text: string): string {
  if (!text) return '';
  return text.replace(/\{([^}]+)\}/g, '$1').trim();
}

export function buildAdvancedBriefFromCalendarItem(workItem: Partial<CalendarItem> & Record<string, any>) {
  const topic = sanitizePlaceholderTokens(workItem.title || '');
  const angle = sanitizePlaceholderTokens(workItem.editorialThesis || '');
  const coreMessage = sanitizePlaceholderTokens(workItem.coreMessage || '');
  const audience = workItem.audience || 'General Public';
  const secondaryAudience = workItem.secondaryAudience;
  const channel = workItem.channel || 'LinkedIn';
  const format = workItem.format || 'Post';
  const pillar = workItem.strategicFocus || 'General / Custom';
  const adoptionTrack = workItem.adoptionTrack || 'General / Open';
  const audienceInsight = sanitizePlaceholderTokens(workItem.audienceInsight || '');
  const proofNeeded = sanitizePlaceholderTokens(workItem.proofNeeded || '');
  const draftInstruction = sanitizePlaceholderTokens(workItem.draftInstruction || '');
  const reasonForRecommendation = sanitizePlaceholderTokens(workItem.reasonForRecommendation || '');
  const riskToAvoid = sanitizePlaceholderTokens(workItem.riskToAvoid || '');

  // Separate confirmed factual inclusions from advisory "Proof needed" notices
  const isAdvisoryProof = isAdvisoryProofNotice(proofNeeded);
  const confirmedMustInclude = isAdvisoryProof ? '' : proofNeeded;

  let compiledContext = `Created from Editorial Calendar

Calendar item:
${topic}

Editorial thesis:
${angle}

Core message:
${coreMessage}

Audience:
${audience}${secondaryAudience ? ` with secondary audience ${secondaryAudience}` : ''}

Channel and format:
${channel} - ${format}

Strategic role:
This item supports ${pillar} through ${adoptionTrack}.

Audience insight:
${audienceInsight}

Evidence advisory:
${proofNeeded || 'Operating Core-backed framing'}

Draft instruction:
${draftInstruction}`;

  if (reasonForRecommendation) {
    compiledContext += `\n\nReason for recommendation:\n${reasonForRecommendation}`;
  }

  if (riskToAvoid) {
    compiledContext += `\n\nRisk to avoid:\n${riskToAvoid}`;
  }

  let creationIntent = 'Infer automatically';
  const unitType = (workItem.contentUnitType || '').toLowerCase();
  if (unitType.includes('documentary')) creationIntent = 'documentary / media update';
  else if (unitType.includes('newsletter')) creationIntent = 'newsletter section';
  else if (unitType.includes('sponsor')) creationIntent = 'sponsor-facing message';
  else if (unitType.includes('partner')) creationIntent = 'partner update';
  else if (unitType.includes('event')) creationIntent = 'event build-up';
  else if (unitType.includes('explainer') || unitType.includes('educational')) creationIntent = 'explainer';
  else if (unitType.includes('direct')) creationIntent = 'direct outreach';

  const packScope: 'Multi-Channel Pack' | 'Single Channel' = workItem.isMultiChannelPack
    ? 'Multi-Channel Pack'
    : 'Single Channel';

  return {
    topic: compiledContext,
    directionMode: 'custom' as const,
    angle,
    customDirection: `Core Message: ${coreMessage}\nInstruction: ${draftInstruction}${
      isAdvisoryProof && proofNeeded ? `\nEvidence Advisory (Do not invent): ${proofNeeded}` : ''
    }`,
    channel,
    outputFormat: format,
    pillar,
    audience,
    purpose: adoptionTrack,
    mustInclude: confirmedMustInclude,
    mustAvoid: riskToAvoid,
    creationIntent,
    creationScope: packScope,
    targetChannels: workItem.targetChannels || ['LinkedIn', 'Instagram', 'Newsletter', 'Website'],
    evidenceAdvisory: isAdvisoryProof ? proofNeeded : undefined
  };
}
