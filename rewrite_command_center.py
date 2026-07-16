import re

file_path = "src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

# I will use a regex to replace everything between 
# "{activeTab === 'command-center' && (<ErrorBoundary fallbackTitle="Command Center Error">" 
# and the start of Editorial Calendar.

new_command_center = """        {activeTab === 'command-center' && (<ErrorBoundary fallbackTitle="Command Center Error">
          <div className="flex flex-col gap-6 max-w-6xl mx-auto">
            {/* Hero Area / Quick Prompt */}
            <div className="bg-gradient-to-r from-brand-gold/10 to-brand-gold-hover/5 border border-brand-gold/20 p-8 rounded-2xl shadow-level-1 flex flex-col gap-4">
              <h2 className="font-sans text-2xl font-bold text-text-primary">What are you working on today?</h2>
              <div className="flex flex-col md:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="e.g. 'Write a LinkedIn post about our new climate initiative...'"
                  className="flex-1 h-12 px-4 bg-surface-primary border border-border-standard rounded-lg font-sans text-[15px] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:border-transparent transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const id = `work-${Date.now()}`;
                      setActiveWorkItem({
                        id, title: 'New Content Draft', type: 'Content', status: 'Brief', draftVersions: [], imageResults: [], revisionHistory: [], approved: false, saved: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                      });
                      setCreationMode('quick');
                      setQuickBrief({ goal: e.currentTarget.value, channel: 'LinkedIn', notes: '', mustInclude: '', mustAvoid: '', language: 'English', outputFormat: 'Post' });
                      setActiveTab('content-workspace');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const id = `work-${Date.now()}`;
                    setActiveWorkItem({
                      id, title: 'New Content Draft', type: 'Content', status: 'Brief', draftVersions: [], imageResults: [], revisionHistory: [], approved: false, saved: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                    });
                    setCreationMode('quick');
                    setQuickBrief({ goal: 'Draft content from command center', channel: 'LinkedIn', notes: '', mustInclude: '', mustAvoid: '', language: 'English', outputFormat: 'Post' });
                    setActiveTab('content-workspace');
                  }}
                  className="h-12 px-6 bg-brand-gold text-text-inverse font-sans font-semibold rounded-lg shadow-sm hover:bg-brand-gold-hover transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  Start Writing <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); setActiveTab('ideation-workspace'); }}
                  className="h-12 px-6 bg-surface-primary border border-border-strong text-text-primary font-sans font-semibold rounded-lg shadow-sm hover:bg-surface-inset transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  Explore Ideas <Lightbulb size={16} className="text-brand-gold" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (2/3 width) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Active Work / Needs Attention */}
                <div className="flex flex-col gap-4">
                  <h3 className="font-sans text-[17px] font-bold text-text-primary flex items-center gap-2">
                    <Bookmark size={18} className="text-brand-gold" /> Active Workspace
                  </h3>
                  
                  {activeWorkItem ? (
                    <div className="card-level-2 p-5 border border-brand-gold/30 hover:border-brand-gold transition-colors cursor-pointer" onClick={() => setActiveTab('content-workspace')}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-brand-gold/10 text-brand-gold px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                            {activeWorkItem.status}
                          </span>
                          <span className="text-text-secondary font-sans text-sm">{activeWorkItem.channel || activeWorkItem.type || 'Draft'}</span>
                        </div>
                        <span className="text-text-muted text-xs">{(activeWorkItem.updatedAt || activeWorkItem.createdAt || new Date().toISOString()).split('T')[0]}</span>
                      </div>
                      <h4 className="font-sans text-lg font-bold text-text-primary mb-2">{(activeWorkItem?.title || 'Standalone Draft')}</h4>
                      <p className="font-sans text-sm text-text-secondary line-clamp-2 mb-4">
                        {activeWorkItem.draftVersions.length > 0 ? activeWorkItem.draftVersions[0].text.substring(0, 120) + '...' : 'No draft content yet. Jump in to start writing or researching.'}
                      </p>
                      
                      <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        {activeWorkItem.status === 'Draft' && !activeWorkItem.approved && (
                          <button onClick={() => { setActiveTab('revision-studio'); }} className="text-xs bg-surface-secondary text-text-primary border border-border-standard px-3 py-1.5 rounded-md font-semibold hover:bg-border-standard transition-colors">Revise Draft</button>
                        )}
                        {activeWorkItem.visualDirection && activeWorkItem.imageResults.length === 0 && (
                          <button onClick={() => { setIsMobileMenuOpen(false); setActiveTab('visual-studio'); }} className="text-xs bg-brand-gold text-text-inverse px-3 py-1.5 rounded-md font-semibold hover:bg-brand-gold-hover transition-colors flex items-center gap-1"><Camera size={12}/> Create Visual</button>
                        )}
                        {activeWorkItem.status === 'Needs Source Check' && (
                          <button onClick={() => { setIsMobileMenuOpen(false); setActiveTab('content-workspace'); }} className="text-xs bg-status-warning text-text-inverse px-3 py-1.5 rounded-md font-semibold hover:brightness-110 transition-colors flex items-center gap-1"><AlertCircle size={12}/> Review Source Check</button>
                        )}
                        <button onClick={() => { setIsMobileMenuOpen(false); setActiveTab('content-workspace'); }} className="text-xs text-text-primary font-semibold underline ml-auto self-center hover:text-brand-gold transition-colors">Open Workspace →</button>
                      </div>
                    </div>
                  ) : (
                    <div className="card-level-1 p-8 flex flex-col items-center justify-center text-center border-dashed border-2">
                      <div className="w-12 h-12 rounded-full bg-surface-inset flex items-center justify-center mb-3">
                        <FileText size={20} className="text-text-muted" />
                      </div>
                      <h4 className="font-sans text-[15px] font-bold text-text-primary mb-1">No Active Work Item</h4>
                      <p className="font-sans text-sm text-text-secondary mb-4 max-w-sm">You have a clean slate. Start a new draft using the prompt above, or continue from your libraries.</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions Grid */}
                <div className="flex flex-col gap-4">
                  <h3 className="font-sans text-[17px] font-bold text-text-primary">Quick Start</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { icon: <Globe size={16} />, label: "LinkedIn Post", format: "Post", channel: "LinkedIn" },
                      { icon: <Mail size={16} />, label: "Newsletter", format: "Section", channel: "Newsletter" },
                      { icon: <FileText size={16} />, label: "Article", format: "Article", channel: "Website" },
                      { icon: <MessageSquare size={16} />, label: "Message", format: "Message", channel: "WhatsApp" },
                      { icon: <Briefcase size={16} />, label: "Sponsor Pitch", format: "Pitch", channel: "Sponsor email" },
                      { icon: <Layers size={16} />, label: "Multi-Channel", format: "Pack", channel: "All" }
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
                        className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-primary hover:bg-surface-inset border border-border-standard hover:border-brand-gold rounded-xl transition-all shadow-sm active:scale-95 group"
                      >
                        <div className="text-text-muted group-hover:text-brand-gold transition-colors">{qa.icon}</div>
                        <span className="font-sans text-xs font-semibold text-text-primary text-center">{qa.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column (1/3 width) - Studio Status & Needs Attention */}
              <div className="space-y-6">
                
                {/* Needs Attention / Alerts */}
                <div className="card-level-1 border border-border-standard overflow-hidden">
                  <div className="bg-surface-inset px-4 py-3 border-b border-border-standard">
                    <h3 className="font-sans text-[13px] font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                      <Bell size={14} className="text-text-secondary" /> Attention Needed
                    </h3>
                  </div>
                  <div className="p-4 space-y-3 bg-surface-primary">
                    {!aiProvider && (
                      <div className="flex items-start gap-2 p-3 bg-status-warning/10 rounded-lg border border-status-warning/20">
                        <AlertTriangle size={14} className="text-status-warning shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-sans text-[13px] text-text-primary font-medium mb-1.5">AI Setup Required</p>
                          <p className="font-sans text-xs text-text-secondary mb-2">Connect an API key to enable text and image generation.</p>
                          <button onClick={() => { setIsMobileMenuOpen(false); setActiveTab('settings'); }} className="text-xs font-semibold text-brand-gold hover:underline">Go to Settings</button>
                        </div>
                      </div>
                    )}
                    
                    {savedIdeas.some(i => i.status === 'New') && (
                      <div className="flex items-start gap-2 p-3 bg-brand-gold/5 rounded-lg border border-brand-gold/20">
                        <Lightbulb size={14} className="text-brand-gold shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-sans text-[13px] text-text-primary font-medium mb-1.5">New Ideas Available</p>
                          <p className="font-sans text-xs text-text-secondary mb-2">{savedIdeas.filter(i => i.status === 'New').length} unreviewed ideas generated by the Ideation Engine.</p>
                          <button onClick={() => { setIsMobileMenuOpen(false); setActiveTab('idea-library'); }} className="text-xs font-semibold text-brand-gold hover:underline">View Ideas</button>
                        </div>
                      </div>
                    )}

                    {(!activeWorkItem || (!activeWorkItem.visualDirection && activeWorkItem.status !== 'Needs Source Check' && activeWorkItem.status !== 'Approved')) && aiProvider && savedIdeas.filter(i => i.status === 'New').length === 0 && (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <Check size={24} className="text-status-success mb-2 opacity-80" />
                        <p className="font-sans text-[13px] font-medium text-text-primary">All Caught Up!</p>
                        <p className="font-sans text-xs text-text-muted mt-1">Your studio is operating smoothly.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Studio Overview */}
                <div className="card-level-1 border border-border-standard overflow-hidden">
                  <div className="bg-surface-inset px-4 py-3 border-b border-border-standard">
                    <h3 className="font-sans text-[13px] font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                      <LayoutDashboard size={14} className="text-text-secondary" /> Overview
                    </h3>
                  </div>
                  <div className="p-4 bg-surface-primary">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-canvas p-3 rounded-lg border border-border-standard text-center">
                        <div className="font-sans text-2xl font-bold text-text-primary">{[...workspaceLocalSources, ...sources].length}</div>
                        <div className="font-sans text-[11px] font-semibold text-text-secondary uppercase tracking-wider mt-1">Sources</div>
                      </div>
                      <div className="bg-canvas p-3 rounded-lg border border-border-standard text-center">
                        <div className="font-sans text-2xl font-bold text-text-primary">{savedContent.length}</div>
                        <div className="font-sans text-[11px] font-semibold text-text-secondary uppercase tracking-wider mt-1">Saved</div>
                      </div>
                      <div className="bg-canvas p-3 rounded-lg border border-border-standard text-center col-span-2">
                        <div className="font-sans text-2xl font-bold text-brand-gold">{savedIdeas.length}</div>
                        <div className="font-sans text-[11px] font-semibold text-text-secondary uppercase tracking-wider mt-1">Generated Ideas</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border-standard">
                      <div className="flex items-center justify-between font-sans text-[13px] mb-2">
                        <span className="text-text-secondary">Core Rules</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${operatingCore.active ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'}`}>
                          {operatingCore.active ? 'Active' : 'Bypassed'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </ErrorBoundary>)}"""

pattern = r"\{activeTab === 'command-center' && \(\<ErrorBoundary fallbackTitle=\"Command Center Error\"\>.*?\</ErrorBoundary\>\)\}"

# Because the regex with .*? might fail across multiline without re.DOTALL
new_content = re.sub(pattern, new_command_center, content, flags=re.DOTALL)

with open(file_path, "w") as f:
    f.write(new_content)

print("Command Center rewritten via Python")
