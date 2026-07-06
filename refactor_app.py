import re
import os

app_file = "src/App.tsx"
with open(app_file, "r") as f:
    content = f.read()

# 1. Replace states
states_to_remove = """  const [externalContentText, setExternalContentText] = useState<string>('');
  const [externalContentContext, setExternalContentContext] = useState<string>('');
  const [externalContentChannel, setExternalContentChannel] = useState<string>('General / Custom');
  const [externalContentFormat, setExternalContentFormat] = useState<string>('General / Custom');
  const [externalContentLanguage, setExternalContentLanguage] = useState<string>('English');
  const [externalContentTone, setExternalContentTone] = useState<string>('Balanced / COH Default');"""

new_states = """  const [externalContentText, setExternalContentText] = useState<string>('');
  const [revisionSettings, setRevisionSettings] = useState({
    channel: 'General / Custom',
    format: 'General / Custom',
    targetLanguage: 'English',
    tone: 'Balanced / COH Default',
    optionalContext: '',
    revisionMode: 'Standard'
  });
  const [settingsChangedSinceRevision, setSettingsChangedSinceRevision] = useState<boolean>(false);"""

content = content.replace(states_to_remove, new_states)

# 2. Update usage in handleStartExternalRevision
content = content.replace("externalContentText", "externalContentText") # no-op, just preserved it.

# Update other simple replacements where externalContentContext -> revisionSettings.optionalContext
content = content.replace("externalContentChannel", "revisionSettings.channel")
content = content.replace("externalContentFormat", "revisionSettings.format")
content = content.replace("externalContentLanguage", "revisionSettings.targetLanguage")
content = content.replace("externalContentTone", "revisionSettings.tone")
content = content.replace("externalContentContext", "revisionSettings.optionalContext")

# 3. Replace applyRevision with runRevision and remove fallback translation
apply_rev_old = """  const applyRevision = async (action: string) => {
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

apply_rev_regex = re.compile(r"  const applyRevision = async \(action: string\) => \{.*?(?=  // --- Handlers ---)", re.DOTALL)
match = apply_rev_regex.search(content)

if match:
    # Rename applyRevision to runRevision throughout the file
    content = content.replace("applyRevision(", "runRevision(")
    # Wait, the match contains the definition, let's just replace the definition block
    content = content[:match.start()] + apply_rev_old.replace('applyRevision', 'runRevision') + "\n" + content[match.end():]
else:
    print("Could not find applyRevision")

# 4. Fix dropdowns to use setRevisionSettings
def replace_dropdown(label_match, state_field):
    global content
    pattern = r'(<label className="[^"]*">' + label_match + r'</label>\s*<select className="form-control text-xs"[^>]*value={revisionSettings\.' + state_field + r'}\s*onChange={)\(e\) => set[^}]*}([^>]*>)'
    
    # We replace the onChange handler
    replacement = r'\1(e) => { setRevisionSettings(prev => ({...prev, ' + state_field + r': e.target.value})); setSettingsChangedSinceRevision(true); }\2'
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)

replace_dropdown("Channel", "channel")
replace_dropdown("Format", "format")
replace_dropdown("Target Language", "targetLanguage")
replace_dropdown("Tone", "tone")

# For Optional Context input:
context_pattern = r'(<label className="[^"]*">Optional Context</label>\s*<input type="text"[^>]*value={revisionSettings\.optionalContext}\s*onChange={)\(e\) => set[^}]*}([^>]*>)'
context_replacement = r'\1(e) => { setRevisionSettings(prev => ({...prev, optionalContext: e.target.value})); setSettingsChangedSinceRevision(true); }\2'
content = re.sub(context_pattern, context_replacement, content, flags=re.DOTALL)

# 5. Fix Language list to use LANGUAGES
lang_select_pattern = r'<option value="English">English</option>\s*<option value="Persian">Persian</option>.*?</select>'
# Look for where the targetLanguage select options are:
# We know it was hardcoded.
lang_hardcoded = """                            <option value="English">English</option>
                            <option value="Persian">Persian</option>
                            <option value="Persian, colloquial / narration-ready">Persian (Colloquial / Narration)</option>
                            <option value="German">German</option>
                            <option value="French">French</option>
                            <option value="Italian">Italian</option>
                            <option value="Spanish">Spanish</option>
                            <option value="Russian">Russian</option>"""

lang_replacement = """                            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}"""

content = content.replace(lang_hardcoded, lang_replacement)

# 6. RTL and Notification
# The active draft display is around `<div className="prose prose-sm text-coh-navy max-w-none whitespace-pre-wrap flex-1">`
rtl_pattern = r'<div className="prose prose-sm text-coh-navy max-w-none whitespace-pre-wrap flex-1">'
rtl_replacement = r"""{settingsChangedSinceRevision && (
                        <div className="bg-yellow-50 text-yellow-800 p-2 text-xs rounded border border-yellow-200 mb-4 flex items-center gap-2">
                          <AlertTriangle size={14} />
                          Settings changed. Generate a new revision to apply them.
                        </div>
                      )}
                      <div className="prose prose-sm text-coh-navy max-w-none whitespace-pre-wrap flex-1" dir={getLanguageDirection(revisionSettings.targetLanguage)}>"""
content = content.replace(rtl_pattern, rtl_replacement)

# Ensure 'AlertTriangle' is imported from 'lucide-react' if not already
if "AlertTriangle," not in content and "AlertTriangle " not in content:
    content = content.replace("CheckCircle2,", "CheckCircle2,\n  AlertTriangle,")

with open(app_file, "w") as f:
    f.write(content)

print("Finished updating App.tsx via python script")
