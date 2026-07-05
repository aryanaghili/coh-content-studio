import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix sourceLibrary to sources and add types to the map function to avoid TS7006
content = content.replace(
    'const s = sourceLibrary.find(x => x.id === id);', 
    'const s = [...workspaceLocalSources, ...sources].find((x: any) => x.id === id);'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed canonical input source mapping.")
