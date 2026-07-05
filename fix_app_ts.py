import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix types being injected manually into mock sources or logic
content = content.replace("source.type === 'Tone of Voice'", "source.type === 'Approved Example'")
content = content.replace("source.type === 'Business Memo' || source.type === 'Deck'", "source.type === 'Other'")
content = content.replace("type: 'Business Memo',", "type: 'Other',")
content = content.replace("type: 'Tone of Voice',", "type: 'Approved Example',")

# Remove remaining role checks (mostly in the source filter logic for counting lengths)
content = re.sub(r"s\.role === '[^']*'", "false", content)
content = re.sub(r"source\.role === '[^']*'", "false", content)

# Remove remaining supportsOperatingCoreSection checks
content = re.sub(r"s\.supportsOperatingCoreSection === '[^']*'", "false", content)

# Look for specific lines in App.tsx where role is still assigned
# Just do a blanket wipe of role: '...', and supportsOperatingCoreSection: '...', if they exist
content = re.sub(r"role:\s*'[^']*',?\s*", "", content)
content = re.sub(r"supportsOperatingCoreSection:\s*'[^']*',?\s*", "", content)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("App.tsx TS issues patched")
