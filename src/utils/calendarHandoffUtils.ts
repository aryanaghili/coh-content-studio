import type { CalendarItem } from '../components/EditorialCalendarStudio';

export function buildAdvancedBriefFromCalendarItem(workItem: any) {
  // Extract all the rich fields from the workItem (which is a CalendarItem shaped object)
  const topic = workItem.title || '';
  const angle = workItem.editorialThesis || '';
  const coreMessage = workItem.coreMessage || '';
  const audience = workItem.audience || 'General Public';
  const secondaryAudience = workItem.secondaryAudience;
  const channel = workItem.channel || 'LinkedIn';
  const format = workItem.format || 'Post';
  const pillar = workItem.strategicFocus || 'General / Custom';
  const adoptionTrack = workItem.adoptionTrack || 'General / Open';
  const audienceInsight = workItem.audienceInsight || '';
  const proofNeeded = workItem.proofNeeded || '';
  const draftInstruction = workItem.draftInstruction || '';
  const reasonForRecommendation = workItem.reasonForRecommendation || '';
  const riskToAvoid = workItem.riskToAvoid || '';

  // Compile the full context for "What should this content respond to or develop?"
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

Proof needed:
${proofNeeded}

Draft instruction:
${draftInstruction}`;

  if (reasonForRecommendation) {
    compiledContext += `\n\nReason for recommendation:\n${reasonForRecommendation}`;
  }

  if (riskToAvoid) {
    compiledContext += `\n\nRisk to avoid:\n${riskToAvoid}`;
  }

  // Infer creation intent from content unit type
  let creationIntent = 'Infer automatically';
  const unitType = (workItem.contentUnitType || '').toLowerCase();
  if (unitType.includes('documentary')) creationIntent = 'documentary / media update';
  else if (unitType.includes('newsletter')) creationIntent = 'newsletter section';
  else if (unitType.includes('sponsor')) creationIntent = 'sponsor-facing message';
  else if (unitType.includes('partner')) creationIntent = 'partner update';
  else if (unitType.includes('event')) creationIntent = 'event build-up';
  else if (unitType.includes('explainer') || unitType.includes('educational')) creationIntent = 'explainer';
  else if (unitType.includes('direct')) creationIntent = 'direct outreach';

  const packScope: "Multi-Channel Pack" | "Single Channel" = workItem.isMultiChannelPack ? 'Multi-Channel Pack' : 'Single Channel';

  return {
    topic: compiledContext,
    directionMode: 'custom' as const,
    angle: angle,
    customDirection: `Core Message: ${coreMessage}\nInstruction: ${draftInstruction}`,
    channel: channel,
    outputFormat: format,
    pillar: pillar,
    audience: audience,
    purpose: adoptionTrack,
    mustInclude: proofNeeded,
    mustAvoid: riskToAvoid,
    creationIntent: creationIntent,
    creationScope: packScope,
    targetChannels: workItem.targetChannels || ['LinkedIn', 'Instagram', 'Newsletter', 'Website'],
  };
}
