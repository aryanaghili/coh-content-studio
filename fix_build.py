import re

# Fix OperatingCoreAdmin.tsx useState
with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

# I see it failed to insert because the signature was slightly different:
# It's probably `export function OperatingCoreAdmin(props) {` or similar. Let's find the function declaration.
content = re.sub(r'(export function OperatingCoreAdmin\([^)]+\)\s*\{)', 
                 r'\1\n  const [extractingInsightFor, setExtractingInsightFor] = React.useState<string | null>(null);\n', 
                 content)

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)


# Fix App.tsx props and "Link" compare
with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix the prop name `knowledgeSources` -> `sourceLibrary`
content = content.replace('knowledgeSources={sourceLibrary}', 'sourceLibrary={sourceLibrary}')

# Fix the 'Link' compare. It might be something like `newSource.type === 'Link'`
content = content.replace("=== 'Link'", "=== 'Link / URL'")
content = content.replace("!== 'Link'", "!== 'Link / URL'")

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed build errors.")
