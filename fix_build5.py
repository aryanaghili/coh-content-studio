import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_save = """const newSaved: SavedContent = {
                              id: `saved-${Date.now()}`,
                              title: activeWorkItem.title,
                              pillar: "General",
                              angle: "",
                              audience: activeWorkItem.audience || "General Public",
                              channel: activeWorkItem.channel || "",
                              goal: "",
                              notes: "Saved from Active Work Item",
                              content: activeWorkItem.draftVersions[0]?.text || "",
                              visualDirection: activeWorkItem.visualDirection || "",
                              visualAssets: activeWorkItem.imageResults as any,
                              status: 'Approved',
                              createdAt: activeWorkItem.createdAt,
                              updatedAt: new Date().toISOString()
                            };"""

new_save = """const newSaved: SavedContent = {
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
                            };"""

content = content.replace(old_save, new_save)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Build issues fixed.")
