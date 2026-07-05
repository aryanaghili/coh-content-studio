import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove the sourceLibrary props passed to OperatingCoreAdmin
content = re.sub(r'sourceLibrary=\{.*\}\s*setSourceLibrary=\{.*\}\s*', '', content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Admin props removed in App.tsx")
