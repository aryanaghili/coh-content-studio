import re
import os

app_file = "src/App.tsx"
with open(app_file, "r") as f:
    content = f.read()

apply_rev_old = """    const runRevision = async (action: string) => {
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
            if (generationMode !== 'ai' || aiStatus !== 'connected') {
              throw new Error('Translation requires AI generation. Please configure AI Connection in Settings.');
            }
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
          
          const newVersion = activeDraftVersion + 1;
          setActiveDraftVersion(newVersion);
          setActiveDraftHistory(prev => [
            ...prev,
            {
              version: newVersion,
              text: revised,
              timestamp: new Date().toLocaleTimeString(),
              actionUsed: `${actionLabel} | ${revisionSettings.channel} | ${revisionSettings.format} | ${revisionSettings.tone}`
            }
          ]);
          
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
            } else {
              revised = `[${actionDef?.label || action} applied]\\n\\n${revised}`;
            }
          }
          const newVersion = activeDraftVersion + 1;
          setActiveDraftVersion(newVersion);
          setActiveDraftHistory(prev => [
            ...prev,
            {
              version: newVersion,
              text: revised,
              timestamp: new Date().toLocaleTimeString(),
              actionUsed: `${actionLabel} | ${revisionSettings.channel} | ${revisionSettings.format} | ${revisionSettings.tone} (Fallback)`
            }
          ]);
        }
      }
      setSettingsChangedSinceRevision(false);
      setRevisionSuccessAction(action);
      setTimeout(() => setRevisionSuccessAction(null), 3000);
    } catch (err: any) {
      setActiveRevisionError(err.message || 'Error applying revision.');
    } finally {
      setActiveRevisionAction(null);
    }
  };"""

apply_rev_regex = re.compile(r"    const applyRevision = async \(action: string\) => \{.*?(?=  // --- Handlers ---)", re.DOTALL)
match = apply_rev_regex.search(content)

if match:
    content = content[:match.start()] + apply_rev_old + "\n" + content[match.end():]
    
    # We must also rename all onClick calls for applyRevision to runRevision
    content = content.replace("applyRevision(", "runRevision(")
    print("Replaced applyRevision")
else:
    print("STILL could not find applyRevision")

with open(app_file, "w") as f:
    f.write(content)
