import os
import re

filepath = "src/App.tsx"
with open(filepath, "r") as f:
    content = f.read()

# 1. Add import
if "import { LANGUAGES, getLanguageDirection }" not in content:
    content = content.replace(
        "import { aiService } from './lib/ai';", # doesn't exist
        "import { LANGUAGES, getLanguageDirection } from './lib/languages';"
    )
    if "import { LANGUAGES" not in content:
        # just add to top
        content = content.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { LANGUAGES, getLanguageDirection } from './lib/languages';")

# 2. Remove const LANGUAGES = [ ... ];
content = re.sub(r"const LANGUAGES = \[\n(?:  '[^']+',\n)*  '[^']+'\n\];", "", content)

# 3. Replace {['English', 'French', 'Spanish', 'German', 'Dutch', 'Persian'].map(opt => (
#    <option key={opt} value={opt}>{opt}</option>
#  ))}
#  with LANGUAGES.map
content = re.sub(
    r"\{\['English', 'French', 'Spanish', 'German', 'Dutch', 'Persian'\]\.map\(opt => \(\n\s*<option key=\{opt\} value=\{opt\}>\{opt\}</option>\n\s*\)\)\}",
    r"{LANGUAGES.map(l => (\n                            <option key={l.id} value={l.label}>{l.label}</option>\n                          ))}",
    content
)

# 4. Replace {LANGUAGES.map(l => (
#       <option key={l} value={l}>{l}</option>
#    ))}
content = re.sub(
    r"\{LANGUAGES\.map\(l => \(\n\s*<option key=\{l\} value=\{l\}>\{l\}</option>\n\s*\)\)\}",
    r"{LANGUAGES.map(l => (\n                          <option key={l.id} value={l.label}>{l.label}</option>\n                        ))}",
    content
)


# 5. Fix applyRevision logic
apply_revision_target = """          if (actionDef?.group === 'Translation & Localization') {
            instruction += `. Target Language: ${externalContentLanguage}. Preserve meaning but adapt tone naturally for this language. Avoid literal machine translation. `;
            if (externalContentLanguage === 'Persian') {
              instruction += `CRITICAL: Output must be natural, readable, and spoken-friendly. Avoid formal mechanical Persian. Avoid stiff translation patterns. Keep the COH voice.`;
            } else if (externalContentLanguage === 'English') {
              instruction += `CRITICAL: Output should be polished, professional, and clear. Keep the COH voice.`;
            } else {
              instruction += `CRITICAL: Adapt to natural usage in ${externalContentLanguage}. Keep the COH voice.`;
            }
          }"""

apply_revision_replacement = """          if (actionDef?.group === 'Translation & Localization') {
            if (generationMode !== 'ai' || aiStatus !== 'connected') {
              throw new Error('Translation requires AI generation. Please configure AI Connection in Settings.');
            }
            instruction += `. Target Language: ${externalContentLanguage}. Preserve meaning but adapt tone naturally for this language. Avoid literal machine translation. `;
            if (externalContentLanguage.includes('Persian')) {
              instruction += `CRITICAL: Output must be natural, readable, and spoken-friendly. Avoid formal mechanical Persian. Avoid stiff translation patterns. Keep the COH voice.`;
            } else if (externalContentLanguage === 'English') {
              instruction += `CRITICAL: Output should be polished, professional, and clear. Keep the COH voice.`;
            } else {
              instruction += `CRITICAL: Adapt to natural usage in ${externalContentLanguage}. Keep the COH voice.`;
            }
          }"""

content = content.replace(apply_revision_target, apply_revision_replacement)


# 6. Change fallback to throw for Translation
fallback_target = """          if (action === 'custom-instruction') {
            actionLabel = `Custom: ${customRevisionInstruction || 'Rewrite'}`;
            revised = `[Revised based on: "${customRevisionInstruction}"]\\n\\n${revised}\\n\\n(Adjusted alignment and framing to adhere to your instruction.)`;
            setCustomRevisionInstruction('');
          } else {
            revised = `[${actionLabel} applied via fallback]\\n\\n${revised}`;
          }"""

fallback_replacement = """          if (action === 'custom-instruction') {
            actionLabel = `Custom: ${customRevisionInstruction || 'Rewrite'}`;
            revised = `[Revised based on: "${customRevisionInstruction}"]\\n\\n${revised}\\n\\n(Adjusted alignment and framing to adhere to your instruction.)`;
            setCustomRevisionInstruction('');
          } else {
            const actionDef = REVISION_ACTIONS.find(a => a.id === action);
            if (actionDef?.group === 'Translation & Localization') {
              throw new Error('Translation requires AI generation. Please configure AI Connection in Settings.');
            }
            revised = `[${actionLabel} applied via fallback]\\n\\n${revised}`;
          }"""

content = content.replace(fallback_target, fallback_replacement)


# 7. outputDirection for textarea
# We have a textarea in Revision Studio displaying activeDraftText.
# We need to find it and add dir={getLanguageDirection(externalContentLanguage)}
textarea_target = """                  <textarea
                    value={activeDraftText}
                    onChange={(e) => setActiveDraftText(e.target.value)}
                    placeholder="Output will appear here..."
                    className="w-full h-[500px] bg-coh-cream/50 text-coh-navy p-4 focus:outline-none resize-none"
                  />"""

textarea_replacement = """                  <textarea
                    value={activeDraftText}
                    onChange={(e) => setActiveDraftText(e.target.value)}
                    placeholder="Output will appear here..."
                    dir={getLanguageDirection(externalContentLanguage)}
                    className="w-full h-[500px] bg-coh-cream/50 text-coh-navy p-4 focus:outline-none resize-none"
                  />"""

content = content.replace(textarea_target, textarea_replacement)


with open(filepath, "w") as f:
    f.write(content)

print("Done patching App.tsx")
