import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('className="w-full bg-white border border-coh-gold/20 p-2 rounded text-sm text-coh-navy/80 mb-2"\n                          placeholder="e.g. sk-..."\n                        />', 'className="w-full bg-white border border-coh-gold/20 p-2 rounded text-sm text-coh-navy/80 mb-2"\n                          placeholder="e.g. sk-..."\n                          type="password"\n                        />')

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Step 12 applied.")
