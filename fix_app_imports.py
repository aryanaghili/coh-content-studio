import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Prepend the import if missing
if "import { getCoreDocuments" not in content:
    imports = "import { getCoreDocuments } from './lib/coreDocumentsStorage';\nimport type { CoreDocument } from './lib/coreDocumentsStorage';\n"
    # Find first import and insert before it
    content = imports + content

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Imports added")
