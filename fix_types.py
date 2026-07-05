import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add Strategic Plan to Types if not there
content = content.replace("| 'Business Model'", "| 'Business Model'\n    | 'Strategic Plan'")

# Replace Link with Link / URL in the types list
content = content.replace("| 'Link'", "| 'Link / URL'")

# Update form dropdowns if they exist. Let's find `<select value={newSource.type}` or similar.
# In React, dropdowns for 'type' probably look like `<option value="Business Model">`
content = content.replace('<option value="Link">Link</option>', '<option value="Link / URL">Link / URL</option>')

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Updated SourceFile Types.")
