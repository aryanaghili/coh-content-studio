with open('src/App.tsx', 'r') as f:
    content = f.read()

bad_block = """                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-coh-navy/70 mb-1 font-medium">Role</label>
                      <select
                        value={newSource.role}
                        onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy font-mono text-[11px]"
                      />
                    </div>
                  )}"""

content = content.replace(bad_block, "")

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("JSX fixed")
