with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

import re

# Find the evidence tab rendering
# Looking for {activeTab === 'evidence' && ( ... )}

# We will replace the entire evidence tab content
evidence_replacement = """{activeTab === 'evidence' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-coh-gold/20 pb-2 mb-4">
                <h3 className="font-serif text-xl font-bold text-coh-navy">Core Documents</h3>
                <button onClick={() => {
                  setOperatingCoreDocuments([{
                    id: generateId(),
                    title: 'New Core Document',
                    type: 'Strategic Plan',
                    status: 'Draft',
                    brainArea: 'Passport',
                    brainRole: 'Rule',
                    notes: '',
                    content: '',
                    extractedInsights: ''
                  }, ...operatingCoreDocuments]);
                }} className="text-xs bg-coh-navy text-coh-cream px-3 py-1.5 rounded hover:bg-coh-navy-light transition font-semibold flex items-center gap-1 action-button interactive-button">
                  <Plus size={12}/> Add Core Document
                </button>
              </div>
              <p className="text-xs text-coh-navy/60 mb-4">These are foundational brain documents. They are not normal user sources. They dictate the internal logic of the system.</p>

              {operatingCoreDocuments.length === 0 ? (
                <div className="text-center p-8 bg-coh-cream/10 border border-dashed border-coh-gold/30 rounded">
                  <p className="text-xs text-coh-navy/50 italic mb-2">No Core Documents linked yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {operatingCoreDocuments.map((doc, idx) => (
                    <div key={doc.id} className="border border-coh-gold/30 rounded bg-white overflow-hidden shadow-sm">
                      <div className="bg-coh-cream/30 border-b border-coh-gold/20 p-3 flex justify-between items-center">
                        <input value={doc.title} onChange={e => {
                          const docs = [...operatingCoreDocuments];
                          docs[idx].title = e.target.value;
                          setOperatingCoreDocuments(docs);
                        }} className="font-serif text-lg font-bold bg-transparent focus:outline-none w-1/2 border-b border-coh-gold/40" placeholder="Document Title"/>
                        <button onClick={() => {
                          setOperatingCoreDocuments(operatingCoreDocuments.filter(d => d.id !== doc.id));
                        }} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                      </div>
                      
                      <div className="p-4 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Document Type</label>
                          <select value={doc.type || 'Strategic Plan'} onChange={e => {
                            const docs = [...operatingCoreDocuments];
                            docs[idx].type = e.target.value;
                            setOperatingCoreDocuments(docs);
                          }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white">
                            <option>Strategic Plan</option>
                            <option>Operating Memo</option>
                            <option>Canon Script</option>
                            <option>Treatment</option>
                            <option>Brand Guide</option>
                            <option>Visual DNA Guide</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Status</label>
                          <select value={doc.status || 'Draft'} onChange={e => {
                            const docs = [...operatingCoreDocuments];
                            docs[idx].status = e.target.value;
                            setOperatingCoreDocuments(docs);
                          }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white">
                            <option>Draft</option>
                            <option>Approved</option>
                            <option>Deprecated</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Brain Area</label>
                          <select value={doc.brainArea || 'Passport'} onChange={e => {
                            const docs = [...operatingCoreDocuments];
                            docs[idx].brainArea = e.target.value;
                            setOperatingCoreDocuments(docs);
                          }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white">
                            <option>Passport</option>
                            <option>Strategy</option>
                            <option>Audience</option>
                            <option>Channels</option>
                            <option>Claims</option>
                            <option>Voice</option>
                            <option>Visual</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Brain Role</label>
                          <select value={doc.brainRole || 'Rule'} onChange={e => {
                            const docs = [...operatingCoreDocuments];
                            docs[idx].brainRole = e.target.value;
                            setOperatingCoreDocuments(docs);
                          }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white">
                            <option>Definition</option>
                            <option>Rule</option>
                            <option>Constraint</option>
                            <option>Direction</option>
                            <option>Aspiration</option>
                          </select>
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Notes / Relevance</label>
                          <input value={doc.notes || ''} onChange={e => {
                            const docs = [...operatingCoreDocuments];
                            docs[idx].notes = e.target.value;
                            setOperatingCoreDocuments(docs);
                          }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" placeholder="Why is this document in the core?"/>
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Document Content</label>
                          <textarea value={doc.content || ''} onChange={e => {
                            const docs = [...operatingCoreDocuments];
                            docs[idx].content = e.target.value;
                            setOperatingCoreDocuments(docs);
                          }} className="w-full bg-coh-cream/30 border border-coh-gold/20 p-2 rounded text-xs font-mono h-24 whitespace-pre-wrap" placeholder="Paste actual source text here..."/>
                        </div>
                        
                        <div className="col-span-2 bg-coh-navy/5 border border-coh-navy/10 p-3 rounded">
                          <label className="block text-[10px] uppercase font-bold text-coh-navy mb-1 flex items-center justify-between">
                            Extracted Insights 
                            <span className="text-[9px] font-normal text-coh-navy/60 bg-white px-1.5 py-0.5 rounded border border-coh-navy/10">Inferred System Logic</span>
                          </label>
                          <textarea value={doc.extractedInsights || ''} onChange={e => {
                            const docs = [...operatingCoreDocuments];
                            docs[idx].extractedInsights = e.target.value;
                            setOperatingCoreDocuments(docs);
                          }} className="w-full bg-white border border-coh-gold/20 p-2 rounded text-xs text-coh-navy h-16" placeholder="The system distills rules from the content here..."/>
                          
                          <button onClick={() => {
                            alert('Insight extracted and saved. In a full backend environment, this would hit the LLM and automatically populate the Operating Core fields.');
                          }} className="mt-2 w-full text-center bg-white border border-coh-navy/20 text-coh-navy text-xs font-bold uppercase py-2 rounded hover:bg-coh-navy hover:text-white transition-colors">
                            Extract Insights & Save to Operating Core
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}"""

import re
# We need to replace the entire evidence section.
# The evidence section starts with "{activeTab === 'evidence' && (" and ends with a ")}\n" right before the other tabs.
# Looking at the codebase, the exact regex replacement is safest if we isolate it.
match = re.search(r"\{activeTab === 'evidence' && \([\s\S]*?\{/\* COMPILER PREVIEW FEATURE \*/\}", content)

if match:
    # We replace from {activeTab === 'evidence' && ( down to right before {/* COMPILER PREVIEW FEATURE */}
    # Actually wait, there is no other tab after evidence! It is the last one inside "Content Area"!
    # Let me make sure about that. 
    # Ah, in my OperatingCoreAdmin the evidence tab was actually inserted... wait, was it there?
    # Let's just use re.sub carefully.
    start_idx = content.find("{activeTab === 'evidence' && (")
    end_idx = content.find("{/* COMPILER PREVIEW FEATURE */}")
    if start_idx != -1 and end_idx != -1:
        # We replace between start_idx and end_idx
        # But we need to keep the closing </div> of Content Area
        # Wait, the closing div of content area is right before compiler preview.
        # Let's extract the exact substring.
        old_evidence = content[start_idx:end_idx]
        # the closing `        </div>` is in old_evidence, so we append it
        
        # Replace
        new_evidence = evidence_replacement + "\n        </div>\n      </div>\n      "
        
        content = content[:start_idx] + new_evidence + content[end_idx:]

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

