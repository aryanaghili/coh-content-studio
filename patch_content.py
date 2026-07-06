import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# We want to replace the start of Content Workspace with the fallback logic.
# Find:
#         {/* --- TAB 2: CONTENT WORKSPACE --- */}
#         {activeTab === 'content-workspace' && (
#           <div className="space-y-8 animate-fadeIn">
#             
# 
#             {/* Active Work Item Header */}
#             <div className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

fallback_ui = """        {/* --- TAB 2: CONTENT WORKSPACE --- */}
        {activeTab === 'content-workspace' && (
          <div className="space-y-8 animate-fadeIn">
            {!activeWorkItem ? (
              <div className="bg-white border border-coh-gold/20 p-12 rounded shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-coh-navy/5 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl">📝</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-coh-navy">Content Workspace</h2>
                <p className="text-coh-navy/60 font-sans max-w-md">
                  No draft yet. Add a message, choose a channel, and generate your first version.
                </p>
                <button 
                  onClick={() => {
                    const id = `work-${Date.now()}`;
                    setActiveWorkItem({
                      id, title: 'New Work Item', type: 'Content', status: 'Brief', draftVersions: [], imageResults: [], revisionHistory: [], approved: false, saved: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                    });
                  }} 
                  className="bg-coh-navy hover:bg-coh-navy-light text-coh-cream font-bold py-2.5 px-6 rounded transition interactive-button mt-4"
                >
                  Start New Draft
                </button>
              </div>
            ) : (
              <>
            {/* Active Work Item Header */}
            <div className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">"""

content = content.replace(
    '        {/* --- TAB 2: CONTENT WORKSPACE --- */}\n        {activeTab === \'content-workspace\' && (\n          <div className="space-y-8 animate-fadeIn">\n            \n\n            {/* Active Work Item Header */}\n            <div className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">',
    fallback_ui
)

# And we must close the Fragment at the end of Content Workspace.
# The end of Content Workspace is just before:
#         {/* --- TAB 3: REVISION STUDIO --- */}

content = content.replace(
    '              </div>\n\n\n            </div>\n          </div>\n        )}\n\n        {/* --- TAB 3: REVISION STUDIO --- */}',
    '              </div>\n\n\n            </div>\n              </>\n            )}\n          </div>\n        )}\n\n        {/* --- TAB 3: REVISION STUDIO --- */}'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
