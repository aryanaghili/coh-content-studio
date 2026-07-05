import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

content = content.replace("fetch('http://localhost:3001/api/operating-core/unlock'", "fetch('/api/operating-core/unlock'")

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

print("Admin fetch path fixed")
