/**
 * Universal AI Prompt Builder
 */
export function buildGenerationPrompt(input) {
  const isRevision = input.mode === 'revision';
  const isIdeation = input.mode === 'ideation';
  const isSourceAnalysis = input.mode === 'source_analysis';

  if (isSourceAnalysis) {
    return `You are the COH Source Intelligence Analyst for Climate Opera Haus.
Analyze the provided source material strictly under COH claim-safety and evidence governance.

SOURCE METADATA:
- Title: "${input.sourceTitle || 'Untitled Source'}"
- Source Type: "${input.sourceType || 'Other'}"
- Source Notes: "${input.sourceNotes || ''}"

RAW SOURCE CONTENT:
"""
${input.rawInput || input.sourceContent || ''}
"""

${input.operatingCoreInstructions ? `\n${input.operatingCoreInstructions}\n` : ''}

CRITICAL CLAIM DISCIPLINE RULES:
1. This output is an AI interpretation of the source, not the source itself.
2. Never convert ambiguity, aspiration, or future plans into confirmed facts.
3. Unsupported inferences must be placed in cautionsAndAmbiguities, never in keyFacts or supportedClaims.
4. Missing evidence remains missing. Flag missing details in cautionsAndAmbiguities.
5. Every item in usefulExcerpts MUST be an exact, verbatim substring copied directly from RAW SOURCE CONTENT. Never fabricate or paraphrase quotes.
6. If Source Type is "Approved Example", keyFacts and supportedClaims MUST be empty arrays because Approved Examples guide tone and structure only, not factual claims.
7. If Source Type is "Visual Reference", keyFacts and supportedClaims MUST be empty arrays because Visual References guide visual direction only, not factual copy.
8. Do not use em dashes in any output string.

OUTPUT FORMAT:
Return a JSON object matching this exact schema:
{
  "disclaimer": "AI interpretation of the source, not the source itself.",
  "keyFacts": ["Traceable fact 1 directly stated in the source"],
  "supportedClaims": ["Claim that can be safely stated based on the source"],
  "strategicContext": "Concise explanation of how this source fits COH strategic narrative",
  "cautionsAndAmbiguities": ["Any ambiguity, unverified aspiration, missing proof, or boundary warning"],
  "usefulExcerpts": ["Exact verbatim substring from the raw source text"],
  "relevantAudiences": ["Matching COH audience names"],
  "relevantChannels": ["Matching COH channel names"],
  "relevantPillars": ["Matching COH content pillars"],
  "contentOpportunityHints": ["Specific, actionable ways to use this source in Ideation or Creation"]
}`;
  }

  if (isIdeation) {
    return `You are the COH Opportunity-Led Ideation Strategist for Climate Opera Haus.
Analyze the user's input or situation: "${input.rawInput}".
Selected Language: ${input.language || 'English'}
Selected Audience: ${input.audience || 'General Public'}
Quality Filter: ${input.quality || 'Practical'}
Depth Level: ${input.depth || 'Standard'}

IDEATION 2.0 MENTAL MODEL:
Situation or Source -> Communication Opportunities -> Evidence Check -> Reuse Check -> Strong Idea -> Content Brief.

CLASSIFICATION & OPPORTUNITY TASK:
1. Classify the input into one of: keyword, question, thesis, rough idea, paragraph, campaign direction, emotional theme, educational topic, comparison, audience problem, event or promotion need, cultural argument.
2. Formulate distinct, non-cosmetic communication opportunities across the COH opportunity groups:
   - Strongest Directions
   - Sharp Hooks
   - Thought Leadership Angles
   - Educational Angles
   - Emotional or Reflective Angles
   - Storytelling Angles
   - Promotional Angles
   - Campaign-Series Ideas
   - Experimental Ideas

RULES FOR OPPORTUNITIES:
- Respond in the selected language: ${input.language || 'English'}.
- Never use em dashes in any text.
- Every idea MUST define a clear COH Communication Job answering "Why should this content exist?" (e.g., Establish institutional credibility, Explain artistic logic, Create sponsor relevance, Build climate literacy, Invite public participation, Clarify a milestone, Deepen cultural meaning).
- Separate Available Evidence (what attached sources or Protected Kernel legitimately support) from Evidence Still Required (advisory note on what would be needed before stronger claims could safely be made; never output [INSERT] or [TBD] placeholder blockers).
- Ensure strategic diversity across communication job, audience, strategic angle, and narrative perspective without inventing non-COH customer segments.
${input.operatingCoreInstructions ? `\n${input.operatingCoreInstructions}\n` : ''}

OUTPUT FORMAT:
Return a JSON object matching this schema:
{
  "inputInterpretation": {
    "inputType": "classified input type here",
    "mainTheme": "theme of input here",
    "bestIdeationMode": "recommended mode"
  },
  "ideaGroups": [
    {
      "groupTitle": "Strongest Directions",
      "ideas": [
        {
          "title": "Title here",
          "category": "Strongest Directions",
          "communicationJob": "Establish institutional credibility | Explain artistic logic | Create sponsor relevance | Build climate literacy | Invite public participation | Clarify a milestone | Deepen cultural meaning",
          "shortExplanation": "Core idea / concept here",
          "whyItWorks": "Why it matters strategically here",
          "coreTension": "Core tension or audience problem addressed",
          "desiredAudienceResponse": "Desired audience shift or response",
          "availableEvidence": ["Traceable fact or kernel principle currently available"],
          "evidenceStillRequired": ["Advisory note on additional evidence needed for stronger claims"],
          "unresolvedAssumptions": ["Assumption to verify before publication"],
          "bestChannelFit": "LinkedIn | Instagram | Newsletter | Website | Email / Direct Outreach",
          "suggestedOutputFormat": "Post | Caption | Carousel | Thought Piece | Sponsor Pitch Paragraph",
          "suggestedAudience": "General Public | Sponsors & Patrons | Strategic Partners",
          "suggestedPillar": "The Opera & Worldbuilding | Science & Planetary Reality | Institutional & Sponsor Value | Behind the Creation & Craft | Cultural Participation & Ritual",
          "strategicAngle": "Distinct strategic framing angle",
          "suggestedTone": "Suggested tone here",
          "possibleHook": "Hook line here",
          "possibleFirstPost": "Full text suggestion for the first post here",
          "riskToAvoid": "Specific pitfalls or cliches to avoid here",
          "nextStep": "Actionable next step here"
        }
      ]
    }
  ],
  "warnings": []
}`;
  }

  if (isRevision) {
    let languageInstruction = `- Output the revised copy fully in ${input.language}. Keep approved proper nouns intact.`;
    
    // Strict Translation Boundaries
    if (input.revisionInstruction && input.revisionInstruction.includes('Target Language')) {
      languageInstruction = `- Translate the draft into the selected target language: ${input.language}.
- Output only the translated/revised text.
- Do not include explanations.
- Do not include fallback labels.
- Preserve meaning.
- Preserve claim safety.
- Preserve COH voice.
- Do not invent facts, partners, sponsors, dates, numbers, funding, or commitments.`;

      if (input.language && input.language.includes('Persian, colloquial')) {
        languageInstruction += `\n- If target language is Persian, colloquial / narration-ready, output natural spoken Persian, not formal mechanical Persian.`;
      } else if (input.language === 'Persian') {
        languageInstruction += `\n- If target language is Persian, output Persian.`;
      }
    }

    return `You are an expert copy editor revising a draft.
Original Brief details:
- Input topic: ${input.rawInput}
- Channel: ${input.channel}
- Format: ${input.outputFormat}
- Audience: ${input.audience}
- Purpose: ${input.purpose}
- Language: ${input.language}
- Tone: ${input.tone}

Selected Revision Action: ${input.selectedRevisionAction || 'custom'}
Instruction: ${input.revisionInstruction || 'None'}

Draft Copy to Revise:
"""
${input.previousDraft}
"""

OPERATIONAL RULES:
${languageInstruction}
${input.operatingCoreInstructions ? `\n${input.operatingCoreInstructions}\n` : ''}


OUTPUT FORMAT:
Return a JSON object matching this schema:
{
  "revisedCopy": "The fully revised, clean copy here",
  "revisionSummary": "Short explanation of changes made",
  "claimsChanged": [],
  "warnings": [],
  "qualityCheck": {
    "passed": true,
    "issues": []
  }
}`;
  }

  const isWhatsApp = input.channel === 'Email / Direct Outreach' && input.outputFormat === 'WhatsApp Message';

  // Standard Draft Generation (Quick Create or Advanced Brief)
  return `You are the COH Content Marketing Mastermind for Climate Opera Haus.

ROLE: Create professional, source-grounded content based on the user's brief.

CANONICAL BRIEF INPUT:
- Mode: ${input.mode}
- User Input: "${input.rawInput}"
- Channel: ${input.channel}
- Output Format: ${input.outputFormat}
- Target Audience: ${input.audience}
- Purpose: ${input.purpose}
- Content Pillar: ${input.contentPillar}
- Selected Language: ${input.language}
- Tone Level: ${input.tone}
- Desired Length: ${input.desiredLength}
- Framing Mode: ${input.framingMode}
- Selected Framing: ${input.selectedFraming || 'none'}
- Pasted Notes / Sources: ${input.pastedNotes || '(None)'}

COH BRAIN & CONTENT RULES GUARDRAILS:
${input.operatingCoreInstructions ? `\n${input.operatingCoreInstructions}\n` : ''}

CRITICAL WRITING RULES:
1. Do not repeat the raw input topic inside generic templates (e.g., avoid "Regarding the topic of...", "In focus: [raw input]").
2. If the input is a question, answer it directly. If it is a thesis, build the argument. If it is promotional, create action-oriented copy.
3. Keep metadata outside the final copy. Do not include labels such as "WhatsApp Message:".
4. Fully write in ${input.language}. No mixed English and target language sentences.

OUTPUT FORMAT:
Return a JSON object matching this schema:
{
  "interpretedIntent": {
    "inputType": "question | topic | thesis | argument | comparison | message | etc.",
    "userIntent": "Brief summary of user's core intent",
    "subject": "Core subject",
    "communicationGoal": "Main goal",
    "cohRole": "central | secondary | light | none",
    "missingContext": [],
    "riskLevel": "low | medium | high"
  },
  "contentPlan": {
    "coreArgument": "Brief outline of the argument or answer",
    "openingStrategy": "Opening hook strategy",
    "structure": ["Section 1", "Section 2"],
    "proofPointsUsed": [],
    "claimsAvoided": [],
    "cta": "Call to action text"
  },
  "drafts": [
    {
      "label": "Option A",
      "style": "Direct / Institutional",
      "copy": "Full drafted copy for Option A",
      "confidence": "source-backed | based on brief | needs confirmation",
      "notes": "Style explanation"
    },
    {
      "label": "Option B",
      "style": "Human / Narrative",
      "copy": "Full drafted copy for Option B",
      "confidence": "source-backed | based on brief | needs confirmation",
      "notes": "Style explanation"
    }
  ],
  "shorterVersion": "A brief 1-2 sentence version of the copy",
  "visualDesignBrief": {
    "visualConcept": "Concept description",
    "formatRecommendation": "Recomended image/video layout",
    "mood": "Atmosphere and mood",
    "composition": "Visual composition style",
    "colorMaterial": "Hex colors and textures",
    "typographyLayout": "Text sizing and alignment recommendations",
    "keyElements": "Crucial details",
    "whatToAvoid": "Clichés or graphics to avoid",
    "aiImagePrompt": "Detailed prompt for generating visual",
    "designerNotes": "Designer suggestions"
  },
  "editorialWarnings": [],
  "qualityCheck": {
    "passed": true,
    "issues": []
  }
}`;
}
