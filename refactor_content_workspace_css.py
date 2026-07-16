import re

file_path = "src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Extract Content Workspace block
start_marker = "{activeTab === 'content-workspace' && (<ErrorBoundary fallbackTitle=\"Content Workspace Error\">"
end_marker = "{/* --- EDITORIAL CALENDAR STUDIO --- */}"
# Wait, Content Workspace is BEFORE Revision Studio
end_marker = "{activeTab === 'revision-studio' && (<ErrorBoundary fallbackTitle=\"Revision Studio Error\">"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Could not find Content Workspace boundaries")
    exit(1)

content_workspace_block = content[start_idx:end_idx]

# Map old Tailwind classes to new design tokens
replacements = {
    # Backgrounds & Cards
    'bg-white/5 backdrop-blur-md border border-slate-100 p-6 rounded-3xl shadow-sm': 'bg-surface-primary border border-border-standard p-6 rounded-2xl shadow-sm',
    'bg-white/5 backdrop-blur-md border border-slate-100 p-5 rounded shadow-sm': 'card-level-1 p-5 border border-border-standard',
    'bg-white/5 backdrop-blur-md border border-slate-100 p-4 rounded shadow-sm': 'card-level-1 p-4 border border-border-standard',
    'bg-white/50 p-6 rounded border border-slate-100': 'bg-surface-inset p-6 rounded-xl border border-border-standard',
    'bg-white border border-slate-100': 'bg-surface-primary border border-border-standard',
    'bg-slate-900/5': 'bg-surface-inset',
    
    # Text colors
    'text-slate-800': 'text-text-primary',
    'text-slate-700': 'text-text-primary',
    'text-slate-600': 'text-text-secondary',
    'text-slate-500': 'text-text-secondary',
    'text-slate-400': 'text-text-muted',
    'text-violet-600': 'text-brand-gold',
    
    # Buttons
    'bg-slate-900 text-violet-600': 'bg-brand-gold text-text-inverse hover:bg-brand-gold-hover',
    'bg-slate-900 text-white': 'bg-brand-gold text-text-inverse hover:bg-brand-gold-hover',
    'bg-violet-600 text-coh-navy': 'bg-brand-gold text-text-inverse hover:bg-brand-gold-hover',
    'hover:bg-slate-900-light': 'hover:bg-brand-gold-hover',
    'hover:bg-slate-900/90': 'hover:bg-brand-gold-hover',
    'bg-white hover:bg-violet-600/25 text-slate-800': 'bg-surface-primary hover:bg-surface-inset text-text-primary border-border-standard hover:border-brand-gold',
    
    # Validation / Warning
    'bg-red-500/10 backdrop-blur-md border border-red-200 text-red-800': 'bg-status-error/10 border border-status-error/20 text-status-error',
    'bg-amber-100 border border-amber-300': 'bg-status-warning/10 border border-status-warning/20',
    'bg-amber-500/10 backdrop-blur-md/70 border border-slate-200 text-slate-800': 'bg-brand-gold/10 border border-brand-gold/20 text-text-primary',
    
    # Borders
    'border-slate-100': 'border-border-standard',
    'border-slate-200': 'border-border-strong',
    'border-violet-500': 'border-brand-gold',
    
    # Inputs & Textareas
    'w-full bg-white border border-slate-100 p-2.5 rounded text-slate-800': 'w-full bg-surface-inset border border-border-standard p-2.5 rounded-lg text-text-primary focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:border-transparent outline-none transition-all',
    'w-full bg-white border border-slate-100 p-2 rounded text-slate-800': 'w-full bg-surface-inset border border-border-standard p-2 rounded-lg text-text-primary focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:border-transparent outline-none transition-all',
    'w-full bg-white border border-slate-100 p-1.5 rounded text-[11px]': 'w-full bg-surface-inset border border-border-standard p-1.5 rounded-md text-[11px] text-text-primary focus-visible:ring-2 focus-visible:ring-focus-ring outline-none',
}

new_block = content_workspace_block
for old, new in replacements.items():
    new_block = new_block.replace(old, new)

# Now, we also want to specifically update the header of the workspace
header_replacement = """<div className="bg-surface-primary border border-border-standard p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-sans text-2xl font-bold text-text-primary">Content Workspace</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-surface-secondary border border-border-standard text-text-primary px-2 py-0.5 rounded-full">
                      Standalone Draft
                    </span>
                  </div>
                  <p className="font-sans text-[15px] text-text-secondary mt-1">Draft, edit, and optimize individual content assets with core guidance.</p>
                </div>
                
                {/* Mode Toggle Button Group */}
                <div className="flex bg-surface-inset p-1 rounded-lg border border-border-standard shrink-0">
                  <button
                    onClick={() => setCreationMode('simple')}
                    className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                      creationMode === 'simple'
                        ? 'bg-surface-primary text-brand-gold shadow-sm border border-border-standard'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Simple Mode
                  </button>
                  <button
                    onClick={() => setCreationMode('quick')}
                    className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                      creationMode === 'quick'
                        ? 'bg-surface-primary text-brand-gold shadow-sm border border-border-standard'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Quick Create
                  </button>
                  <button
                    onClick={() => setCreationMode('advanced')}
                    className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                      creationMode === 'advanced'
                        ? 'bg-surface-primary text-brand-gold shadow-sm border border-border-standard'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Advanced Brief
                  </button>
                </div>
              </div>"""

# Find the header block to replace
old_header_pattern = r'<div className="bg-surface-primary border border-border-standard p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">\s*<div>\s*<div className="flex items-center gap-3">\s*<h2 className="page-title">Content Workspace</h2>.*?</div>\s*</div>'

new_block = re.sub(
    r'<div className="bg-surface-primary border border-border-standard p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">\s*<div>\s*<div className="flex items-center gap-3">\s*<h2 className="page-title">Content Workspace</h2>.*?</div>\s*</div>',
    header_replacement,
    new_block,
    flags=re.DOTALL
)

new_content = content.replace(content_workspace_block, new_block)

with open(file_path, "w") as f:
    f.write(new_content)

print("Content Workspace classes refactored successfully")
