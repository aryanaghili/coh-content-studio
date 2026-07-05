import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

# Add useState if not present
if 'extractingInsightFor' not in content:
    content = content.replace('export function OperatingCoreAdmin({ core, onUpdate, onReset, onAddNewCoreSource, onLinkExistingSource, sourceLibrary }: OperatingCoreAdminProps) {',
                              "export function OperatingCoreAdmin({ core, onUpdate, onReset, onAddNewCoreSource, onLinkExistingSource, sourceLibrary }: OperatingCoreAdminProps) {\n  const [extractingInsightFor, setExtractingInsightFor] = useState<string | null>(null);")
    
    # Import useState if not there
    if 'useState' not in content:
        content = content.replace('import React', 'import React, { useState }')

panel_code = """
                                <button 
                                  className="text-[10px] uppercase font-bold text-coh-navy hover:text-coh-gold transition action-button" 
                                  onClick={() => setExtractingInsightFor(extractingInsightFor === src.id ? null : src.id)}
                                >
                                  Use to update Operating Core {extractingInsightFor === src.id ? '↓' : '→'}
                                </button>
                                
                                {extractingInsightFor === src.id && (
                                  <div className="mt-3 p-4 bg-white border border-coh-gold/20 rounded animate-fadeIn w-full">
                                    <h5 className="font-serif font-bold text-coh-navy mb-2 text-sm">Extract Insight for Operating Core</h5>
                                    <p className="text-[10px] text-coh-navy/60 mb-3">This source can inform the Operating Core. Review the material, extract the relevant insight, and manually add it to the correct Operating Core section above.</p>
                                    
                                    <div className="space-y-3">
                                      <div>
                                        <label className="block text-[10px] font-bold uppercase text-coh-navy/70 mb-1">Suggested Section</label>
                                        <span className="text-xs bg-coh-cream border border-coh-gold/20 px-2 py-1 rounded inline-block">
                                          {src.supportsOperatingCoreSection !== 'None' ? src.supportsOperatingCoreSection : 'Unassigned'}
                                        </span>
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold uppercase text-coh-navy/70 mb-1">Extract Note</label>
                                        <textarea 
                                          className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-xs text-coh-navy" 
                                          rows={3} 
                                          placeholder="Draft the rule, claim, or insight here..."
                                          id={`extract-core-${src.id}`}
                                        />
                                      </div>
                                      <div className="flex gap-2">
                                        <button 
                                          onClick={() => {
                                            const el = document.getElementById(`extract-core-${src.id}`) as HTMLTextAreaElement;
                                            if (el && el.value) {
                                              navigator.clipboard.writeText(el.value);
                                              alert('Copied to clipboard. You can now paste this into the Operating Core fields above.');
                                            }
                                          }}
                                          className="bg-white border border-coh-gold/30 hover:bg-coh-gold/10 text-coh-navy px-3 py-1.5 rounded text-[10px] font-bold uppercase transition action-button"
                                        >
                                          Copy to Clipboard
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
"""

# Replace the specific button
# Find `<button className="text-[10px] uppercase font-bold text-coh-navy hover:text-coh-gold transition action-button" onClick={() => alert('Use to update Operating Core')}>Use to update Operating Core</button>`
# Because the exact class might differ slightly, we'll use regex.
content = re.sub(r'<button[^>]*onClick={\(\) => alert\(\'Use to update Operating Core\'\)}[^>]*>Use to update Operating Core</button>', panel_code, content)

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

print("Added inline panel to OperatingCoreAdmin.")
