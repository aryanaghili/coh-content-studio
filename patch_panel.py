import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

# Replace panel button
content = content.replace("Use to update Operating Core {", "Apply to Operating Core {")

# Replace panel contents
old_panel = """                                  <div className="mt-3 p-4 bg-white border border-coh-gold/20 rounded animate-fadeIn w-full">
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
                                          className="bg-black text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded hover:bg-neutral-800 transition action-button"
                                          onClick={() => {
                                            const el = document.getElementById(`extract-core-${src.id}`) as HTMLTextAreaElement;
                                            if (el) navigator.clipboard.writeText(el.value);
                                            alert("Copied to clipboard. Paste this into the corresponding Operating Core section.");
                                          }}
                                        >
                                          Copy to Clipboard
                                        </button>
                                      </div>
                                    </div>
                                  </div>"""

new_panel = """                                  <div className="mt-3 p-4 bg-white border border-coh-gold/20 rounded animate-fadeIn w-full">
                                    <h5 className="font-serif font-bold text-coh-navy mb-2 text-sm">Apply to Operating Core: {src.title}</h5>
                                    <p className="text-[10px] text-coh-navy/60 mb-3">Review the material, extract the relevant insight, and copy it into the Operating Core.</p>
                                    
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center bg-coh-cream p-2 border border-coh-gold/10 rounded">
                                        <span className="text-[10px] font-bold uppercase text-coh-navy/70">Suggested Section:</span>
                                        <span className="text-xs font-semibold text-coh-navy">{src.supportsOperatingCoreSection !== 'None' ? src.supportsOperatingCoreSection : 'Unassigned'}</span>
                                      </div>
                                      
                                      {['Distilled kernel notes', 'Extracted claim evidence', 'Extracted voice guidance', 'Extracted visual guidance', 'Extracted revision guidance'].map(label => (
                                        <div key={label}>
                                          <label className="block text-[10px] font-bold uppercase text-coh-navy/70 mb-1">{label}</label>
                                          <textarea 
                                            className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-xs text-coh-navy" 
                                            rows={2} 
                                            placeholder={`Draft ${label.toLowerCase()}...`}
                                            id={`extract-${label.replace(/\\s+/g, '-')}-${src.id}`}
                                          />
                                          <button 
                                            className="mt-1 text-[9px] uppercase font-bold text-coh-navy hover:text-coh-gold transition action-button border border-coh-gold/20 px-2 py-1 rounded bg-white"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              const el = document.getElementById(`extract-${label.replace(/\\s+/g, '-')}-${src.id}`) as HTMLTextAreaElement;
                                              if (el && el.value) {
                                                navigator.clipboard.writeText(el.value);
                                                alert(`Copied ${label} to clipboard. You can now paste it into the appropriate section.`);
                                              }
                                            }}
                                          >
                                            Copy to Operating Core
                                          </button>
                                        </div>
                                      ))}
                                      
                                      <div className="pt-3 border-t border-coh-gold/10">
                                        <button 
                                          className="bg-black text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded hover:bg-neutral-800 transition action-button w-full text-center flex justify-center items-center gap-1"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            // Optional: automatically switch active tab if matching
                                            const sectionMap: Record<string, any> = {
                                              'Core Passport': 'passport',
                                              'Strategy Kernel': 'kernel',
                                              'Audiences': 'audiences',
                                              'Channels': 'channels',
                                              'Claims': 'claims',
                                              'Voice': 'voice',
                                              'Visual': 'visual',
                                              'Revision': 'revision'
                                            };
                                            if (sectionMap[src.supportsOperatingCoreSection]) {
                                              setActiveTab(sectionMap[src.supportsOperatingCoreSection]);
                                              window.scrollTo({ top: 0, behavior: 'smooth' });
                                            } else {
                                              alert("Select a section from the top navigation to manually insert your copied insights.");
                                            }
                                          }}
                                        >
                                          Open Target Operating Core Section
                                        </button>
                                      </div>
                                    </div>
                                  </div>"""

if old_panel in content:
    content = content.replace(old_panel, new_panel)

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

print("Panel patched")
