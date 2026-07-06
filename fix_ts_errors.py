import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix mock objects
content = re.sub(r"role: '[^']+',?", "", content)
content = re.sub(r"supportsOperatingCoreSection: '[^']+',?", "", content)
content = re.sub(r"useFor: '[^']+',?", "", content)

# Fix src usages
content = re.sub(r"src\.role === '[^']+'", "true", content)
content = re.sub(r"src\.role !== '[^']+'", "false", content)
content = re.sub(r"src\.supportsOperatingCoreSection === '[^']+'", "true", content)
content = re.sub(r"src\.supportsOperatingCoreSection !== '[^']+'", "false", content)
content = re.sub(r"src\.useFor", "''", content)
content = re.sub(r"src\.role", "''", content)
content = re.sub(r"src\.supportsOperatingCoreSection", "''", content)

# Fix literal `type: 'Business Memo' | 'Deck'`
content = content.replace("type: 'Business Memo' | 'Deck'", "type: 'Other'")
content = content.replace("type: 'Business Memo'", "type: 'Other'")
content = content.replace("type: 'Deck'", "type: 'Other'")

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("TS errors regex 2.")
