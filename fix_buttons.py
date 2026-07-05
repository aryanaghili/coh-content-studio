import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Most buttons have "transition" or "hover:bg-coh-navy-light". We can just add interactive-button to them.
content = re.sub(
    r'(<button[^>]+className="[^"]*)(bg-coh-navy text-coh-gold[^"]*)(")',
    r'\1\2 interactive-button\3',
    content
)

content = re.sub(
    r'(<button[^>]+className="[^"]*)(bg-coh-cream border border-coh-gold/20[^"]*)(")',
    r'\1\2 interactive-button\3',
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    admin_content = f.read()

admin_content = re.sub(
    r'(<button[^>]+className="[^"]*)(bg-coh-navy text-coh-cream[^"]*)(")',
    r'\1\2 interactive-button\3',
    admin_content
)

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(admin_content)

print("Buttons patched")
