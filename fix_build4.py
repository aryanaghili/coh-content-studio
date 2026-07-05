import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Let's read the SavedContent interface to see the required fields
match = re.search(r'interface SavedContent \{(.*?)\}', content, re.DOTALL)
if match:
    print(match.group(1))

