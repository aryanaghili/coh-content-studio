import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

def replace_input(field, old_field_name=None):
    if not old_field_name:
        old_field_name = field
    
    old_logic = rf"const docs = \[\.\.\.operatingCoreDocuments\];\s*docs\[idx\]\.{old_field_name} = e\.target\.value;\s*setOperatingCoreDocuments\(docs\);"
    new_logic = f"const val = e.target.value;\n                            const docs = [...operatingCoreDocuments];\n                            docs[idx].{field} = val;\n                            setOperatingCoreDocuments(docs);\n                            updateCoreDocument(doc.id, {{ {field}: val }});"
    return re.sub(old_logic, new_logic, content)

content = replace_input('title')
content = replace_input('documentType', 'type')
content = replace_input('status')
content = replace_input('brainArea')
content = replace_input('brainRole')
content = replace_input('shortContext', 'notes')
content = replace_input('rawText', 'content')

# Also fix the unapply method import which wasn't added
content = content.replace("applyCoreDocumentToOperatingCore, CoreDocument", "applyCoreDocumentToOperatingCore, unapplyCoreDocumentFromOperatingCore, CoreDocument")

# If unapply is clicked? The user prompt asks for Review panel. I implemented apply above.

# Now check if it parses
with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

print("Step 3 done")
