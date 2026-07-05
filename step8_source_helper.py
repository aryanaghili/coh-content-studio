import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_helper = """                <div className="mt-3 inline-flex items-center gap-2 bg-coh-cream/50 px-3 py-1.5 rounded border border-coh-gold/10">
                  <span className="text-[10px] text-coh-navy/60 font-semibold uppercase">Helper:</span>
                  <span className="text-xs text-coh-navy/70">Source Library stores task-specific materials. Foundational brain documents are managed separately in the Operating Core.</span>
                  <button onClick={() => setActiveTab('operating-core')} className="text-xs font-bold text-coh-navy interactive-link transition ml-2">Open Operating Core →</button>
                </div>"""

new_helper = ""

content = content.replace(old_helper, new_helper)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Source helper updated.")
