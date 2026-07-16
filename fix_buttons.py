import os
import re

files_to_check = []
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            files_to_check.append(os.path.join(root, file))

for filepath in files_to_check:
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace bg-slate-900 text-text-primary with text-white
    content = re.sub(r'bg-slate-900 text-text-primary', r'bg-slate-900 text-white', content)
    # Replace bg-slate-900 text-brand-gold with text-white
    content = re.sub(r'bg-slate-900 text-brand-gold', r'bg-slate-900 text-white', content)
    # Replace bg-black text-text-primary with bg-slate-900 text-white
    content = re.sub(r'bg-black text-text-primary', r'bg-slate-900 text-white', content)
    # Replace text-coh-cream with text-white
    content = re.sub(r'text-coh-cream', r'text-white', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

print("Replaced colors in tsx files")
