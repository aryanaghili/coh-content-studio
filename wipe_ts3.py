import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix type assertions
content = content.replace("'Tone of Voice' as SourceFile['type']", "'Other' as SourceFile['type']")
content = content.replace("file.name.endsWith('.pdf') ? 'Deck' : 'Business Memo'", "'Other'")
content = content.replace("type: 'Business Memo'", "type: 'Other'")
content = content.replace("type: 'Tone of Voice'", "type: 'Approved Example'")

# Fix setState issues and nested object initialization issues.
# E.g. in App.tsx(7444) setSourceLibrary([...])
content = re.sub(r"role:\s*[^,]+,\s*", "", content)
content = re.sub(r"supportsOperatingCoreSection:\s*[^,]+,\s*", "", content)

# Remove 'role' and 'supportsOperatingCoreSection' from interface / type definitions in setState params
content = re.sub(r"\brole:\s*SourceFile\['role'\];\n", "", content)
content = re.sub(r"\bsupportsOperatingCoreSection:\s*SourceFile\['supportsOperatingCoreSection'\];\n", "", content)
content = re.sub(r"\brole:\s*string;\n", "", content)
content = re.sub(r"\bsupportsOperatingCoreSection:\s*string;\n", "", content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Pass 3 patched")
