import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

# Fix useEffect import
if 'useEffect' not in content.split('import ')[1].split('from')[0]:
    content = content.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';")

# Fix activeTab type
content = content.replace(
    "useState<'passport' | 'strategy' | 'core-documents' | 'preview'>('passport')",
    "useState<'passport' | 'strategy' | 'kernel' | 'audiences' | 'channels' | 'claims' | 'voice' | 'visual' | 'revision' | 'evidence' | 'core-documents' | 'preview'>('passport')"
)

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

print("Admin tabs fixed")
