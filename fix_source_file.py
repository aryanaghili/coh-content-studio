import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Remove `role`, `supportsOperatingCoreSection`, `useFor` from `newSource` default initialization
# There are two places: newSource definition and `handleSaveSource` reset
content = re.sub(r"role: 'Task Source',", "", content)
content = re.sub(r"supportsOperatingCoreSection: 'None',", "", content)
content = re.sub(r"useFor: '',", "", content)

# 2. Fix the `SourceFile` mock data (e.g. Tone of Voice, Business Memo, etc.)
content = re.sub(r"type: 'Tone of Voice',", "type: 'Other',", content)
content = re.sub(r"type: 'Business Memo'", "type: 'Other'", content)
content = re.sub(r"type: 'Deck'", "type: 'Other'", content)
content = re.sub(r"type: 'Text',", "type: 'Pasted Notes',", content)

# 3. Remove `role: 'Core Document'` usages in the file (there's an object property assignment)
content = re.sub(r"role: 'Core Document',", "", content)

# 4. Remove `createdAt` from `SourceFile`? Wait, I removed it from the interface by accident.
# Let me add `createdAt` back to the interface!
content = content.replace("url?: string;\n  selected?: boolean;", "url?: string;\n  createdAt: string;\n  selected?: boolean;")

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("SourceFile TS errors partially fixed.")
