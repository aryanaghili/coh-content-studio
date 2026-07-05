import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix 1: SavedContent missing properties. Let's just push a fully compliant object.
old_save = """const newSaved = {
                              id: `saved-${Date.now()}`,
                              displayName: activeWorkItem.title,
                              prompt: "Saved from Active Work Item",
                              options: activeWorkItem.type || "",
                              channel: activeWorkItem.channel || "",
                              result: activeWorkItem.draftVersions[0]?.text || "",
                              status: 'Approved',
                              savedAt: new Date().toISOString()
                            };"""
new_save = """const newSaved: SavedContent = {
                              id: `saved-${Date.now()}`,
                              title: activeWorkItem.title,
                              pillar: "General",
                              angle: "",
                              audience: activeWorkItem.audience || "General Public",
                              channel: activeWorkItem.channel || "",
                              format: activeWorkItem.outputFormat || "Post",
                              goal: "",
                              notes: "Saved from Active Work Item",
                              content: activeWorkItem.draftVersions[0]?.text || "",
                              visualDirection: activeWorkItem.visualDirection || "",
                              visualAssets: activeWorkItem.imageResults,
                              status: 'Approved',
                              createdAt: activeWorkItem.createdAt,
                              updatedAt: new Date().toISOString()
                            };"""
content = content.replace(old_save, new_save)

# Fix 2: settings vs activeConfig / aiStatus
content = content.replace("!settings.apiKey", "!aiProvider")
content = content.replace("settings.apiKey", "aiProvider")
content = content.replace("settings.model", "aiTextModel")
content = content.replace("settings.imageModel", "aiImageModel")

# Fix 3: lucide-react icons. I need to add them to the import.
import_match = re.search(r"import \{([^}]+)\} from 'lucide-react';", content)
if import_match:
    icons = import_match.group(1)
    missing_icons = ['AlertCircle', 'Camera', 'Globe', 'Mail', 'MessageSquare', 'Briefcase', 'Layers']
    for icon in missing_icons:
        if icon not in icons:
            icons += f", {icon}"
    content = content.replace(import_match.group(0), f"import {{{icons}}} from 'lucide-react';")

# Fix 4: SavedIdea status 'Idea' -> 'New'
content = content.replace("i.status === 'Idea'", "i.status === 'New'")

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Build issues fixed.")
