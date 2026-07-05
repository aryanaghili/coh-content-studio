import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace any object literal property assignments for role and supportsOperatingCoreSection
content = re.sub(r"^\s*role:.*?\n", "", content, flags=re.MULTILINE)
content = re.sub(r"^\s*supportsOperatingCoreSection:.*?\n", "", content, flags=re.MULTILINE)

# Strip out type 'Text' usage
content = content.replace("type: 'Text'", "type: 'Pasted Notes'")

# Strip out obsolete string type matching
content = content.replace("source.type === 'Business Memo' || source.type === 'Deck'", "false")
content = content.replace("source.type === 'Tone of Voice'", "false")

# Delete remaining conditionals that use role
content = re.sub(r"source\.role === '[^']+'", "false", content)
content = re.sub(r"source\.supportsOperatingCoreSection === '[^']+'", "false", content)

# Remove specific lines referencing these deleted properties by splitting into lines and filtering
lines = content.split('\n')
new_lines = []
for line in lines:
    if "s.role" in line or "source.role" in line or "sourceLibraryFilter ===" in line and "s.role" in line:
        # If it's just a condition like `s.role === 'Task Source'` we can skip it or replace it, 
        # but the safest is replacing the substring.
        pass
    if "s.supportsOperatingCoreSection" in line or "source.supportsOperatingCoreSection" in line:
        pass
        
    new_lines.append(line)

content = '\n'.join(new_lines)

# A more aggressive manual replace for the specific lines that failed:
content = re.sub(r"s\.role === '[^']*'", "false", content)
content = re.sub(r"s\.supportsOperatingCoreSection === '[^']*'", "false", content)
content = re.sub(r"s\.role !== '[^']*'", "true", content)
content = re.sub(r"s\.supportsOperatingCoreSection !== '[^']*'", "true", content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()
if 'useEffect' not in content.split('import ')[1].split('from')[0]:
    content = re.sub(r"import\s*\{\s*useState\s*\}\s*from\s*'react';", "import { useState, useEffect } from 'react';", content)
with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

