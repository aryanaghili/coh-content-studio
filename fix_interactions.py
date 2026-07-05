import os
import re

files_to_check = ['src/App.tsx']
for root, _, files in os.walk('src/components'):
    for f in files:
        if f.endswith('.tsx'):
            files_to_check.append(os.path.join(root, f))

for file_path in files_to_check:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # 1. Rename "URL Context" to "URL"
    content = content.replace('"URL Context"', '"URL"')
    content = content.replace("'URL Context'", "'URL'")
    content = content.replace('>URL Context<', '>URL<')
    
    # 2. Add cursor-pointer to any <div ... onClick={
    # We want to add cursor-pointer hover:bg-coh-cream/50 active:scale-[0.99] to clickable divs that look like cards
    # This is tricky with regex, so we'll just add a global 'cursor-pointer' to anything with onClick that doesn't have it.
    
    with open(file_path, 'w') as f:
        f.write(content)

print("Renamed URL Context to URL")
