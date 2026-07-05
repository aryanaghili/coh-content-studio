with open('command_center_original.txt', 'r') as f:
    old_cc = f.read()

new_cc = """        {activeTab === 'command-center' && (
          <div className="space-y-8 animate-fadeIn max-w-6xl">
            <div className="pb-6">
              <h2 className="font-serif text-3xl font-normal text-coh-navy mb-1">Command Center</h2>
              <p className="text-sm text-coh-navy/60 font-sans">
                Choose what to create, continue your active work item, or check what needs attention.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Left Column: Main Commands & Continue */}
              <div className="flex-1 space-y-8">
                
                {/* Section 1: Start New Work */}
                <div className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm">
                  <h3 className="font-serif text-xl text-coh-navy mb-1">Start New Work</h3>
                  <p className="text-xs text-coh-navy/60 mb-6">Begin a new Work Item from scratch, an idea, or a source.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* A. Write Content */}
                    <div className="p-4 bg-coh-navy text-coh-cream rounded border border-coh-gold/20 flex flex-col justify-between shadow-sm">
                      <div>
                        <h4 className="font-serif text-sm uppercase text-coh-gold tracking-wider font-bold mb-1">Write Content</h4>
                        <p className="text-xs text-coh-cream/70 leading-relaxed font-sans mb-4">Draft a post, article, update, email, or campaign message.</p>
                      </div>
                      <button
                        onClick={() => {
                          const id = `work-${Date.now()}`;
                          setActiveWorkItem({
                            id, title: 'New Content Draft', type: 'Content', status: 'Brief', draftVersions: [], imageResults: [], revisionHistory: [], approved: false, saved: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                          });
                          setCreationMode('quick');
                          setQuickBrief({ goal: '', channel: 'LinkedIn', notes: '', mustInclude: '', mustAvoid: '', language: 'English', outputFormat: 'Post' });
                          setActiveTab('content-workspace');
                        }}
                        className="bg-coh-gold hover:bg-coh-gold/90 text-coh-navy text-[10px] font-bold py-1.5 px-3 rounded uppercase self-start flex items-center gap-1 interactive-button"
                      >
                        Start Writing <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* B. Explore Ideas */}
                    <div className="p-4 bg-coh-gold text-coh-navy rounded border border-coh-gold/25 flex flex-col justify-between shadow-sm">
                      <div>
                        <h4 className="font-serif text-sm uppercase text-coh-navy tracking-wider font-bold mb-1">Explore Ideas</h4>
                        <p className="text-xs text-coh-navy/80 leading-relaxed font-sans mb-4">Generate angles, hooks, and content directions before drafting.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('ideation-workspace')}
                        className="bg-coh-navy hover:bg-coh-navy-light text-coh-gold text-[10px] font-bold py-1.5 px-3 rounded uppercase self-start flex items-center gap-1 border border-coh-gold/20 interactive-button"
                      >
                        Explore Ideas <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* C. Use a Source */}
                    <div className="p-4 bg-white text-coh-navy rounded border border-coh-gold/25 flex flex-col justify-between shadow-sm">
                      <div>
                        <h4 className="font-serif text-sm uppercase text-coh-gold tracking-wider font-bold mb-1">Use a Source</h4>
                        <p className="text-xs text-coh-navy/60 leading-relaxed font-sans mb-4">Turn a document, pasted text, notes, or URL into content.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('source-library')}
                        className="bg-coh-navy hover:bg-coh-navy-light text-coh-gold text-[10px] font-bold py-1.5 px-3 rounded uppercase self-start flex items-center gap-1 interactive-button"
                      >
                        Add Source <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* D. Create Visuals */}
                    <div className="p-4 bg-white text-coh-navy rounded border border-coh-gold/25 flex flex-col justify-between shadow-sm">
                      <div>
                        <h4 className="font-serif text-sm uppercase text-coh-gold tracking-wider font-bold mb-1">Create Visuals</h4>
                        <p className="text-xs text-coh-navy/60 leading-relaxed font-sans mb-4">Generate images from visual directions or custom prompts.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('visual-studio')}
                        className="bg-coh-navy hover:bg-coh-navy-light text-coh-gold text-[10px] font-bold py-1.5 px-3 rounded uppercase self-start flex items-center gap-1 interactive-button"
                      >
                        Open Visual Studio <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 2: Continue Active Work */}
                <div className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm">
                  <h3 className="font-serif text-sm font-bold text-coh-navy mb-3">Continue Active Work</h3>
                  
                  {activeWorkItem ? (
                    <div className="bg-coh-cream p-4 rounded border border-coh-gold/30 interactive-card">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-coh-navy text-coh-cream px-2 py-0.5 rounded status-badge">
                              {activeWorkItem.status}
                            </span>
                            <span className="text-xs text-coh-navy/60 font-semibold">{activeWorkItem.channel || activeWorkItem.type || 'Draft'}</span>
                          </div>
                          <h4 className="font-serif text-lg font-bold text-coh-navy">{activeWorkItem.title}</h4>
                        </div>
                        <span className="text-[10px] text-coh-navy/50">{activeWorkItem.updatedAt.split('T')[0]}</span>
                      </div>
                      <p className="text-xs text-coh-navy/70 line-clamp-2 mb-4">
                        {activeWorkItem.draftVersions.length > 0 ? activeWorkItem.draftVersions[0].text.substring(0, 100) + '...' : 'No draft content yet.'}
                      </p>
                      
                      <div className="flex gap-2 flex-wrap">
                        {activeWorkItem.status === 'Draft' && !activeWorkItem.approved && (
                          <button onClick={() => { setActiveTab('revision-studio'); }} className="text-xs bg-coh-navy text-white px-3 py-1.5 rounded hover:bg-coh-navy/90 font-semibold interactive-button">Revise Draft</button>
                        )}
                        {activeWorkItem.visualDirection && activeWorkItem.imageResults.length === 0 && (
                          <button onClick={() => setActiveTab('visual-studio')} className="text-xs bg-coh-navy text-white px-3 py-1.5 rounded hover:bg-coh-navy/90 font-semibold interactive-button">Create Visual</button>
                        )}
                        {activeWorkItem.status === 'Needs Source Check' && (
                          <button onClick={() => setActiveTab('content-workspace')} className="text-xs bg-coh-gold text-coh-navy px-3 py-1.5 rounded hover:bg-coh-gold/90 font-semibold interactive-button">Review Source Check</button>
                        )}
                        {activeWorkItem.status === 'Approved' && !activeWorkItem.saved && (
                          <button onClick={() => {
                            const newSaved = {
                              id: `saved-${Date.now()}`,
                              displayName: activeWorkItem.title,
                              prompt: "Saved from Active Work Item",
                              options: activeWorkItem.type || "",
                              channel: activeWorkItem.channel || "",
                              result: activeWorkItem.draftVersions[0]?.text || "",
                              status: 'Approved',
                              savedAt: new Date().toISOString()
                            };
                            setSavedContent(prev => [newSaved, ...prev]);
                            setActiveWorkItem(prev => prev ? { ...prev, saved: true, status: 'Saved' } : null);
                            alert("Saved to library.");
                          }} className="text-xs bg-coh-navy text-white px-3 py-1.5 rounded hover:bg-coh-navy/90 font-semibold interactive-button">Save to Library</button>
                        )}
                        {activeWorkItem.saved && (
                          <button onClick={() => setActiveTab('content-library')} className="text-xs bg-coh-cream text-coh-navy border border-coh-navy/20 px-3 py-1.5 rounded hover:bg-coh-navy/10 font-semibold interactive-button">Open Library</button>
                        )}
                        <button onClick={() => setActiveTab('content-workspace')} className="text-[10px] text-coh-navy underline ml-auto self-center">Open Workspace</button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-coh-cream/50 p-6 rounded border border-coh-gold/20 flex flex-col items-center justify-center text-center">
                      <p className="text-sm text-coh-navy/60 font-serif italic mb-3">No active work right now.</p>
                      <button onClick={() => {
                        const id = `work-${Date.now()}`;
                        setActiveWorkItem({
                          id, title: 'New Work Item', status: 'Brief', draftVersions: [], imageResults: [], revisionHistory: [], approved: false, saved: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                        });
                        setActiveTab('content-workspace');
                      }} className="text-xs bg-coh-navy text-coh-cream px-4 py-2 rounded font-bold uppercase tracking-wider hover:bg-coh-navy-light transition interactive-button">
                        Start New Work Item
                      </button>
                    </div>
                  )}
                </div>

                {/* Section 3: Work Needing Attention */}
                <div className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm">
                  <h3 className="font-serif text-sm font-bold text-coh-navy mb-3">Work Needing Attention</h3>
                  <div className="space-y-2">
                    {!settings.apiKey && (
                      <div className="flex items-center gap-2 p-2 bg-[#fdfaf5] rounded border-l-2 border-orange-400 text-xs text-coh-navy">
                        <AlertCircle size={14} className="text-orange-400" />
                        <span>AI generation needs setup. Add an API key in Settings.</span>
                        <button onClick={() => setActiveTab('settings')} className="ml-auto underline font-semibold text-orange-600">Fix</button>
                      </div>
                    )}
                    {activeWorkItem?.status === 'Needs Source Check' && (
                      <div className="flex items-center gap-2 p-2 bg-[#fdfaf5] rounded border-l-2 border-orange-400 text-xs text-coh-navy">
                        <AlertCircle size={14} className="text-orange-400" />
                        <span>Active draft needs source check.</span>
                        <button onClick={() => setActiveTab('content-workspace')} className="ml-auto underline font-semibold text-orange-600">Review</button>
                      </div>
                    )}
                    {activeWorkItem?.visualDirection && activeWorkItem.imageResults.length === 0 && (
                      <div className="flex items-center gap-2 p-2 bg-coh-cream rounded border-l-2 border-coh-gold text-xs text-coh-navy">
                        <Camera size={14} className="text-coh-gold" />
                        <span>Visual direction ready for image generation.</span>
                        <button onClick={() => setActiveTab('visual-studio')} className="ml-auto underline font-semibold text-coh-navy">Create</button>
                      </div>
                    )}
                    {activeWorkItem?.status === 'Approved' && !activeWorkItem.saved && (
                      <div className="flex items-center gap-2 p-2 bg-coh-cream rounded border-l-2 border-coh-navy text-xs text-coh-navy">
                        <FileText size={14} className="text-coh-navy" />
                        <span>Approved work item is unsaved.</span>
                        <button onClick={() => setActiveTab('command-center')} className="ml-auto underline font-semibold text-coh-navy">Save</button>
                      </div>
                    )}
                    
                    {savedIdeas.some(i => i.status === 'Idea') && (
                      <div className="flex items-center gap-2 p-2 bg-coh-cream rounded border-l-2 border-coh-gold text-xs text-coh-navy">
                        <Lightbulb size={14} className="text-coh-gold" />
                        <span>{savedIdeas.filter(i => i.status === 'Idea').length} generated ideas ready to draft.</span>
                        <button onClick={() => setActiveTab('idea-library')} className="ml-auto underline font-semibold text-coh-navy">View</button>
                      </div>
                    )}

                    {(!activeWorkItem || (!activeWorkItem.visualDirection && activeWorkItem.status !== 'Needs Source Check' && activeWorkItem.status !== 'Approved')) && settings.apiKey && (
                      <p className="text-xs text-coh-navy/50 italic p-2">Everything is caught up.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Studio Status & Quick Actions */}
              <div className="lg:w-72 space-y-6">
                
                {/* Studio Status / Overview */}
                <div className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm">
                  <h3 className="font-serif text-sm font-bold text-coh-navy mb-4">Studio Status</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-coh-navy/70">Text Generation</span>
                      <span className={`px-2 py-0.5 rounded font-semibold ${settings.apiKey && settings.model ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {settings.apiKey && settings.model ? 'Ready' : 'Needs Setup'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-coh-navy/70">Image Generation</span>
                      <span className={`px-2 py-0.5 rounded font-semibold ${settings.apiKey && settings.imageModel ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {settings.apiKey && settings.imageModel ? 'Ready' : 'Check Settings'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-coh-navy/70">Content Rules</span>
                      <span className={`px-2 py-0.5 rounded font-semibold ${operatingCore.active ? 'bg-coh-navy text-coh-cream' : 'bg-gray-200 text-gray-600'}`}>
                        {operatingCore.active ? 'Active' : 'Bypassed'}
                      </span>
                    </div>
                    
                    <div className="h-px bg-coh-gold/15 my-2"></div>
                    
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-coh-cream p-2 rounded border border-coh-gold/10">
                        <div className="font-bold text-coh-navy text-lg">{[...workspaceLocalSources, ...sources].length}</div>
                        <div className="text-coh-navy/60">Sources</div>
                      </div>
                      <div className="bg-coh-cream p-2 rounded border border-coh-gold/10">
                        <div className="font-bold text-coh-navy text-lg">{savedContent.length}</div>
                        <div className="text-coh-navy/60">Saved</div>
                      </div>
                      <div className="bg-coh-cream p-2 rounded border border-coh-gold/10 col-span-2">
                        <div className="font-bold text-coh-navy text-lg">{savedIdeas.length}</div>
                        <div className="text-coh-navy/60">Ideas</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm">
                  <h3 className="font-serif text-sm font-bold text-coh-navy mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    {[
                      { icon: <Globe size={14} />, label: "LinkedIn Post", format: "Post", channel: "LinkedIn" },
                      { icon: <Mail size={14} />, label: "Newsletter Section", format: "Section", channel: "Newsletter" },
                      { icon: <FileText size={14} />, label: "Website Article", format: "Article", channel: "Website" },
                      { icon: <MessageSquare size={14} />, label: "WhatsApp Message", format: "Message", channel: "WhatsApp" },
                      { icon: <Briefcase size={14} />, label: "Sponsor Pitch", format: "Pitch", channel: "Sponsor email" },
                      { icon: <Layers size={14} />, label: "Multi-Channel Pack", format: "Pack", channel: "All" }
                    ].map((qa, i) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          const id = `work-${Date.now()}`;
                          setActiveWorkItem({
                            id, title: `New ${qa.label}`, type: 'Content', channel: qa.channel, outputFormat: qa.format, status: 'Brief', draftVersions: [], imageResults: [], revisionHistory: [], approved: false, saved: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                          });
                          setCreationMode('quick');
                          setQuickBrief({ goal: '', channel: qa.channel, notes: '', mustInclude: '', mustAvoid: '', language: 'English', outputFormat: qa.format });
                          setActiveTab('content-workspace');
                        }}
                        className="w-full flex items-center gap-3 p-2 text-sm text-left text-coh-navy bg-coh-cream hover:bg-coh-gold/20 rounded border border-coh-gold/20 transition-colors interactive-button"
                      >
                        <span className="text-coh-gold">{qa.icon}</span>
                        {qa.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}\n"""

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(old_cc, new_cc)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Step 2: Command Center Updated.")
