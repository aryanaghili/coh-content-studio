import os

app_file = "src/App.tsx"
with open(app_file, "r") as f:
    content = f.read()

start_marker = "    const applyRevision = async (action: string) => {"
end_marker = "      const newVersion = activeDraftVersion + 1;"

start_idx = content.find(start_marker)

if start_idx != -1:
    end_idx = content.find(end_marker, start_idx)
    
    if end_idx != -1:
        # We replace up to the newVersion assignment to avoid touching the history update
        new_block = """    const runRevision = async (action: string) => {
    if (activeRevisionAction) return;
    setActiveRevisionAction(action);
    setRevisionSuccessAction(null);
    setActiveRevisionError(null);

    let revised = activeDraftText;
    let actionLabel = REVISION_ACTIONS.find(a => a.id === action)?.label || action;

    try {
      if (action === 'clean-ai-punctuation') {
        revised = cleanWritingArtifacts(revised);
        setCleanPunctuationNote('Cleaned punctuation and hidden characters. Meaning preserved.');
        setTimeout(() => setCleanPunctuationNote(''), 4000);
      } else {
        if (generationMode === 'ai' && aiStatus === 'connected') {
          const actionDef = REVISION_ACTIONS.find(a => a.id === action);
          
          let instruction = action === 'custom-instruction' ? customRevisionInstruction : (actionDef ? actionDef.label : action);
          
          if (actionDef?.group === 'Translation & Localization') {
            instruction += `. Target Language: ${revisionSettings.targetLanguage}. Preserve meaning but adapt tone naturally for this language. Avoid literal machine translation. `;
            if (revisionSettings.targetLanguage.includes('Persian')) {
              instruction += `CRITICAL: Output must be natural, readable, and spoken-friendly. Avoid formal mechanical Persian. Avoid stiff translation patterns. Keep the COH voice.`;
            } else if (revisionSettings.targetLanguage === 'English') {
              instruction += `CRITICAL: Output should be polished, professional, and clear. Keep the COH voice.`;
            } else {
              instruction += `CRITICAL: Adapt to natural usage in ${revisionSettings.targetLanguage}. Keep the COH voice.`;
            }
          }
          
          const result = await aiService.revise({
            previousDraft: activeDraftText,
            rawInput: revisionSettings.optionalContext,
            channel: revisionSettings.channel,
            outputFormat: revisionSettings.format,
            audience: 'General Public',
            purpose: revisionSettings.optionalContext || 'General Revision',
            language: revisionSettings.targetLanguage,
            tone: revisionSettings.tone,
            selectedRevisionAction: action,
            revisionInstruction: instruction,
            operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Revision Studio', action })
          });

          revised = result.revisedCopy || revised;
          actionLabel = action === 'custom-instruction' ? `Custom: ${customRevisionInstruction || 'Rewrite'}` : actionLabel;
          
          if (actionDef?.group === 'Translation & Localization') {
            actionLabel = `${actionLabel} | Language: ${revisionSettings.targetLanguage}`;
          }
          
          if (action === 'custom-instruction') {
            setCustomRevisionInstruction('');
          }
        } else {
          // Prototype Fallback Actions
          await new Promise(resolve => setTimeout(resolve, 800));
          if (action === 'custom-instruction') {
            actionLabel = `Custom: ${customRevisionInstruction || 'Rewrite'}`;
            revised = `[Revised based on: "${customRevisionInstruction}"]\\n\\n${revised}\\n\\n(Adjusted alignment and framing to adhere to your instruction.)`;
            setCustomRevisionInstruction('');
          } else {
            const actionDef = REVISION_ACTIONS.find(a => a.id === action);
            if (actionDef?.group === 'Translation & Localization') {
              throw new Error('Translation requires AI generation. Please configure AI Connection in Settings.');
            }
            revised = `[${actionLabel} applied via fallback]\\n\\n${revised}`;
          }
        }
      }
      setSettingsChangedSinceRevision(false);
      setRevisionSuccessAction(action);
      setTimeout(() => setRevisionSuccessAction(null), 3000);
"""
        content = content[:start_idx] + new_block + content[end_idx:]
        print("Replaced applyRevision logic successfully!")
        
        # Now replace all onClick calls
        content = content.replace("applyRevision(", "runRevision(")
    else:
        print("Could not find end marker")
else:
    print("Could not find start marker")

with open(app_file, "w") as f:
    f.write(content)
