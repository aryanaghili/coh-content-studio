import re
with open('src/lib/operatingCore.ts', 'r') as f:
    content = f.read()
content = content.replace('\\\\n', '\\n')
with open('src/lib/operatingCore.ts', 'w') as f:
    f.write(content)
print("Newlines patched in operatingCore")
