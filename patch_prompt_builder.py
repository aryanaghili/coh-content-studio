import os

pb_file = "server/ai/promptBuilder.js"
with open(pb_file, "r") as f:
    content = f.read()

old_block = """    // Strict Translation Boundaries
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
    }"""

new_block = """    // Strict Translation Boundaries
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
        languageInstruction += `\\n- If target language is Persian, colloquial / narration-ready, output natural spoken Persian, not formal mechanical Persian.`;
      } else if (input.language === 'Persian') {
        languageInstruction += `\\n- If target language is Persian, output Persian.`;
      }
    }"""

content = content.replace(old_block, new_block)

with open(pb_file, "w") as f:
    f.write(content)
