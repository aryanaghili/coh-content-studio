with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

import re

# Find the start and end of TAB 5
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "{/* --- TAB 5: SOURCE LIBRARY --- */}" in line:
        start_idx = i
        break

if start_idx != -1:
    for i in range(start_idx, len(lines)):
        if "{/* --- TAB 6: SETTINGS / COH BRAIN --- */}" in lines[i]:
            end_idx = i
            break

new_content = """        {/* --- TAB 5: SOURCE LIBRARY --- */}
        {activeTab === 'knowledge-library' && (
          <div className="space-y-8 animate-fadeIn max-w-6xl">
            <div className="border-b border-coh-gold/20 pb-6 flex justify-between items-end">
              <div>
                <h2 className="font-serif text-3xl font-normal text-coh-navy">Knowledge Library</h2>
                <p className="text-sm text-coh-navy/60 font-sans mt-1 max-w-3xl">
                  Store and manage all documents, links, notes, examples, partner context, visual references, and source materials. Some sources can be linked to Operating Core as Core Sources. Others can be selected only for specific generation tasks.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 bg-coh-cream/50 px-3 py-1.5 rounded border border-coh-gold/10">
                  <span className="text-[10px] text-coh-navy/60 font-semibold uppercase">Helper:</span>
                  <span className="text-xs text-coh-navy/70">Always-on strategy and rules are managed in Operating Core. Foundational materials can be linked as Core Sources.</span>
                  <button onClick={() => setActiveTab('operating-core')} className="text-xs font-bold text-coh-navy hover:text-coh-gold transition ml-2">Open Operating Core →</button>
                </div>
              </div>

              <div className="flex gap-2 text-xs">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                />
                <input
                  type="file"
                  ref={folderInputRef}
                  onChange={handleFolderUpload}
                  multiple
                  className="hidden"
                  {...{ webkitdirectory: "", directory: "" } as any}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-2 px-4 rounded transition border border-coh-gold/20 flex items-center gap-1.5"
                >
                  <Upload size={14} /> Upload File
                </button>
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-2 px-4 rounded transition border border-coh-gold/20 flex items-center gap-1.5"
                >
                  <FolderOpen size={14} /> Upload Folder
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {/* Form panel */}
              <div className="bg-white border border-coh-gold/20 p-6 rounded shadow-sm h-fit space-y-6">
                <div>
                  <h3 className="font-serif text-lg text-coh-navy-light pb-2 border-b border-coh-gold/10">
                    {editingSourceId ? 'Edit Source Record' : 'Add Source'}
                  </h3>
                  <p className="text-[10px] text-coh-navy/55 leading-relaxed mt-1">
                    Provide verifiable facts, texts, or links to instruct the studio. Some file types may require pasted text or summary until full parsing is added.
                  </p>
                </div>

                <form onSubmit={handleSaveSource} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-coh-navy/70 mb-1 font-medium">Source Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Soria Moria Funding Memo"
                      value={newSource.title}
                      onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-coh-navy/70 mb-1 font-medium">Source Type</label>
                      <select
                        value={newSource.type}
                        onChange={(e) => setNewSource({ ...newSource, type: e.target.value as SourceFile['type'] })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                      >
                        <option value="Tone of Voice">Tone of Voice</option>
                        <option value="Business Model">Business Model</option>
                        <option value="Business Memo">Business Memo</option>
                        <option value="Website Copy">Website Copy</option>
                        <option value="Deck">Deck</option>
                        <option value="Event Notes">Event Notes</option>
                        <option value="Partnership Notes">Partnership Notes</option>
                        <option value="Sponsorship Notes">Sponsorship Notes</option>
                        <option value="Approved Example">Approved Example</option>
                        <option value="Image / Visual Asset">Image / Visual Asset</option>
                        <option value="Article / Media Coverage">Article / Media Coverage</option>
                        <option value="Team Notes">Team Notes</option>
                        <option value="Link">Link</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-coh-navy/70 mb-1 font-medium">Status</label>
                      <select
                        value={newSource.status}
                        onChange={(e) => setNewSource({ ...newSource, status: e.target.value as SourceFile['status'] })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                      >
                        <option value="Active">Active</option>
                        <option value="Archived">Archived</option>
                        <option value="Needs Review">Needs Review</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-coh-navy/70 mb-1 font-medium">Role</label>
                      <select
                        value={newSource.role}
                        onChange={(e) => setNewSource({ ...newSource, role: e.target.value as SourceFile['role'] })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                      >
                        <option value="Foundational Source">Foundational Source</option>
                        <option value="Task Source">Task Source</option>
                        <option value="Approved Example">Approved Example</option>
                        <option value="Partner Context">Partner Context</option>
                        <option value="Visual Reference">Visual Reference</option>
                        <option value="Archive">Archive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-coh-navy/70 mb-1 font-medium">Supports Section</label>
                      <select
                        value={newSource.supportsOperatingCoreSection}
                        onChange={(e) => setNewSource({ ...newSource, supportsOperatingCoreSection: e.target.value as SourceFile['supportsOperatingCoreSection'] })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                      >
                        <option value="None">None</option>
                        <option value="Core Passport">Core Passport</option>
                        <option value="Strategy Kernel">Strategy Kernel</option>
                        <option value="Audiences">Audiences</option>
                        <option value="Channels">Channels</option>
                        <option value="Claims">Claims</option>
                        <option value="Voice">Voice</option>
                        <option value="Visual">Visual</option>
                        <option value="Revision">Revision</option>
                      </select>
                    </div>
                  </div>

                  {newSource.type === 'Link' && (
                    <div>
                      <label className="block text-coh-navy/70 mb-1 font-medium">Source URL</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newSource.url || ''}
                        onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy font-mono text-[11px]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-coh-navy/70 mb-1 font-medium">Use Case / Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Strategic Partner Pitch Context"
                      value={newSource.useFor}
                      onChange={(e) => setNewSource({ ...newSource, useFor: e.target.value })}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-coh-navy/70 mb-1 font-medium">Short Context / Notes</label>
                    <textarea
                      placeholder="Reference details, key quotes, or summaries..."
                      rows={3}
                      value={newSource.notes}
                      onChange={(e) => setNewSource({ ...newSource, notes: e.target.value })}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-coh-navy/70 mb-1 font-medium">Content / Extracted Text or Summary</label>
                    <textarea
                      placeholder="Paste text summary or markdown file copy..."
                      rows={5}
                      required
                      value={newSource.content}
                      onChange={(e) => setNewSource({ ...newSource, content: e.target.value })}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2 pb-2">
                    <input
                      type="checkbox"
                      id="sourceSelectable"
                      checked={newSource.selectable !== false}
                      onChange={(e) => setNewSource({ ...newSource, selectable: e.target.checked })}
                      className="rounded border-coh-gold/50 text-coh-gold focus:ring-coh-gold w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="sourceSelectable" className="text-coh-navy font-semibold cursor-pointer select-none">
                      Selectable for generation context
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-2 px-4 rounded font-serif transition border border-coh-gold/20 text-xs font-semibold"
                    >
                      {editingSourceId ? 'Save Edits' : 'Add Source'}
                    </button>
                    {editingSourceId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSourceId(null);
                          setNewSource({ title: '', type: 'Tone of Voice', status: 'Active', role: 'Task Source', supportsOperatingCoreSection: 'None', useFor: '', notes: '', content: '', url: '', selectable: true });
                        }}
                        className="bg-coh-cream text-coh-navy border border-coh-gold/20 py-2 px-3 rounded hover:bg-coh-cream-dark transition text-xs"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Records List Panel */}
              <div className="col-span-2 space-y-6">
                
                {/* Filters */}
                <div className="flex flex-wrap gap-2 pb-2 border-b border-coh-gold/15">
                  {['All', 'Core Sources', 'Task Sources', 'Approved Examples', 'Partner Context', 'Visual References', 'Archive'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setKnowledgeLibraryFilter(filter)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition ${
                        knowledgeLibraryFilter === filter 
                          ? 'bg-coh-navy text-coh-gold' 
                          : 'bg-coh-cream border border-coh-gold/20 text-coh-navy/60 hover:bg-coh-gold/10 hover:text-coh-navy'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Suggested Core Sources (Only visible if All or Core Sources, and items aren't uploaded yet) */}
                {(knowledgeLibraryFilter === 'All' || knowledgeLibraryFilter === 'Core Sources') && (
                  <div className="space-y-3 bg-coh-cream/30 p-4 border border-dashed border-coh-gold/30 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-serif text-sm font-bold text-coh-navy">Suggested Core Sources</h3>
                      <span className="text-[9px] uppercase font-bold text-coh-gold bg-white px-1.5 py-0.5 rounded border border-coh-gold/20">Not uploaded yet</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'COH Business Model', 'COH Phase 1 Strategic Plan', 'COH Master Deck',
                        'COH Website Copy', 'COH One-Pager and Narrative', 'COH Sponsorship or Partner Deck'
                      ].filter(title => !selectableSources.find(s => s.title === title)).map(title => (
                        <div key={title} className="bg-white p-3 border border-coh-gold/10 rounded flex justify-between items-center shadow-sm">
                          <span className="text-[11px] font-semibold text-coh-navy">{title}</span>
                          <button 
                            onClick={() => {
                              setEditingSourceId(null);
                              setNewSource({
                                title: title,
                                type: title.includes('Deck') ? 'Deck' : 'Business Memo',
                                status: 'Active',
                                role: 'Foundational Source',
                                supportsOperatingCoreSection: 'None',
                                useFor: 'Core reference material',
                                notes: 'Suggested document',
                                content: '',
                                url: '',
                                selectable: true
                              });
                            }}
                            className="text-[9px] uppercase font-bold text-coh-navy hover:text-coh-gold transition whitespace-nowrap ml-2"
                          >
                            Upload / Link →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User-Added Sources list */}
                <div className="space-y-3">
                  {(() => {
                    let filtered = selectableSources;
                    if (knowledgeLibraryFilter === 'Core Sources') {
                      filtered = selectableSources.filter(s => s.role === 'Foundational Source' || (s.supportsOperatingCoreSection && s.supportsOperatingCoreSection !== 'None'));
                    } else if (knowledgeLibraryFilter === 'Task Sources') {
                      filtered = selectableSources.filter(s => s.role === 'Task Source');
                    } else if (knowledgeLibraryFilter === 'Approved Examples') {
                      filtered = selectableSources.filter(s => s.role === 'Approved Example');
                    } else if (knowledgeLibraryFilter === 'Partner Context') {
                      filtered = selectableSources.filter(s => s.role === 'Partner Context');
                    } else if (knowledgeLibraryFilter === 'Visual References') {
                      filtered = selectableSources.filter(s => s.role === 'Visual Reference');
                    } else if (knowledgeLibraryFilter === 'Archive') {
                      filtered = selectableSources.filter(s => s.role === 'Archive' || s.status === 'Archived');
                    }

                    if (filtered.length === 0) {
                      return <p className="text-xs text-coh-navy/50 italic py-4">No sources found for this filter.</p>;
                    }

                    return filtered.map(src => {
                      const isSelected = advancedBrief.selectedSourceIds.includes(src.id);
                      return (
                        <div key={src.id} className={`bg-white border p-5 rounded shadow-sm flex gap-4 transition ${
                          isSelected ? 'border-coh-gold bg-coh-cream/10' : 'border-coh-gold/20'
                        }`}>
                          <div className="pt-1 select-none">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSourceSelection(src.id)}
                              className="rounded border-coh-gold/50 text-coh-gold focus:ring-coh-gold w-4 h-4 cursor-pointer"
                              title="Select for generation"
                            />
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-coh-gold/20 text-coh-navy-light">
                                {src.type}
                              </span>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                                src.status === 'Active' ? 'bg-green-50 text-green-700' :
                                src.status === 'Archived' ? 'bg-gray-100 text-gray-700' :
                                'bg-amber-50 text-amber-700'
                              }`}>
                                {src.status}
                              </span>
                              {src.role && (
                                <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase border border-coh-navy/20 text-coh-navy/70">
                                  {src.role}
                                </span>
                              )}
                              {src.supportsOperatingCoreSection && src.supportsOperatingCoreSection !== 'None' && (
                                <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-coh-gold text-coh-navy">
                                  Supports: {src.supportsOperatingCoreSection}
                                </span>
                              )}
                              {src.selectable === false && (
                                <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase border border-red-200 text-red-700 bg-red-50">
                                  Non-Selectable
                                </span>
                              )}
                            </div>

                            <h4 className="font-serif text-base font-semibold text-coh-navy">{src.title}</h4>
                            <p className="text-xs text-coh-navy/60 leading-relaxed">{src.notes}</p>

                            <details className="text-[10px] text-coh-navy/40 cursor-pointer pt-1">
                              <summary className="hover:text-coh-gold transition">Show Full Text</summary>
                              <pre className="mt-2 p-3 bg-coh-cream/50 rounded border border-coh-gold/10 overflow-x-auto whitespace-pre-wrap font-mono text-[10px] max-h-48">
                                {src.content}
                              </pre>
                              {src.url && (
                                <div className="mt-2 text-coh-gold">
                                  <a href={src.url} target="_blank" rel="noreferrer" className="hover:underline break-all">🔗 {src.url}</a>
                                </div>
                              )}
                            </details>

                            <div className="pt-2">
                              <button
                                onClick={() => setExtractingInsightFor(extractingInsightFor === src.id ? null : src.id)}
                                className="text-[9px] font-semibold text-coh-navy/50 hover:text-coh-gold transition uppercase tracking-wider"
                              >
                                Use to update Operating Core {extractingInsightFor === src.id ? '↓' : '→'}
                              </button>
                              
                              {extractingInsightFor === src.id && (
                                <div className="mt-3 p-4 bg-coh-cream border border-coh-gold/20 rounded animate-fadeIn">
                                  <h5 className="font-serif font-bold text-coh-navy mb-2 text-sm">Extract Insight for Operating Core</h5>
                                  <p className="text-[10px] text-coh-navy/60 mb-3">This source can inform the Operating Core. Review the material, extract the relevant insight, and manually add it to the correct Operating Core section.</p>
                                  
                                  <div className="space-y-3">
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase text-coh-navy/70 mb-1">Suggested Section</label>
                                      <span className="text-xs bg-white border border-coh-gold/20 px-2 py-1 rounded inline-block">
                                        {src.supportsOperatingCoreSection !== 'None' ? src.supportsOperatingCoreSection : 'Unassigned (Determine manually)'}
                                      </span>
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase text-coh-navy/70 mb-1">Extract Note</label>
                                      <textarea 
                                        className="w-full bg-white border border-coh-gold/20 p-2 rounded text-xs text-coh-navy" 
                                        rows={3} 
                                        placeholder="Draft the rule, claim, or insight here..."
                                        id={`extract-${src.id}`}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => {
                                          const el = document.getElementById(`extract-${src.id}`) as HTMLTextAreaElement;
                                          if (el && el.value) {
                                            navigator.clipboard.writeText(el.value);
                                            alert('Copied to clipboard');
                                          }
                                        }}
                                        className="bg-white border border-coh-gold/30 hover:bg-coh-gold/10 text-coh-navy px-3 py-1.5 rounded text-[10px] font-bold uppercase transition"
                                      >
                                        Copy to Clipboard
                                      </button>
                                      <button 
                                        onClick={() => setActiveTab('operating-core')}
                                        className="bg-coh-navy hover:bg-coh-navy-light text-coh-gold px-3 py-1.5 rounded text-[10px] font-bold uppercase transition"
                                      >
                                        Open Operating Core
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 shrink-0">
                            <button
                              onClick={() => handleEditSource(src)}
                              className="text-coh-navy hover:text-coh-gold p-1 hover:bg-coh-cream rounded transition text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSource(src.id)}
                              className="text-red-800/60 hover:text-red-800 p-1 hover:bg-red-50 rounded transition text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

              </div>
            </div>
          </div>
        )}
"""

if start_idx != -1 and end_idx != -1:
    lines = lines[:start_idx] + [new_content + "\n"] + lines[end_idx:]
    with open('src/App.tsx', 'w') as f:
        f.writelines(lines)
    print("Replaced TAB 5 successfully.")
else:
    print("Failed to find boundaries.")
