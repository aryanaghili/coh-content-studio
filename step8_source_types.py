import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_types = """                        <option value="Tone of Voice">Tone of Voice</option>
                        <option value="Business Model">Business Model</option>
                        <option value="Business Memo">Business Memo</option>
                        <option value="Website Copy">Website Copy</option>
                        <option value="Deck">Deck</option>
                        <option value="Event Notes">Event Notes</option>
                        <option value="Partnership Notes">Partnership Notes</option>
                        <option value="Sponsorship Notes">Sponsorship Notes</option>
                        <option value="Approved Example">Approved Example</option>
                        <option value="Image / Visual Asset">Image / Visual Asset</option>
                        <option value="Article / Media Coverage">Article / Media Coverage</option>
                        <option value="Team Notes">Team Notes</option>
                        <option value="Link / URL">Link / URL</option>"""

new_types = """                        <option value="Event Notes">Event Notes</option>
                        <option value="Partner Profile">Partner Profile</option>
                        <option value="Sponsor Notes">Sponsor Notes</option>
                        <option value="Meeting Notes">Meeting Notes</option>
                        <option value="Campaign Notes">Campaign Notes</option>
                        <option value="Article / Media Coverage">Article / Media Coverage</option>
                        <option value="Website Reference">Website Reference</option>
                        <option value="Visual Reference">Visual Reference</option>
                        <option value="Approved Example">Approved Example</option>
                        <option value="Pasted Notes">Pasted Notes</option>
                        <option value="Link / URL">Link / URL</option>
                        <option value="Other">Other</option>"""

content = content.replace(old_types, new_types)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Source types updated.")
