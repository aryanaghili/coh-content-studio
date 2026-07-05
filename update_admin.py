import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

content = content.replace('Knowledge Library', 'Source Library')
content = content.replace('knowledge-library', 'source-library')
content = content.replace('Core Sources', 'Core Documents')
content = content.replace('Core Source', 'Core Document')
content = content.replace('knowledgeSources', 'sourceLibrary')

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

print("Updated OperatingCoreAdmin.tsx renames.")
