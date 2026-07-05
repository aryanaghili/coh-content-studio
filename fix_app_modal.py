import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove Role and Supports Section inputs from the Add Source modal
role_input_regex = r'\{/\* Role \*/\}.*?\{/\* Status \*/\}'
content = re.sub(role_input_regex, '{/* Status */}', content, flags=re.DOTALL)

# Remove the default assignments inside the form state declarations for role and supportsOperatingCoreSection
content = re.sub(r'const \[newSourceRole, setNewSourceRole\] = useState<\'Core Document\' \| \'Task Source\' \| \'Approved Example\' \| \'Partner Context\' \| \'Visual Reference\' \| \'Archive\'>\(\'Task Source\'\);\s*', '', content)
content = re.sub(r'const \[newSourceSupports, setNewSourceSupports\] = useState<\'Core Passport\' \| \'Strategy Kernel\' \| \'Audiences\' \| \'Channels\' \| \'Claims\' \| \'Voice\' \| \'Visual\' \| \'Revision\' \| \'None\'>\(\'None\'\);\s*', '', content)

# I need to be careful with the types list rendering inside the Add Source modal. The options are rendered using a map over the `SourceFile['type']`. Since I updated the TypeScript interface, I don't necessarily have an explicit array in App.tsx unless it was hardcoded. 
# Let's check for any hardcoded type arrays.
content = re.sub(
    r"\['Tone of Voice', 'Business Model', 'Strategic Plan', 'Business Memo', 'Website Copy', 'Deck', 'Event Notes', 'Partnership Notes', 'Sponsorship Notes', 'Approved Example', 'Image / Visual Asset', 'Article / Media Coverage', 'Team Notes', 'Link / URL', 'PDF', 'Audio', 'Text', 'Video', 'Image', 'Other'\]",
    "['Event Notes', 'Partner Profile', 'Sponsor Notes', 'Meeting Notes', 'Campaign Notes', 'Article / Media Coverage', 'Website Reference', 'Visual Reference', 'Approved Example', 'Pasted Notes', 'Link / URL', 'Other']",
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Modal inputs and type dropdown updated")
