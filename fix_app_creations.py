import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove role and supportsOperatingCoreSection assignments in object literals
content = re.sub(r"\s*role:\s*'Task Source',?", "", content)
content = re.sub(r"\s*supportsOperatingCoreSection:\s*'None',?", "", content)

# Remove the default assignments inside the form state declarations for role and supportsOperatingCoreSection
content = re.sub(r"const \[newSourceRole, setNewSourceRole\] = useState<[^>]+>\('Task Source'\);\s*", "", content)
content = re.sub(r"const \[newSourceSupports, setNewSourceSupports\] = useState<[^>]+>\('None'\);\s*", "", content)

# Remove the form inputs from the Add Source Modal
role_input_regex = r'\{/\* Role \*/\}.*?\{/\* Status \*/\}'
content = re.sub(role_input_regex, '{/* Status */}', content, flags=re.DOTALL)

# Fix the hardcoded types in the Add Source dropdown
old_types = "['Tone of Voice', 'Business Model', 'Strategic Plan', 'Business Memo', 'Website Copy', 'Deck', 'Event Notes', 'Partnership Notes', 'Sponsorship Notes', 'Approved Example', 'Image / Visual Asset', 'Article / Media Coverage', 'Team Notes', 'Link / URL', 'PDF', 'Audio', 'Text', 'Video', 'Image', 'Other']"
new_types = "['Event Notes', 'Partner Profile', 'Sponsor Notes', 'Meeting Notes', 'Campaign Notes', 'Article / Media Coverage', 'Website Reference', 'Visual Reference', 'Approved Example', 'Pasted Notes', 'Link / URL', 'Other']"
content = content.replace(old_types, new_types)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Creations and modal updated")
