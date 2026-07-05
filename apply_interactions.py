import os
import re

files = ['src/App.tsx']
for r, d, f in os.walk('src/components'):
    for file in f:
        if file.endswith('.tsx'):
            files.append(os.path.join(r, file))

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Rename URL Context to URL
    content = content.replace('"URL Context"', '"URL"')
    content = content.replace("'URL Context'", "'URL'")
    content = content.replace('>URL Context<', '>URL<')

    # 2. Buttons get action-button
    content = re.sub(r'<button([^>]*?)className="([^"]*?)"', lambda m: '<button' + m.group(1) + 'className="' + m.group(2) + (' action-button' if 'action-button' not in m.group(2) else '') + '"', content, flags=re.DOTALL)
    
    # Handle dynamic classNames: className={`...`}
    content = re.sub(r'<button([^>]*?)className=\{`([^`]*?)`\}', lambda m: '<button' + m.group(1) + 'className={`' + m.group(2) + (' action-button' if 'action-button' not in m.group(2) else '') + '`}', content, flags=re.DOTALL)

    # 3. Divs with onClick get interactive-card
    # className="something" ... onClick=
    content = re.sub(r'<div([^>]*?)className="([^"]*?)"([^>]*?)onClick=', lambda m: '<div' + m.group(1) + 'className="' + m.group(2) + (' interactive-card' if 'interactive' not in m.group(2) else '') + '"' + m.group(3) + 'onClick=', content, flags=re.DOTALL)
    # onClick= ... className="something"
    content = re.sub(r'<div([^>]*?)onClick=([^>]*?)className="([^"]*?)"', lambda m: '<div' + m.group(1) + 'onClick=' + m.group(2) + 'className="' + m.group(3) + (' interactive-card' if 'interactive' not in m.group(3) else '') + '"', content, flags=re.DOTALL)
    
    # Same for className={`...`}
    content = re.sub(r'<div([^>]*?)className=\{`([^`]*?)`\}([^>]*?)onClick=', lambda m: '<div' + m.group(1) + 'className={`' + m.group(2) + (' interactive-card' if 'interactive' not in m.group(2) else '') + '`}' + m.group(3) + 'onClick=', content, flags=re.DOTALL)
    content = re.sub(r'<div([^>]*?)onClick=([^>]*?)className=\{`([^`]*?)`\}', lambda m: '<div' + m.group(1) + 'onClick=' + m.group(2) + 'className={`' + m.group(3) + (' interactive-card' if 'interactive' not in m.group(3) else '') + '`}', content, flags=re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(content)

print("Applied interactive classes.")
