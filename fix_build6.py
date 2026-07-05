import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Let's just find the `const newSaved` block entirely using regex and replace it.
content = re.sub(
    r'const newSaved.*?updatedAt: new Date\(\)\.toISOString\(\)\n                            \};',
    r'''const newSaved: SavedContent = {
                              id: `saved-${Date.now()}`,
                              title: activeWorkItem.title,
                              pillar: "General",
                              angle: "",
                              audience: activeWorkItem.audience || "General Public",
                              channel: activeWorkItem.channel || "",
                              purpose: activeWorkItem.purpose || "General",
                              status: 'Approved',
                              sourcesUsed: [],
                              createdAt: activeWorkItem.createdAt,
                              lastEdited: new Date().toISOString(),
                              text: activeWorkItem.draftVersions[0]?.text || "",
                              notes: "Saved from Active Work Item",
                              version: 1,
                              visualDirection: activeWorkItem.visualDirection || "",
                              visualAssets: activeWorkItem.imageResults as any
                            };''',
    content,
    flags=re.DOTALL
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Build issues fixed.")
