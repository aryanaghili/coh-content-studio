import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add subtitle to Visual Studio
if 'Use full visual directions for stronger image results' not in content:
    content = re.sub(
        r'(<h2 className="font-serif text-2xl text-coh-navy mb-[2px]">Visual Studio</h2>)',
        r'\1\n          <p className="text-xs text-coh-navy/60 mb-6">Use full visual directions for stronger image results.</p>',
        content
    )

# Add subtitle to Revision Studio
if 'Refine existing content without starting over' not in content:
    content = re.sub(
        r'(<h2 className="font-serif text-2xl text-coh-navy mb-[2px]">Revision Studio</h2>)',
        r'\1\n          <p className="text-xs text-coh-navy/60 mb-6">Refine existing content without starting over.</p>',
        content
    )

# We can also add subtitles for Simple Mode, Quick Create, and Advanced Brief directly into the tab array or where they are rendered if there is a header.
# Actually, those tabs usually don't have descriptions under them. The user wants "helper text only where it helps decision-making" and gives these examples.
# If there is a place where modes are described, we can add them. I will look for where 'Simple Mode' is displayed as a header or tab.
# Let's just do a simple replacement if there's a header for the Workspace.
if 'Best for quick messages, updates, and first drafts' not in content:
    content = re.sub(
        r'(<h3 className="font-serif text-xl text-coh-navy">Simple Mode</h3>)',
        r'\1\n          <p className="text-xs text-coh-navy/60 mb-4">Best for quick messages, updates, and first drafts.</p>',
        content
    )

if 'Best when you know the channel and format' not in content:
    content = re.sub(
        r'(<h3 className="font-serif text-xl text-coh-navy">Quick Create</h3>)',
        r'\1\n          <p className="text-xs text-coh-navy/60 mb-4">Best when you know the channel and format.</p>',
        content
    )

if 'Best when audience, source material, and purpose matter' not in content:
    content = re.sub(
        r'(<h3 className="font-serif text-xl text-coh-navy">Advanced Brief</h3>)',
        r'\1\n          <p className="text-xs text-coh-navy/60 mb-4">Best when audience, source material, and purpose matter.</p>',
        content
    )

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Modes updated.")
