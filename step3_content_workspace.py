with open('src/App.tsx', 'r') as f:
    content = f.read()

old_cw_header = """            {/* Title and Validation Warning block */}
            <div className="border-b border-coh-gold/20 pb-6 flex justify-between items-end">
              <div>
                <h2 className="font-serif text-3xl font-normal text-coh-navy">Content Workspace</h2>
                <p className="text-sm text-coh-navy/60 font-sans mt-1">
                  Draft, validate, and preview Climate Opera Haus campaigns. Choose a creation mode to begin.
                </p>
                {startedFromNote && (
                  <span className="inline-block mt-2 bg-coh-gold/15 text-coh-navy text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                    {startedFromNote}
                  </span>
                )}
                {importedIdeationContext && (
                  <div className="mt-4 bg-coh-cream border-l-2 border-coh-gold p-3 rounded text-xs flex justify-between items-start font-sans shadow-sm">
                    <div>
                      <strong className="text-coh-navy flex items-center gap-1 mb-1">
                        <Lightbulb size={12} /> Imported from Ideation Workspace
                      </strong>
                      <p className="text-coh-navy/80 mb-1 line-clamp-2">{importedIdeationContext.explanation}</p>
                      <span className="text-[10px] text-coh-navy/50 block">Original Input: "{importedIdeationContext.originalInput}"</span>
                    </div>
                    <button 
                      onClick={() => setImportedIdeationContext(null)}
                      className="text-coh-navy/40 hover:text-coh-navy ml-4 text-lg font-bold"
                      title="Clear imported context"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>"""

new_cw_header = """            {/* Active Work Item Header */}
            <div className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-serif text-2xl font-bold text-coh-navy">
                    {activeWorkItem?.title || "New Work Item"}
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-coh-navy text-coh-cream px-2 py-0.5 rounded status-badge">
                    {activeWorkItem?.status || "Brief"}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-coh-navy/60 font-sans">
                  <span>Channel: <strong className="text-coh-navy">{activeWorkItem?.channel || quickBrief.channel || "Not selected"}</strong></span>
                  <span>Type: <strong className="text-coh-navy">{activeWorkItem?.type || "Content"}</strong></span>
                </div>
              </div>

              {/* Mode Toggle Button Group */}
              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => {
                    const title = prompt("Rename Work Item:", activeWorkItem?.title || "New Work Item");
                    if (title && title.trim()) {
                      setActiveWorkItem(prev => prev ? { ...prev, title: title.trim(), updatedAt: new Date().toISOString() } : null);
                    }
                  }}
                  className="text-[10px] text-coh-navy underline font-bold interactive-button"
                >
                  Rename Work Item
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-end border-b border-coh-gold/20 pb-4">
              <div>
                <h3 className="font-serif text-xl font-normal text-coh-navy">Briefing Workspace</h3>
              </div>"""

content = content.replace(old_cw_header, new_cw_header, 1)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Step 3: Content Workspace Header updated.")
