import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add badge component style locally in App.tsx just as a string helper or just directly inline
# e.g., <span className="bg-coh-navy/10 text-coh-navy px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-2">Draft</span>

# 1. Content Workspace - Generated Options
# <h3>Option A</h3>
content = re.sub(
    r'(<h3 className="font-serif text-lg font-bold text-coh-navy mb-2">Option A</h3>)',
    r'\1\n                        <div className="flex items-center gap-2 mb-2">\n                          <span className="bg-coh-gold/20 text-coh-navy px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Draft</span>\n                        </div>',
    content
)
content = re.sub(
    r'(<h3 className="font-serif text-lg font-bold text-coh-navy mb-2">Option B</h3>)',
    r'\1\n                        <div className="flex items-center gap-2 mb-2">\n                          <span className="bg-coh-gold/20 text-coh-navy px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Draft</span>\n                        </div>',
    content
)

# 2. Revision Studio - Current Content
content = re.sub(
    r'(<h3 className="font-serif text-lg text-coh-navy mb-4">Current Content</h3>)',
    r'\1\n                <div className="mb-4">\n                  <span className="bg-coh-gold/20 text-coh-navy px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Revision</span>\n                </div>',
    content
)

# 3. Visual Studio
content = re.sub(
    r'(<h3 className="font-serif text-lg text-coh-navy font-bold mb-4">Generated Visual</h3>)',
    r'\1\n                  <div className="mb-4">\n                    <span className="bg-coh-gold/20 text-coh-navy px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Image</span>\n                  </div>',
    content
)

# 4. Content Library Items
content = re.sub(
    r'(<div className="font-serif text-lg font-bold text-coh-navy">)\s*({item\.title})',
    r'\1{item.title} <span className="ml-2 bg-coh-navy/10 text-coh-navy px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider align-middle">{item.status === "Approved" ? "Approved" : "Saved"}</span>',
    content
)

# 5. Idea Library Items
content = re.sub(
    r'(<h4 className="font-serif text-lg font-bold text-coh-navy mb-2">)\s*({idea\.title})',
    r'\1{idea.title} <span className="ml-2 bg-coh-navy/10 text-coh-navy px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider align-middle">Idea</span>',
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Badges added.")
