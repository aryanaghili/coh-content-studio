with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    lines = f.readlines()

new_content = """          {/* CORE SOURCES */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <h3 className="font-serif text-xl font-bold text-coh-navy border-b border-coh-gold/20 pb-2">Core Sources</h3>
              <p className="text-xs text-coh-navy/60 mb-4">
                Core Sources are the foundational Knowledge Library items that support the Operating Core. They are stored in Knowledge Library and linked here to show what informs the strategy, claims, voice, visual DNA, and revision standards.
                <br/><br/>
                Add or manage the actual source material in Knowledge Library. Link it here when it supports the Operating Core.
              </p>
              
              <div className="space-y-8">
                {['Core Passport', 'Strategy Kernel', 'Audiences', 'Channels', 'Claims', 'Voice', 'Visual', 'Revision'].map(section => {
                  const sourcesForSection = knowledgeSources.filter(src => src.supportsOperatingCoreSection === section);
                  
                  return (
                    <div key={section} className="border border-coh-gold/20 rounded p-4 bg-white shadow-sm">
                      <h4 className="font-serif text-lg font-bold text-coh-navy mb-3 pb-1 border-b border-coh-gold/10">{section}</h4>
                      
                      {sourcesForSection.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {sourcesForSection.map(src => (
                            <div key={src.id} className="bg-coh-cream/30 p-4 rounded border border-coh-gold/10 flex flex-col gap-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[9px] uppercase font-mono font-bold bg-coh-gold/20 text-coh-navy px-1.5 py-0.5 rounded mr-2">{src.type}</span>
                                  {src.role && <span className="text-[9px] text-coh-navy/60 uppercase font-semibold border border-coh-navy/20 px-1.5 py-0.5 rounded mr-2">{src.role}</span>}
                                  {src.status && <span className={`text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded ${src.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-coh-cream text-coh-navy/60'}`}>{src.status}</span>}
                                  <h5 className="font-bold text-coh-navy text-sm mt-1">{src.title}</h5>
                                  {src.notes && <p className="text-xs text-coh-navy/70 mt-1 italic">{src.notes}</p>}
                                  {src.url && <a href={src.url} target="_blank" rel="noreferrer" className="block text-[10px] text-blue-600 hover:underline mt-1 break-all">{src.url}</a>}
                                </div>
                              </div>
                              <div className="flex gap-3 mt-2 pt-2 border-t border-coh-gold/10">
                                <button className="text-[10px] uppercase font-bold text-coh-navy hover:text-coh-gold transition" onClick={() => alert('Open source clicked')}>Open source</button>
                                <button className="text-[10px] uppercase font-bold text-coh-navy hover:text-coh-gold transition" onClick={() => alert('Use to update Operating Core')}>Use to update Operating Core</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-coh-cream/10 border border-dashed border-coh-gold/30 rounded mb-4">
                          <p className="text-xs text-coh-navy/50 italic">No Core Sources linked yet.</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <button 
                          className="text-xs bg-coh-cream text-coh-navy px-3 py-1.5 rounded border border-coh-gold/30 hover:bg-coh-gold/20 transition font-semibold"
                          onClick={() => onLinkExistingSource && onLinkExistingSource(section)}
                        >
                          Link existing Knowledge Library source
                        </button>
                        <button 
                          className="text-xs bg-coh-navy text-coh-cream px-3 py-1.5 rounded hover:bg-coh-navy-light transition font-semibold flex items-center gap-1"
                          onClick={() => onAddNewCoreSource && onAddNewCoreSource(section)}
                        >
                          <Plus size={12} /> Add new Core Source
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}"""

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.writelines(lines[:535])
    f.write(new_content)
    f.write('\\n')
    f.writelines(lines[577:])
