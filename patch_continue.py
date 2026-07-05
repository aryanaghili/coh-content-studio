import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace main wrapper padding and title styling
content = content.replace(
    '<div className="bg-white border border-coh-gold/20 p-6 rounded shadow-sm">',
    '<div className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm">'
)
content = content.replace(
    '<h3 className="font-serif text-xl text-coh-navy mb-4">Continue where you left off</h3>',
    '<h3 className="font-serif text-sm font-bold text-coh-navy mb-3">Continue where you left off</h3>'
)

# Replace Draft in Progress block
draft_old = """                        <div className="bg-coh-cream/15 p-5 rounded border border-coh-gold/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-coh-gold">Draft in Progress</span>
                            <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase border border-amber-200">Needs Review</span>
                          </div>
                          <h4 className="font-serif text-base font-bold text-coh-navy mb-1">{unapprovedDraft.title}</h4>
                          <p className="text-xs text-coh-navy/60 line-clamp-2 leading-relaxed mb-4">{unapprovedDraft.text}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setActiveDraftText(unapprovedDraft.text);
                                setActiveDraftTitle(unapprovedDraft.title);
                                setActiveDraftVersion(unapprovedDraft.version);
                                setActiveDraftHistory([{
                                  version: unapprovedDraft.version,
                                  text: unapprovedDraft.text,
                                  timestamp: unapprovedDraft.lastEdited,
                                  actionUsed: 'Resume recent draft'
                                }]);
                                setActiveDraftSource(unapprovedDraft.source === 'Content Workspace' ? 'Content Workspace' : (unapprovedDraft.source === 'External Content' ? 'External Content' : 'Content Library'));
                                setActiveTab('revision-studio');
                              }}
                              className="bg-coh-navy text-coh-cream hover:bg-coh-navy-light text-xs font-bold py-2 px-4 rounded transition flex items-center gap-1"
                            >
                              Continue <ArrowRight size={12} />
                            </button>
                            <button onClick={() => setActiveTab('content-library')} className="text-xs font-semibold text-coh-navy/60 hover:text-coh-gold transition px-2">
                              View Library
                            </button>
                          </div>
                        </div>"""

draft_new = """                        <div className="bg-coh-cream/15 p-3 rounded border border-coh-gold/20 flex flex-col justify-between interactive-card">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-coh-gold">Draft in Progress</span>
                              <span className="text-[8px] bg-amber-50 text-amber-700 px-1 py-0.5 rounded font-bold uppercase border border-amber-200">Needs Review</span>
                            </div>
                            <h4 className="font-serif text-sm font-bold text-coh-navy truncate">{unapprovedDraft.title}</h4>
                            <p className="text-[10px] text-coh-navy/60 line-clamp-1 mb-2">{unapprovedDraft.text}</p>
                          </div>
                          <div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveDraftText(unapprovedDraft.text);
                                setActiveDraftTitle(unapprovedDraft.title);
                                setActiveDraftVersion(unapprovedDraft.version);
                                setActiveDraftHistory([{
                                  version: unapprovedDraft.version,
                                  text: unapprovedDraft.text,
                                  timestamp: unapprovedDraft.lastEdited,
                                  actionUsed: 'Resume recent draft'
                                }]);
                                setActiveDraftSource(unapprovedDraft.source === 'Content Workspace' ? 'Content Workspace' : (unapprovedDraft.source === 'External Content' ? 'External Content' : 'Content Library'));
                                setActiveTab('revision-studio');
                              }}
                              className="bg-coh-navy text-coh-cream hover:bg-opacity-90 text-[10px] font-bold py-1.5 px-3 rounded transition flex items-center justify-center gap-1 w-full cursor-pointer"
                            >
                              Continue <ArrowRight size={10} />
                            </button>
                          </div>
                        </div>"""

content = content.replace(draft_old, draft_new)

# Apply same tightening to approvedItem, promisingIdea, recentSource blocks...
approved_old = """                        <div className="bg-coh-cream/15 p-5 rounded border border-coh-gold/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-coh-gold">Latest Approved Content</span>
                            <span className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase border border-green-200">Approved</span>
                          </div>
                          <h4 className="font-serif text-base font-bold text-coh-navy mb-1">{approvedItem.title}</h4>
                          <p className="text-xs text-coh-navy/60 line-clamp-2 leading-relaxed mb-4">{approvedItem.text}</p>
                          <div className="flex gap-2">
                            <button onClick={() => setActiveTab('content-library')} className="bg-coh-navy text-coh-cream hover:bg-coh-navy-light text-xs font-bold py-2 px-4 rounded transition flex items-center gap-1">
                              View Library <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>"""

approved_new = """                        <div className="bg-coh-cream/15 p-3 rounded border border-coh-gold/20 interactive-card flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-coh-gold">Latest Approved</span>
                              <span className="text-[8px] bg-green-50 text-green-700 px-1 py-0.5 rounded font-bold uppercase border border-green-200">Approved</span>
                            </div>
                            <h4 className="font-serif text-sm font-bold text-coh-navy truncate">{approvedItem.title}</h4>
                            <p className="text-[10px] text-coh-navy/60 line-clamp-1 mb-2">{approvedItem.text}</p>
                          </div>
                          <button onClick={(e) => { e.preventDefault(); setActiveTab('content-library'); }} className="bg-coh-navy text-coh-cream hover:bg-opacity-90 text-[10px] font-bold py-1.5 px-3 w-full rounded transition flex items-center justify-center gap-1 cursor-pointer">
                            View Library <ArrowRight size={10} />
                          </button>
                        </div>"""

content = content.replace(approved_old, approved_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Continue patched")
