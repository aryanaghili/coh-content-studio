import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Hide "Suggested Core Documents" section by changing its condition to false
content = re.sub(
    r"\{\(sourceLibraryFilter === 'All' \|\| sourceLibraryFilter === 'Core Documents'\) && \(",
    "{false && (",
    content
)

# Hide Core Documents filter
content = content.replace("'All', 'Core Documents', 'Task Sources'", "'All', 'Task Sources'")

# Hide "Open Operating Core" button from header
content = re.sub(
    r"\{!isOperatingCoreUnlocked \? \(.*?Open Operating Core\s*</button>\s*\)\}",
    "{null}",
    content,
    flags=re.DOTALL
)

# Hide Role and Supports badges
content = content.replace("{src.role && (", "{false && (")
content = content.replace("{src.supportsOperatingCoreSection && src.supportsOperatingCoreSection !== 'None' && (", "{false && (")

# Hide Extract Insight logic for Operating Core
content = content.replace("{extractingInsightFor === src.id && (", "{false && (")
content = content.replace("<button\\n                                onClick={() => setExtractingInsightFor", "<button className=\"hidden\" onClick={() => setExtractingInsightFor")

# Update subtitle
content = content.replace(
    'A central repository for all source materials used to generate content. Includes standard user-facing context documents as well as foundational Operating Core business strategies.',
    'Store task-specific materials such as event notes, partner profiles, sponsor notes, meeting notes, campaign context, media references, website references, pasted notes, links, and visual references for use in content generation.'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)


with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    admin_content = f.read()

# Let's cleanly inject a new local state for core documents and a useEffect to save it
if 'useEffect' not in admin_content.split('import ')[1].split('from')[0]:
    admin_content = admin_content.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';")

state_injection = """
  const [operatingCoreDocuments, setOperatingCoreDocuments] = useState<any[]>(() => {
    const saved = localStorage.getItem('coh-operating-core-documents');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('coh-operating-core-documents', JSON.stringify(operatingCoreDocuments));
  }, [operatingCoreDocuments]);
"""
if 'setOperatingCoreDocuments' not in admin_content:
    admin_content = admin_content.replace("const [activeTab, setActiveTab] = useState", state_injection + "  const [activeTab, setActiveTab] = useState")

# Replace Core Documents UI panel
core_docs_ui_old = r"\{/\* TAB: CORE DOCUMENTS \*/\}.*?\{/\* TAB: PREVIEW \*/\}"
core_docs_ui_new = """{/* TAB: CORE DOCUMENTS */}
      {activeTab === 'core-documents' && (
        <div className="space-y-6">
          <div className="bg-white border border-coh-gold/20 p-6 rounded shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-serif text-xl text-coh-navy">Core Documents</h3>
                <p className="text-xs text-coh-navy/60 mt-1">Upload foundational business strategies and master decks.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const newDoc = {
                      id: 'core-' + Date.now().toString(),
                      title: 'New Core Document',
                      type: 'Business Model',
                      status: 'Active',
                      role: 'Core Strategy',
                      supportsOperatingCoreSection: 'Strategy Kernel',
                      createdAt: new Date().toISOString(),
                      content: '',
                      appliedToOperatingCore: false
                    };
                    setOperatingCoreDocuments([newDoc, ...operatingCoreDocuments]);
                  }}
                  className="bg-coh-navy text-coh-cream hover:opacity-90 active:scale-[0.98] transition-all text-xs font-bold py-2 px-4 rounded cursor-pointer"
                >
                  + Add Core Document
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {operatingCoreDocuments.length === 0 ? (
                <div className="text-center py-12 bg-coh-cream/10 rounded border border-dashed border-coh-gold/30">
                  <p className="text-sm text-coh-navy/60 mb-2">No Core Documents exist in the Operating Core.</p>
                  <p className="text-xs text-coh-navy/40">Add your Strategic Plan, Business Model, or Voice Guidelines.</p>
                </div>
              ) : (
                operatingCoreDocuments.map(doc => (
                  <div key={doc.id} className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm">
                    <div className="flex justify-between mb-2">
                      <input 
                        value={doc.title}
                        onChange={(e) => {
                          const updated = operatingCoreDocuments.map(d => d.id === doc.id ? {...d, title: e.target.value} : d);
                          setOperatingCoreDocuments(updated);
                        }}
                        className="font-serif text-lg font-bold text-coh-navy bg-transparent border-none outline-none focus:ring-1 focus:ring-coh-gold/50 rounded px-1 w-2/3"
                      />
                      <button 
                        onClick={() => {
                          setOperatingCoreDocuments(operatingCoreDocuments.filter(d => d.id !== doc.id));
                        }}
                        className="text-red-500/50 hover:text-red-500 transition cursor-pointer"
                        title="Delete Document"
                      >
                        Delete
                      </button>
                    </div>
                    <textarea 
                      value={doc.content}
                      onChange={(e) => {
                        const updated = operatingCoreDocuments.map(d => d.id === doc.id ? {...d, content: e.target.value} : d);
                        setOperatingCoreDocuments(updated);
                      }}
                      className="w-full h-32 p-3 text-sm border border-coh-navy/10 rounded focus:border-coh-gold/50 focus:ring-1 focus:ring-coh-gold outline-none resize-y font-mono"
                      placeholder="Paste document text or summary here..."
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: PREVIEW */}"""
admin_content = re.sub(core_docs_ui_old, core_docs_ui_new, admin_content, flags=re.DOTALL)

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(admin_content)

print("UI patched safely")
