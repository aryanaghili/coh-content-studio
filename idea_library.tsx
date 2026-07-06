{activeTab === 'idea-library' && (
          <div className="space-y-8 animate-fadeIn max-w-6xl">
            <div className="border-b border-coh-gold/20 pb-6 flex justify-between items-end">
              <div>
                <h2 className="font-serif text-3xl font-normal text-coh-navy">Idea Library</h2>
                <p className="text-sm text-coh-navy/60 font-sans mt-1">
                  Manage saved content angles, hooks, and campaign outlines. Keep track of what is ready to be written.
                </p>
              </div>
            </div>

            {/* List of saved ideas */}
            {savedIdeas.length > 0 ? (
              <div className="grid grid-cols-2 gap-6">
                {savedIdeas.map(idea => (
                  <div key={idea.id} className="bg-white border border-coh-gold/20 p-6 rounded shadow-sm flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <div>
                          <div className="flex gap-2 items-center flex-wrap mb-1">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-coh-gold bg-coh-navy px-1.5 py-0.5 rounded">
                              {idea.suggestedChannel}
                            </span>
                            <span className="text-[9px] font-mono text-coh-navy/50 uppercase font-semibold">
                              {idea.category}
                            </span>
                          </div>
                          <h4 className="font-serif text-base font-bold text-coh-navy leading-snug">{idea.title}</h4>
                        </div>

                        <select
                          value={idea.status}
                          onChange={(e) => handleUpdateIdeaStatus(idea.id, e.target.value as SavedIdea['status'])}
                          className={`text-[10px] font-bold p-1 rounded font-mono border border-coh-gold/20 ${
                            idea.status === 'Ready for Content' ? 'bg-blue-50 text-blue-800' :
                            idea.status === 'Promising' ? 'bg-coh-gold/15 text-coh-navy' :
                            idea.status === 'Used' ? 'bg-green-50 text-green-800' :
                            'bg-gray-50 text-gray-800'
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="Promising">Promising</option>
                          <option value="Ready for Content">Ready for Content</option>
                          <option value="Used">Used</option>
                          <option value="Archived">Archived</option>
                          <option value="Not Useful">Not Useful</option>
                        </select>
                      </div>

                      <p className="text-xs text-coh-navy/80 whitespace-pre-wrap leading-relaxed bg-coh-cream/45 p-4 border border-coh-gold/10 rounded font-sans">
                        {idea.explanation}
                      </p>

                      <div className="text-[10px] text-coh-navy/55 space-y-1 font-sans">
                        <div><strong>Original Input:</strong> "{idea.originalInput}"</div>
                        <div><strong>Why it works:</strong> {idea.whyItWorks}</div>
                        <div><strong>Hook idea:</strong> "{idea.possibleHook}"</div>
                        {idea.possibleNextStep && <div><strong>Next action:</strong> {idea.possibleNextStep}</div>}
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-coh-gold/15 pt-4 text-[10px] text-coh-navy/40 font-mono">
                      <span>Saved: {idea.dateCreated}</span>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => handleSendToVisualStudio(idea, idea.explanation, 'Idea')}
                          className="bg-coh-cream text-coh-gold hover:text-coh-gold-dark border border-coh-gold/20 px-3 py-1.5 rounded font-serif font-bold text-[10px] flex items-center gap-1"
                        >
                          <Lightbulb size={10} /> Send Visual Direction to Visual Studio
                        </button>
                        <button
                          onClick={() => handleCopyIdeaToWorkspace(idea)}
                          className="bg-coh-navy text-coh-gold hover:bg-coh-navy-light px-3 py-1.5 rounded font-serif font-bold text-[10px]"
                        >
                          Draft Content
                        </button>
                        <button
                          onClick={() => setSavedIdeas(prev => prev.filter(i => i.id !== idea.id))}
                          className="text-[11px] text-red-800/70 hover:text-red-800 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-coh-gold/20 rounded bg-white">
                <p className="text-xs text-coh-navy/55 max-w-sm mx-auto font-sans">No saved ideas in the Idea Library yet.</p>
              </div>
            )}
          </div>
        )}