/**
 * Universal AI Prompt Builder
 */
export function buildGenerationPrompt(input) {
  const isRevision = input.mode === 'revision';
  const isIdeation = input.mode === 'ideation';

  if (isIdeation) {
    return `You are a creative strategist and ideation brain for content creation.
Analyze the user's input: "${input.rawInput}".
Selected Language: ${input.language || 'English'}
Selected Audience: ${input.audience || 'General Public'}

CLASSIFICATION TASK:
1. Classify the input into one of: keyword, question, thesis, rough idea, paragraph, campaign direction, emotional theme, educational topic, comparison, audience problem, event or promotion need, cultural argument.
2. Formulate 9 distinct idea groups, generating exactly one creative idea card for each:
   - Strongest Directions
   - Sharp Hooks
   - Thought Leadership Angles
   - Educational Angles
   - Emotional or Reflective Angles
   - Storytelling Angles
   - Promotional Angles
   - Campaign-Series Ideas
   - Experimental Ideas

RULES FOR IDEAS:
- Respond in the selected language: ${input.language || 'English'}.
${input.operatingCoreInstructions ? `\n${input.operatingCoreInstructions}\n` : ''}
- Each idea card must be fully formed with: title, shortExplanation, whyItWorks, bestChannelFit, suggestedOutputFormat, suggestedAudience, suggestedTone, possibleHook, possibleFirstPost, riskToAvoid, nextStep.

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
          "shortExplanation": "Explanation here",
          "whyItWorks": "Why it works here",
          "bestChannelFit": "LinkedIn | Instagram | Newsletter | Website | etc.",
          "suggestedOutputFormat": "Post | Caption | Carousel | Thought Piece | etc.",
          "suggestedAudience": "Target audience here",
          "suggestedTone": "Suggested tone here",
          "possibleHook": "Hook line here",
          "possibleFirstPost": "Full text suggestion for the first post here",
          "riskToAvoid": "Specific pitfalls or clichés to avoid here",
          "nextStep": "Actionable next step here"
        }
      ]
    },
    ... (continue for all 9 groups)
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
