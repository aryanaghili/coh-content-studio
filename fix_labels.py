import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("URL Context", "URL")
content = content.replace("Bind File", "Upload")
content = content.replace("Bind to Workspace", "Add to Workspace")

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Labels updated.")
