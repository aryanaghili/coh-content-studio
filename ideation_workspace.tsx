{activeTab === 'ideation-workspace' && (
          <div className="space-y-8 animate-fadeIn max-w-6xl">
            <div className="border-b border-coh-gold/20 pb-6">
              <h2 className="font-serif text-3xl font-normal text-coh-navy mb-2">Ideation Workspace</h2>
              <p className="text-sm text-coh-navy/60 font-sans">
                Explore creative angles, hooks, and campaign trajectories before writing. Turn ideas into actionable content briefs.
              </p>
            </div>

            <div className="grid grid-cols-12 gap-8 items-start">
              {/* Input Form Column */}
              <div className="col-span-4 bg-white border border-coh-gold/20 p-5 rounded shadow-sm space-y-4 text-xs">
                <h3 className="font-serif text-base font-bold text-coh-navy border-b border-coh-gold/15 pb-2">
                  New Exploration
                </h3>

                <div>
                  <label className="block text-coh-navy/70 font-semibold mb-0.5">What do you want to explore?</label>
                  <p className="text-[10px] text-coh-navy/55 mb-1.5">
                    Enter a keyword, phrase, question, paragraph, theme, campaign direction, audience need, or content problem.
                  </p>
                  <textarea
                    rows={4}
                    value={ideationInput}
                    onChange={(e) => setIdeationInput(e.target.value)}
                    className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy font-mono text-[11px]"
                    placeholder="e.g. Why is climate opera superior to other forms of climate art?"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-semibold text-coh-navy/80 border-b border-coh-gold/10 pb-1">Filters (Optional)</h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-coh-navy/60 mb-0.5">Target Channel</label>
                      <select
                        value={ideationFilterChannel}
                        onChange={(e) => setIdeationFilterChannel(e.target.value)}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-1 rounded text-coh-navy text-[11px]"
                      >
                        {CHANNELS.slice(0, 7).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-coh-navy/60 mb-0.5">Language</label>
                      <select
                        value={ideationFilterLanguage}
                        onChange={(e) => setIdeationFilterLanguage(e.target.value)}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-1 rounded text-coh-navy text-[11px]"
                      >
                        {LANGUAGES.map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-coh-navy/60 mb-0.5">Quality Filter</label>
                      <select
                        value={ideationFilterQuality}
                        onChange={(e) => setIdeationFilterQuality(e.target.value)}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-1 rounded text-coh-navy text-[11px]"
                      >
                        <option value="Practical">Practical</option>
                        <option value="Bold">Bold</option>
                        <option value="Educational">Educational</option>
                        <option value="Emotional">Emotional</option>
                        <option value="Sponsor-facing">Sponsor-facing</option>
                        <option value="Public-facing">Public-facing</option>
                        <option value="Artistic">Artistic</option>
                        <option value="Institutional">Institutional</option>
                        <option value="Campaign-ready">Campaign-ready</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-coh-navy/60 mb-0.5">Depth Level</label>
                      <select
                        value={ideationFilterDepth}
                        onChange={(e) => setIdeationFilterDepth(e.target.value)}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-1 rounded text-coh-navy text-[11px]"
                      >
                        <option value="Light">Light</option>
                        <option value="Standard">Standard</option>
                        <option value="Deep">Deep</option>
                        <option value="Experimental">Experimental</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-coh-navy/60 mb-0.5">Target Audience</label>
                    <select
                      value={ideationFilterAudience}
                      onChange={(e) => setIdeationFilterAudience(e.target.value)}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-1 rounded text-coh-navy text-[11px]"
                    >
                      <option value="General Public">General Public</option>
                      <option value="Sponsors & Patrons">Sponsors & Patrons</option>
                      <option value="Strategic Partners">Strategic Partners</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateIdeas}
                  disabled={isIdeating || !aiProvider}
                  className="cursor-not-allowed opacity-50 bg-coh-navy text-coh-gold font-medium px-4 py-3 rounded hover:bg-coh-navy/90 transition w-full disabled:opacity-50 flex items-center justify-center gap-2 mt-4 action-button interactive-button"
                >
                  {isIdeating ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Lightbulb size={16} />}
                  {isIdeating ? 'Generating...' : 'Generate'}
                </button>
              </div>

              <div className="col-span-8 space-y-6">
                {generatedIdeas.length > 0 ? (
                  <div className="space-y-6">
                    {/* Unique Categories derived from the list */}
                    {Array.from(new Set(generatedIdeas.map(i => i.category))).map(cat => (
                      <div key={cat} className="space-y-3">
                        <h3 className="font-serif text-base font-bold text-coh-gold border-b border-coh-gold/15 pb-1 capitalize">
                          {cat}
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          {generatedIdeas.filter(idea => idea.category === cat).map(idea => (
                            <div key={idea.id} className="bg-white border border-coh-gold/20 p-5 rounded shadow-sm flex flex-col justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-serif font-bold text-coh-navy text-sm leading-snug">{idea.title}</h4>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                                    idea.status === 'Promising' ? 'bg-coh-gold/20 text-coh-navy' : 'bg-coh-cream text-coh-navy/60'
                                  }`}>
                                    {idea.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-coh-navy/70 leading-relaxed font-sans">{idea.explanation}</p>
                                <p className="text-[10px] text-coh-gold font-semibold leading-relaxed font-sans">Why it works: {idea.whyItWorks}</p>
                                
                                {idea.possibleHook && (
                                  <div className="bg-coh-cream/40 p-2 border border-coh-gold/10 rounded font-sans text-[10px] italic text-coh-navy/80">
                                    Hook idea: "{idea.possibleHook}"
                                  </div>
                                )}

                                {idea.possibleFirstPost && (
                                  <div className="bg-coh-cream/30 p-2 border border-coh-gold/10 rounded font-sans text-[10px] text-coh-navy/80">
                                    <span className="font-semibold block text-[9px] uppercase text-coh-navy/60 mb-0.5">First Post Idea:</span>
                                    "{idea.possibleFirstPost}"
                                  </div>
                                )}

                                {idea.riskToAvoid && (
                                  <p className="text-[10px] text-red-800/80 leading-relaxed font-sans">
                                    <span className="font-semibold">Risk to Avoid:</span> {idea.riskToAvoid}
                                  </p>
                                )}

                                <p className="text-[10px] text-coh-navy/60 leading-relaxed font-sans">
                                  <span className="font-semibold">Next Step:</span> {idea.possibleNextStep}
                                </p>

                                <div className="flex gap-1.5 flex-wrap items-center pt-1 text-[9px] font-mono text-coh-navy/50">
                                  <span className="bg-coh-cream px-1.5 rounded">{idea.suggestedChannel}</span>
                                  <span className="bg-coh-cream px-1.5 rounded">{idea.suggestedFormat}</span>
                                  {idea.suggestedAudience && <span className="bg-coh-cream px-1.5 rounded">Audience: {idea.suggestedAudience}</span>}
                                  {idea.suggestedTone && <span className="bg-coh-cream px-1.5 rounded">Tone: {idea.suggestedTone}</span>}
                                </div>
                              </div>

                              <div className="border-t border-coh-gold/10 pt-3 flex items-center justify-between gap-2 text-[10px] font-semibold">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateIdeaStatus(idea.id, 'Promising')}
                                    className="text-coh-gold interactive-link"
                                  >
                                    Promising
                                  </button>
                                  <button
                                    onClick={() => handleUpdateIdeaStatus(idea.id, 'Not Useful')}
                                    className="text-red-800/70 interactive-link"
                                  >
                                    Not Useful
                                  </button>
                                </div>

                                <div className="flex gap-2 items-center">
                                  <button
                                    onClick={() => {
                                      setIsIdeating(true);
                                      setTimeout(() => {
                                        setIsIdeating(false);
                                        setGeneratedIdeas(prev => prev.map(p => p.id === idea.id ? { ...p, title: `Alternative: ${p.title}`, status: 'New' } : p));
                                      }, 500);
                                    }}
                                    className="text-coh-navy/70 hover:text-coh-gold interactive-link"
                                  >
                                    Variations
                                  </button>
                                  <button
                                    disabled={savingIdeaId === idea.id}
                                    onClick={() => handleSaveIdeaToLibrary(idea)}
                                    className="text-coh-navy hover:text-coh-gold interactive-link disabled:opacity-50"
                                  >
                                    {savingIdeaId === idea.id ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    onClick={() => handleCopyIdeaToWorkspace(idea)}
                                    className="bg-coh-navy text-coh-gold px-2 py-1 rounded"
                                  >
                                    Draft
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 border border-dashed border-coh-gold/20 rounded bg-white">
                    <p className="text-xs text-coh-navy/45 max-w-sm mx-auto font-sans">
                      No ideas generated yet. Enter a query in the panel on the left to explore creative angles.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}