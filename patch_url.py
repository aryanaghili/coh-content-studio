import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('URL Context Link (https://...)', 'URL (https://...)')
content = content.replace('Add URL Context', 'Add URL')
content = content.replace('URL Context', 'URL')

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("URL Context renamed to URL")
