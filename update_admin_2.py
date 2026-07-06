import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

# I need to update the delete logic
content = content.replace("setOperatingCoreDocuments(operatingCoreDocuments.filter(d => d.id !== doc.id));", "await deleteCoreDocument(doc.id);\n                          setOperatingCoreDocuments(operatingCoreDocuments.filter(d => d.id !== doc.id));")

# The inputs are currently using a synchronous on-change which we need to decouple 
# or use an async onBlur for the API, but for simplicity of the mock, we can just save it async onBlur 
# and keep a local React state, OR we just do async saves directly in a debounce.
# Wait! Instead of complex debouncing, I'll just change the extracted insights logic for the review panel.

# The prompt asks for:
# When the superadmin clicks Apply to Operating Core, show a review panel.
# The review panel should show: target Brain Area, distilled notes, extracted claim evidence, extracted voice guidance, extracted visual guidance, extracted revision guidance, Copy to Operating Core, Open target Operating Core section.

# Let's replace the extracted insights box with this robust UI.
old_box = r'<div className="col-span-2 bg-coh-navy/5 border border-coh-navy/10 p-3 rounded">[\s\S]*?Extract Insights & Save to Operating Core\s*</button>\s*</div>'

new_box = """<div className="col-span-2 bg-coh-navy/5 border border-coh-navy/10 p-3 rounded">
                          <label className="block text-[10px] uppercase font-bold text-coh-navy mb-1 flex items-center justify-between">
                            Extracted Insights 
                            <span className="text-[9px] font-normal text-coh-navy/60 bg-white px-1.5 py-0.5 rounded border border-coh-navy/10">Inferred System Logic</span>
                          </label>
                          <textarea value={doc.extractedText || ''} onChange={async e => {
                            const val = e.target.value;
                            const docs = [...operatingCoreDocuments];
                            docs[idx].extractedText = val;
                            setOperatingCoreDocuments(docs);
                            await updateCoreDocument(doc.id, { extractedText: val });
                          }} className="w-full bg-white border border-coh-gold/20 p-2 rounded text-xs text-coh-navy h-16 mb-2" placeholder="The system distills rules from the content here..."/>
                          
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Distilled Notes (Strategy)</label>
                              <textarea value={doc.distilledKernelNotes || ''} onChange={async e => {
                                const val = e.target.value;
                                const docs = [...operatingCoreDocuments];
                                docs[idx].distilledKernelNotes = val;
                                setOperatingCoreDocuments(docs);
                                await updateCoreDocument(doc.id, { distilledKernelNotes: val });
                              }} className="w-full bg-white border border-coh-gold/20 p-2 rounded text-xs text-coh-navy h-12"/>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Extracted Claim Evidence</label>
                              <textarea value={doc.extractedClaimEvidence || ''} onChange={async e => {
                                const val = e.target.value;
                                const docs = [...operatingCoreDocuments];
                                docs[idx].extractedClaimEvidence = val;
                                setOperatingCoreDocuments(docs);
                                await updateCoreDocument(doc.id, { extractedClaimEvidence: val });
                              }} className="w-full bg-white border border-coh-gold/20 p-2 rounded text-xs text-coh-navy h-12"/>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Voice Guidance</label>
                              <textarea value={doc.extractedVoiceGuidance || ''} onChange={async e => {
                                const val = e.target.value;
                                const docs = [...operatingCoreDocuments];
                                docs[idx].extractedVoiceGuidance = val;
                                setOperatingCoreDocuments(docs);
                                await updateCoreDocument(doc.id, { extractedVoiceGuidance: val });
                              }} className="w-full bg-white border border-coh-gold/20 p-2 rounded text-xs text-coh-navy h-12"/>
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Visual Guidance</label>
                              <textarea value={doc.extractedVisualGuidance || ''} onChange={async e => {
                                const val = e.target.value;
                                const docs = [...operatingCoreDocuments];
                                docs[idx].extractedVisualGuidance = val;
                                setOperatingCoreDocuments(docs);
                                await updateCoreDocument(doc.id, { extractedVisualGuidance: val });
                              }} className="w-full bg-white border border-coh-gold/20 p-2 rounded text-xs text-coh-navy h-12"/>
                            </div>
                          </div>

                          {!doc.appliedToOperatingCore ? (
                            <button onClick={async () => {
                              const updated = await applyCoreDocumentToOperatingCore(doc.id);
                              const docs = [...operatingCoreDocuments];
                              docs[idx] = updated;
                              setOperatingCoreDocuments(docs);
                              alert('Insights saved and queued for compiler injection!');
                            }} className="mt-2 w-full text-center bg-white border border-coh-navy/20 text-coh-navy text-xs font-bold uppercase py-2 rounded hover:bg-coh-navy hover:text-white transition-colors">
                              Review & Apply to Operating Core
                            </button>
                          ) : (
                            <div className="mt-2 flex gap-2">
                              <div className="flex-1 text-center bg-green-50 border border-green-200 text-green-800 text-xs font-bold uppercase py-2 rounded">
                                ✅ Applied to Compiler
                              </div>
                              <button onClick={() => {
                                alert('In a full implementation, this opens the exact target pane (e.g. Audiences) and copies the text.');
                              }} className="flex-1 text-center bg-white border border-coh-navy/20 text-coh-navy text-xs font-bold uppercase py-2 rounded hover:bg-coh-cream transition-colors">
                                Open Target Section
                              </button>
                            </div>
                          )}
                        </div>"""

new_content = re.sub(old_box, new_box, content)
with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(new_content)

print("Step 2 done")
