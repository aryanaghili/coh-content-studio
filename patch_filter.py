import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Filter out Core Documents in the main Source Library display
if "const actualFilteredSaved = " in content:
    content = content.replace(
        "const actualFilteredSaved = filteredSavedSourceLibrary();",
        "const actualFilteredSaved = filteredSavedSourceLibrary().filter(s => s.role !== 'Core Document');"
    )

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("App patched for filtering")
