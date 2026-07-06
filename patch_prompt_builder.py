import os

filepath = "server/ai/promptBuilder.js"
with open(filepath, "r") as f:
    content = f.read()

target_is_revision = """  if (isRevision) {
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
\"\"\"
${input.previousDraft}
\"\"\"

OPERATIONAL RULES:
- Output the revised copy fully in ${input.language}. Keep approved proper nouns intact.
${input.operatingCoreInstructions ? `\\n${input.operatingCoreInstructions}\\n` : ''}


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
  }"""

replacement_is_revision = """  if (isRevision) {
    let languageInstruction = `- Output the revised copy fully in ${input.language}. Keep approved proper nouns intact.`;
    
    // Strict Translation Boundaries
    if (input.revisionInstruction && input.revisionInstruction.includes('Target Language')) {
      languageInstruction = `- Translate the draft into the selected target language: ${input.language}.
- Output only the revised translated draft.
- Do not include explanations.
- Do not include bracketed fallback messages.
- Preserve meaning and factual boundaries.
- Preserve COH voice and Operating Core rules.
- Preserve claim safety.
- Adapt tone and structure to selected channel if selected: ${input.channel}.
- Do not invent facts, partners, dates, sponsors, numbers, or commitments.`;

      if (input.language && input.language.includes('Persian, colloquial')) {
        languageInstruction += `\\n- CRITICAL FOR PERSIAN: The output must be natural spoken Persian, not formal written Persian, not mechanical translation, and not mixed English/Persian unless unavoidable.`;
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
\"\"\"
${input.previousDraft}
\"\"\"

OPERATIONAL RULES:
${languageInstruction}
${input.operatingCoreInstructions ? `\\n${input.operatingCoreInstructions}\\n` : ''}


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
  }"""

content = content.replace(target_is_revision, replacement_is_revision)

with open(filepath, "w") as f:
    f.write(content)

print("Done patching promptBuilder.js")
