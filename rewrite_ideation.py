import re

file_path = "src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

new_ideation_workspace = """        {activeTab === 'ideation-workspace' && (<ErrorBoundary fallbackTitle="Ideation Workspace Error">
          <div className="flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-surface-primary border border-border-standard p-6 rounded-2xl shadow-sm mb-2">
              <h2 className="font-sans text-2xl font-bold text-text-primary">Ideation Workspace</h2>
              <p className="font-sans text-[15px] text-text-secondary mt-1">
                Explore creative angles, hooks, and campaign trajectories before writing. Turn ideas into actionable content briefs.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Input Form Column (Left) */}
              <div className="col-span-1 lg:col-span-4 flex flex-col gap-5">
                <Card className="shadow-level-1 border-border-standard">
                  <CardHeader className="pb-4 border-b border-border-standard">
                    <CardTitle className="text-lg">New Exploration</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 flex flex-col gap-5">
                    
                    <div className="flex flex-col gap-2">
                      <label className="font-sans text-[13px] font-semibold text-text-primary">What do you want to explore?</label>
                      <p className="font-sans text-[11px] text-text-secondary">
                        Enter a keyword, phrase, question, paragraph, theme, campaign direction, audience need, or content problem.
                      </p>
                      <Textarea
                        rows={4}
                        value={ideationInput}
                        onChange={(e) => setIdeationInput(e.target.value)}
                        placeholder="e.g. Why is climate opera superior to other forms of climate art?"
                      />
                    </div>

                    <div className="flex flex-col gap-4 pt-2">
                      <h4 className="font-sans text-[13px] font-bold text-text-primary border-b border-border-standard pb-1">Filters (Optional)</h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[11px] font-semibold text-text-secondary">Target Channel</label>
                          <Select
                            value={ideationFilterChannel}
                            onChange={(e) => setIdeationFilterChannel(e.target.value)}
                          >
                            {CHANNELS.slice(0, 7).map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[11px] font-semibold text-text-secondary">Language</label>
                          <Select
                            value={ideationFilterLanguage}
                            onChange={(e) => setIdeationFilterLanguage(e.target.value)}
                          >
                            {LANGUAGES.map(l => (
                              <option key={l.id} value={l.label}>{l.label}</option>
                            ))}
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[11px] font-semibold text-text-secondary">Quality Filter</label>
                          <Select
                            value={ideationFilterQuality}
                            onChange={(e) => setIdeationFilterQuality(e.target.value)}
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
                          </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[11px] font-semibold text-text-secondary">Depth Level</label>
                          <Select
                            value={ideationFilterDepth}
                            onChange={(e) => setIdeationFilterDepth(e.target.value)}
                          >
                            <option value="Light">Light</option>
                            <option value="Standard">Standard</option>
                            <option value="Deep">Deep</option>
                            <option value="Experimental">Experimental</option>
                          </Select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[11px] font-semibold text-text-secondary">Target Audience</label>
                        <Select
                          value={ideationFilterAudience}
                          onChange={(e) => setIdeationFilterAudience(e.target.value)}
                        >
                          <option value="General Public">General Public</option>
                          <option value="Sponsors & Patrons">Sponsors & Patrons</option>
                          <option value="Strategic Partners">Strategic Partners</option>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerateIdeas}
                      disabled={isIdeating || !aiProvider}
                      className="w-full h-11 mt-2 flex items-center justify-center gap-2 font-bold"
                    >
                      {isIdeating ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Lightbulb size={16} />}
                      {isIdeating ? 'Generating...' : 'Generate Ideas'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Ideas Display (Right) */}
              <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
                {generatedIdeas.length > 0 ? (
                  <div className="flex flex-col gap-8">
                    {/* Unique Categories derived from the list */}
                    {Array.from(new Set(generatedIdeas.map(i => i.category))).map(cat => (
                      <div key={cat} className="flex flex-col gap-4">
                        <h3 className="font-sans text-lg font-bold text-brand-gold border-b border-border-standard pb-2 capitalize">
                          {cat}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {generatedIdeas.filter(idea => idea.category === cat).map(idea => (
                            <Card key={idea.id} className="shadow-level-1 border-border-standard hover:border-brand-gold/50 transition-colors flex flex-col h-full">
                              <CardContent className="p-5 flex-1 flex flex-col gap-3">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-sans font-bold text-text-primary text-[15px] leading-snug">{idea.title}</h4>
                                  <Badge variant={idea.status === 'Promising' ? 'default' : 'secondary'} className="text-[9px] uppercase">
                                    {idea.status}
                                  </Badge>
                                </div>
                                <p className="font-sans text-[13px] text-text-secondary leading-relaxed">{idea.explanation}</p>
                                <p className="font-sans text-[12px] text-brand-gold font-semibold leading-relaxed">Why it works: {idea.whyItWorks}</p>
                                
                                {idea.possibleHook && (
                                  <div className="bg-surface-inset p-2.5 border border-border-standard rounded-md font-sans text-[12px] italic text-text-secondary">
                                    <span className="font-bold not-italic block mb-0.5">Hook idea:</span> "{idea.possibleHook}"
                                  </div>
                                )}

                                {idea.possibleFirstPost && (
                                  <div className="bg-brand-gold/5 p-2.5 border border-brand-gold/20 rounded-md font-sans text-[12px] text-text-primary">
                                    <span className="font-bold block text-text-secondary mb-0.5">First Post Idea:</span>
                                    "{idea.possibleFirstPost}"
                                  </div>
                                )}

                                {idea.riskToAvoid && (
                                  <p className="font-sans text-[12px] text-status-warning leading-relaxed mt-1">
                                    <span className="font-bold">Risk to Avoid:</span> {idea.riskToAvoid}
                                  </p>
                                )}

                                <p className="font-sans text-[12px] text-text-muted leading-relaxed mt-auto pt-2">
                                  <span className="font-bold text-text-secondary">Next Step:</span> {idea.possibleNextStep}
                                </p>

                                <div className="flex gap-2 flex-wrap items-center mt-2">
                                  <Badge variant="outline" className="text-[10px] text-text-muted border-border-strong">{idea.suggestedChannel}</Badge>
                                  <Badge variant="outline" className="text-[10px] text-text-muted border-border-strong">{idea.suggestedFormat}</Badge>
                                </div>
                              </CardContent>

                              <CardFooter className="p-4 border-t border-border-standard flex items-center justify-between gap-2 bg-surface-inset rounded-b-xl">
                                <div className="flex gap-1.5">
                                  <Button
                                    variant="ghost" size="sm"
                                    onClick={() => handleUpdateIdeaStatus(idea.id, 'Promising')}
                                    className="h-8 text-xs text-brand-gold hover:bg-brand-gold/10"
                                  >
                                    Promising
                                  </Button>
                                  <Button
                                    variant="ghost" size="sm"
                                    onClick={() => handleUpdateIdeaStatus(idea.id, 'Not Useful')}
                                    className="h-8 text-xs text-status-error hover:bg-status-error/10"
                                  >
                                    Not Useful
                                  </Button>
                                </div>

                                <div className="flex gap-1.5 items-center">
                                  <Button
                                    variant="outline" size="sm"
                                    onClick={() => {
                                      setIsIdeating(true);
                                      setTimeout(() => {
                                        setIsIdeating(false);
                                        setGeneratedIdeas(prev => prev.map(p => p.id === idea.id ? { ...p, title: `Alternative: ${p.title}`, status: 'New' } : p));
                                      }, 500);
                                    }}
                                    className="h-8 text-xs border-border-strong text-text-secondary hover:text-text-primary"
                                  >
                                    Variations
                                  </Button>
                                  <Button
                                    variant="outline" size="sm"
                                    disabled={savingIdeaId === idea.id}
                                    onClick={() => handleSaveIdeaToLibrary(idea)}
                                    className="h-8 text-xs border-border-strong text-text-secondary hover:text-text-primary disabled:opacity-50"
                                  >
                                    {savingIdeaId === idea.id ? 'Saving...' : 'Save'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleCopyIdeaToWorkspace(idea)}
                                    className="h-8 text-xs"
                                  >
                                    Draft
                                  </Button>
                                </div>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-border-standard rounded-2xl bg-surface-inset">
                    <div className="w-16 h-16 bg-surface-primary rounded-full flex items-center justify-center shadow-sm mb-4">
                      <Lightbulb size={28} className="text-brand-gold" />
                    </div>
                    <h3 className="font-sans text-[18px] font-bold text-text-primary mb-2">No Ideas Generated Yet</h3>
                    <p className="font-sans text-[14px] text-text-secondary max-w-md">
                      Use the exploration panel on the left to generate fresh angles, hooks, and content directions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ErrorBoundary>)}"""

pattern = r"\{activeTab === 'ideation-workspace' && \(\<ErrorBoundary fallbackTitle=\"Ideation Workspace Error\"\>.*?\</ErrorBoundary\>\)\}"

new_content = re.sub(pattern, new_ideation_workspace, content, flags=re.DOTALL)

with open(file_path, "w") as f:
    f.write(new_content)

print("Ideation Workspace rewritten via Python")
