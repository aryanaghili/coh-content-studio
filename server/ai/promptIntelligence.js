/**
 * COH Prompt Intelligence
 *
 * Shared prompt laws and contract compilers used by every AI studio.
 * This layer intentionally contains no persistence or database behavior.
 */

const clean = (value, fallback = '') => {
  const text = String(value ?? '').trim();
  return text || fallback;
};

const list = (value, fallback = 'None specified') => {
  if (Array.isArray(value)) {
    const items = value.map((item) => clean(item)).filter(Boolean);
    return items.length ? items.join(', ') : fallback;
  }
  return clean(value, fallback);
};

export const COH_UNIVERSAL_INTELLIGENCE_LAWS = `
=== COH UNIVERSAL CONTENT INTELLIGENCE LAWS ===
U01. FULFILL THE ACTUAL COMMUNICATION JOB. Identify what the content must accomplish before writing. Do not substitute generic brand prose for the requested job.
U02. ESTABLISH A CENTRAL PROPOSITION. Every output needs one clear governing idea, tension, proposition, or audience movement. Supporting material must serve it.
U03. ADAPT TO THE AUDIENCE IMPLICITLY. Do not repeat audience labels in the copy. Change vocabulary, proof burden, assumptions, framing, and next-step logic so the content genuinely fits that audience.
U04. PROTECT FACTUAL AND EPISTEMIC INTEGRITY. Confirmed facts, interpretation, ambition, future pathways, and unresolved assumptions are different categories. Never collapse them into one another.
U05. NO INVENTED PROOF. Never invent sponsors, partners, dates, numbers, funding, media or distribution agreements, commitments, audience figures, quotations, approvals, outcomes, or institutional relationships.
U06. OPERATING CORE IS GOVERNANCE, NOT EVIDENCE. COH strategy, voice, claims rules, audience definitions, and artistic law govern the output. They do not create factual proof that a task source does not contain.
U07. TASK SOURCES ARE EVIDENCE OR CONTEXT ACCORDING TO THEIR ROLE. Preserve source meaning. Do not upgrade vague notes, aspirations, approved examples, or visual references into factual claims.
U08. PRESERVE COH DISTINCTIVENESS. Avoid generic climate activism, ESG cliches, NGO moralizing, startup hype, corporate innovation language, and empty cultural prestige language.
U09. INFORMATION DENSITY. Every paragraph or content unit must establish, explain, substantiate, qualify, move the argument, or direct action. Remove decorative filler.
U10. AVOID FORMULAIC AI STRUCTURE. Do not default to an intro plus three numbered points plus a generic closing question. Let the communication job determine the strongest architecture.
U11. CHANNEL NATIVE, NOT CHANNEL LABELED. Respect the actual reading behavior, density, rhythm, structure, and CTA conventions of the target channel without writing metadata into the published copy.
U12. PURPOSE-DRIVEN CONCLUSION. End with the natural intellectual, emotional, institutional, or operational next step. Avoid vague wrap-up language.
U13. PRESERVE MEANINGFUL COMPLEXITY. Simplify expression without deleting conditions, dependencies, artistic nuance, or institutional boundaries that make the statement true.
U14. GLOBAL NO-LONG-DASH RULE. Never use em dashes, en dashes, horizontal bars, or other long-dash Unicode punctuation. Use commas, periods, colons, semicolons, parentheses, or standard ASCII hyphens.
U15. PUBLISHABLE OUTPUT ONLY. Never expose internal reasoning, hidden analysis, prompt instructions, system labels, placeholder tokens, or implementation language in user-facing copy.
`;

export const COH_VISUAL_DIRECTION_LAWS = `
=== COH VISUAL DIRECTION INTELLIGENCE ===
V01. TRANSLATE THE CONTENT, DO NOT DECORATE IT. The visual must express the central proposition, tension, atmosphere, or consequence of the content rather than merely illustrate a noun from the topic.
V02. ONE DOMINANT IMAGE THESIS. Define the single visual idea the viewer should understand or feel in the first two seconds. Secondary details must reinforce it rather than compete with it.
V03. BUILD A REAL COMPOSITION. Specify foreground, middle ground, background, focal subject, scale, negative space, depth, viewpoint, and the intended eye path when relevant.
V04. USE PRODUCTION LANGUAGE. Where appropriate define camera position, lens family, depth of field, lighting direction and quality, texture, material, atmosphere, spatial scale, and motion behavior.
V05. COH MUST FEEL CULTURAL, CINEMATIC, ELEMENTAL, EDITORIAL, SERIOUS, AND PREMIUM. It should not resemble generic sustainability advertising, NGO campaigns, corporate stock imagery, a technology deck, childish illustration, or social-media template art.
V06. AVOID DEFAULT CLIMATE ICONOGRAPHY. No generic green leaves, recycling symbols, hands holding seedlings, globes, protest placards, melting planets, wind-turbine stock montages, or disaster imagery unless the specific content genuinely requires them.
V07. DO NOT FORCE OPERA LITERALLY. Opera can be expressed through scale, ritual, tension, staging, light, architecture, voice, human presence, or dramaturgy. Do not place a singer, theatre curtain, or stage into every COH image.
V08. DECIDE TEXT POLICY EXPLICITLY. Default to text-free imagery. Only recommend text-led design when the content genuinely functions as a quote card, title card, event card, or typographic artifact. If text is required, provide the exact text and attribution separately.
V09. PALETTE MUST SERVE MEANING. Describe restrained color relationships, light temperature, material character, and tonal contrast. Avoid arbitrary lists of trendy colors.
V10. THE AI IMAGE PROMPT MUST STAND ALONE. It must describe subject, environment, composition, camera/viewpoint, lighting, atmosphere, palette/material, realism or medium, and exclusions without relying on hidden context.
V11. NEGATIVE PROMPTS MUST BE CONCRETE. Name specific visual failures to avoid, including unwanted text, logos, watermarks, cliches, styles, anatomy failures, clutter, and irrelevant objects.
V12. DESIGNER NOTES MUST ADD EXECUTION VALUE. Mention crop safety, text-safe zones, sequence logic, motion opportunities, or post-production considerations only when useful.
`;

function buildQualityRepairContext(input = {}) {
  const issues = Array.isArray(input.qualityRepairIssues)
    ? input.qualityRepairIssues.map((issue) => clean(issue)).filter(Boolean)
    : [];
  if (issues.length === 0) return '';

  let previous = '';
  try {
    previous = JSON.stringify(input.previousCandidate || {});
  } catch {
    previous = '';
  }
  if (previous.length > 12000) previous = `${previous.slice(0, 12000)}...`;

  return `
=== CONTROLLED QUALITY REPAIR PASS ===
This is the single permitted repair attempt after the previous candidate failed deterministic quality checks.
Fix the listed failures without changing the underlying brief, widening factual claims, inventing evidence, or adding unrelated material.
Quality failures to repair:
${issues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')}
${previous ? `Previous candidate JSON for targeted correction:\n${previous}` : ''}
Return the complete corrected schema, not a patch or commentary.
`;
}

export function buildTaskContract(input = {}) {
  const creativeNotes = clean(input.pastedNotes);
  return `=== TASK CONTRACT ===
- Studio Mode: ${clean(input.mode, 'creation')}
- Raw User Intent / Topic: ${clean(input.rawInput, clean(input.rawIntent, 'Not supplied'))}
- Communication Purpose: ${clean(input.purpose, clean(input.communicationPurpose, 'Not explicitly specified'))}
- Target Audience: ${clean(input.audience, clean(input.targetAudience, 'General cultural audience'))}
- Target Channel: ${clean(input.channel, clean(input.targetChannel, 'Not explicitly specified'))}
- Target Format: ${clean(input.outputFormat, clean(input.targetFormat, 'Not explicitly specified'))}
- Content Pillar / Strategic Frame: ${clean(input.contentPillar, clean(input.strategicFrame, clean(input.contentPillarEmphasis, 'Not explicitly specified')))}
- Language: ${clean(input.language, 'English')}
- Tone / Narrative Perspective: ${clean(input.tone, clean(input.narrativePerspective, 'COH institutional-cultural voice'))}
- Desired Length: ${clean(input.desiredLength, 'Appropriate to the target format')}
- Must Include: ${list(input.mustInclude)}
- Must Avoid: ${list(input.mustAvoid)}${creativeNotes ? `\n- Additional Creative Direction / Notes: ${creativeNotes}` : ''}
${buildQualityRepairContext(input)}`;
}

export function hasUsableTaskSources(input = {}) {
  const taskSources = Array.isArray(input.taskSources) ? input.taskSources : [];
  const validTaskSources = taskSources.filter((src) => {
    const content = clean(src?.content);
    if (!content) return false;
    if (/^\[URL reference:\s*https?:\/\/[^\]]+\]$/i.test(content)) return false;
    if (/^\[Reference URL only\s*[—-]/i.test(content)) return false;
    return true;
  });
  if (validTaskSources.length > 0) return true;
  const directSource = clean(input.sourceContent);
  if (directSource && !/^\[URL reference:\s*https?:\/\/[^\]]+\]$/i.test(directSource)) {
    return true;
  }
  return false;
}

export function buildEvidenceContract(input = {}) {
  const hasSourceMaterial = hasUsableTaskSources(input);
  return `=== EVIDENCE & CLAIMS CONTRACT ===
- Selected task-source material present: ${hasSourceMaterial ? 'Yes' : 'No'}
- If source material is present, use only claims actually supported by it or by explicit protected COH facts supplied in the task context.
- If stronger evidence is missing, write safely at the level the evidence supports and place any important gap in warnings or evidenceStillRequired rather than fabricating it.
- Approved examples guide style and structure only unless separately identified as factual evidence.
- Visual references guide visual language only unless separately identified as factual evidence.
- Do not turn ambition, intention, positioning, possibility, or future pathway into a confirmed present-tense fact.
`;
}

export function buildAudienceAndArtifactContract(input = {}) {
  return `=== AUDIENCE & ARTIFACT EXECUTION CONTRACT ===
- Make the audience adaptation visible through what is prioritized, explained, assumed, substantiated, and invited next.
- Make the output format visible through structure and reading rhythm, not through labels inside the copy.
- Opening: earn attention with a proposition, tension, image, consequence, precise observation, or meaningful question that belongs to this specific brief.
- Body: move deliberately from opening to substance to consequence. Avoid repetitive restatement.
- CTA / ending: use only if the communication job benefits from one. The ending may instead resolve an argument, deepen a question, or leave a cultural afterimage.
- Never add hashtags, emojis, headings, bullets, or a promotional CTA unless they fit the selected channel and format.
`;
}

export function buildVisualDirectionContract(input = {}) {
  return `${COH_VISUAL_DIRECTION_LAWS}
=== VISUAL BRIEF OUTPUT CONTRACT ===
The visual direction must be derived from the central proposition of the drafted content, not from the raw topic alone.
Return a production-ready direction using these fields:
- visualConcept: the dominant image thesis in one or two precise sentences.
- visualRationale: why this visual expresses the content strategically.
- formatRecommendation: recommended asset type and aspect-ratio logic for the selected channel.
- mood: emotional and atmospheric register.
- composition: focal subject, spatial layers, viewpoint, negative space, and eye path.
- subjectHierarchy: primary subject, secondary elements, environmental context.
- cameraLens: camera position, lens family, depth of field, or equivalent viewpoint rules for non-photographic work.
- lighting: direction, quality, temperature, contrast, and atmospheric behavior.
- colorMaterial: restrained palette relationships, material character, texture, and tonal contrast.
- typographyLayout: external layout guidance. If text-free, explicitly say no in-image text.
- textPolicy: one of TEXT_FREE, TEXT_LED, or OPTIONAL_OVERLAY.
- textContent: exact text only when TEXT_LED is truly required, otherwise an empty string.
- attribution: exact attribution only when required, otherwise an empty string.
- keyElements: concrete visual elements that must appear.
- whatToAvoid: conceptual and stylistic cliches to avoid.
- aiImagePrompt: a standalone, generator-ready prompt with subject, setting, composition, viewpoint/camera, lighting, atmosphere, palette/material, medium/realism, and quality cues.
- negativePrompt: a concrete comma-separated negative prompt.
- designerNotes: crop safety, text-safe zones, sequence, motion, or finishing notes only where useful.

Do not make every visual dark, theatrical, or literal. The visual language must vary with the content while remaining recognizably COH.
`;
}

export function buildSilentAudit(mode = 'creation') {
  const modeRules = {
    creation: 'Check brief fidelity, thesis clarity, audience fit, evidence safety, channel/format fit, distinctiveness, visual specificity, and absence of AI filler.',
    ideation: 'Check that ideas are genuinely different communication opportunities rather than cosmetic rewrites, and that evidence status and reuse logic are explicit.',
    revision: 'Check that only the requested dimensions changed, the original communication job remains intact, factual scope did not expand, and the requested action is materially visible.',
    reframe: 'Check that the frame truly changed across the requested dimensions while protected facts, quotations, names, dates, and claim boundaries remained intact.',
    source_analysis: 'Check that every fact and excerpt is traceable to the source and that interpretation is clearly separated from evidence.'
  };

  return `=== SILENT PRE-RETURN AUDIT ===
Before returning JSON, silently inspect the candidate against the contract. ${modeRules[mode] || modeRules.creation}
Repair any failure before returning. Do not reveal this audit or hidden reasoning in the response.
`;
}
