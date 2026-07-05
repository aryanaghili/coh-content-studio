import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix types being injected manually
content = content.replace("type: 'Text'", "type: 'Pasted Notes'")

# Remove role and supports properties completely from object literals
content = re.sub(r"role:\s*[^,]+,\s*", "", content)
content = re.sub(r"supportsOperatingCoreSection:\s*[^,]+,\s*", "", content)

# Remove source.role checks in conditions
content = re.sub(r"source\.role === '[^']*'", "false", content)
content = re.sub(r"s\.role === '[^']*'", "false", content)
content = re.sub(r"s\.role !== '[^']*'", "true", content)

# Remove source.supportsOperatingCoreSection checks
content = re.sub(r"source\.supportsOperatingCoreSection === '[^']*'", "false", content)
content = re.sub(r"s\.supportsOperatingCoreSection === '[^']*'", "false", content)
content = re.sub(r"s\.supportsOperatingCoreSection !== '[^']*'", "true", content)

# Look for specific lines in App.tsx where remaining types cause issues
content = content.replace("source.type === 'Business Memo' || source.type === 'Deck'", "false")

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

# Fix useEffect import specifically
if 'useEffect' not in content.split('import ')[1].split('from')[0]:
    content = re.sub(r"import\s*\{\s*useState\s*\}\s*from\s*'react';", "import { useState, useEffect } from 'react';", content)

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

print("Pass 2 patched")
