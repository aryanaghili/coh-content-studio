import fs from 'fs';

const filePath = 'src/App.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const applyRevStartStr = "const applyRevision = async (action: string) => {";
const applyRevEndStr = "  // --- Prompt Builder Compiler ---";

const applyRevStartIdx = content.indexOf(applyRevStartStr);
const applyRevEndIdx = content.indexOf(applyRevEndStr, applyRevStartIdx);

const newApplyRevision = `  const applyRevision = async (action: string) => {
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
          
          const result = await aiService.revise({
            previousDraft: activeDraftText,
            rawInput: externalContentContext,
            channel: externalContentChannel,
            outputFormat: externalContentFormat,
            audience: 'General Public',
            purpose: externalContentContext || 'General Revision',
            language: externalContentLanguage,
            tone: externalContentTone,
            selectedRevisionAction: action,
            revisionInstruction: instruction,
            operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Revision Studio', action })
          });

          revised = result.revisedCopy || revised;
          actionLabel = action === 'custom-instruction' ? \`Custom: \${customRevisionInstruction || 'Rewrite'}\` : actionLabel;
          if (action === 'custom-instruction') {
            setCustomRevisionInstruction('');
          }
        } else {
          // Prototype Fallback Actions
          await new Promise(resolve => setTimeout(resolve, 800));
          if (action === 'custom-instruction') {
            actionLabel = \`Custom: \${customRevisionInstruction || 'Rewrite'}\`;
            revised = \`[Revised based on: "\${customRevisionInstruction}"]\\n\\n\${revised}\\n\\n(Adjusted alignment and framing to adhere to your instruction.)\`;
            setCustomRevisionInstruction('');
          } else {
            revised = \`[\${actionLabel} applied via fallback]\\n\\n\${revised}\`;
          }
        }
      }

      const newVersion = activeDraftVersion + 1;
      setActiveDraftText(revised);
      setActiveDraftVersion(newVersion);
      setActiveDraftHistory(prev => [...prev, {
        version: newVersion,
        text: revised,
        timestamp: new Date().toLocaleTimeString(),
        actionUsed: actionLabel,
        language: externalContentLanguage,
        channel: externalContentChannel,
        format: externalContentFormat
      }]);
      setRevisionSuccessAction(action);
      setTimeout(() => setRevisionSuccessAction(null), 2000);
    } catch (err: any) {
      setActiveRevisionError(err.message || 'Could not apply revision');
      setTimeout(() => setActiveRevisionError(null), 4000);
    } finally {
      setActiveRevisionAction(null);
    }
  };

`;

content = content.substring(0, applyRevStartIdx) + newApplyRevision + content.substring(applyRevEndIdx);
fs.writeFileSync(filePath, content, 'utf8');
console.log('applyRevision replaced');
