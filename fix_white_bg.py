import os
import glob
import re

replacements = {
    r'\bbg-white/5\b\s+backdrop-blur-md': 'bg-surface-inset',
    r'\bbg-white/5\b': 'bg-surface-inset',
    r'\bbg-white/10\b': 'bg-surface-inset',
    r'\bbg-white/15\b': 'bg-surface-inset',
    r'\bbg-white/30\b': 'bg-surface-inset',
    r'\bbg-white/40\b': 'bg-surface-inset',
    r'\bbg-white/45\b': 'bg-surface-inset',
    r'\bbg-white/50\b': 'bg-surface-inset',
    r'\bbg-white/55\b': 'bg-surface-inset',
    r'\bbg-white\b': 'bg-surface-primary',
    r'\bbg-slate-50\b': 'bg-surface-inset',
    r'\bbg-[#1e1e1e]\b': 'bg-surface-inset',
    r'\bbg-gray-50\b': 'bg-surface-inset',
    r'\bbg-gray-100\b': 'bg-surface-inset',
    r'\btext-gray-800\b': 'text-text-primary',
    r'\btext-gray-600\b': 'text-text-secondary',
    r'\btext-slate-800\b': 'text-text-primary',
    r'\btext-slate-700\b': 'text-text-primary',
    r'\btext-slate-600\b': 'text-text-secondary',
    r'\btext-slate-500\b': 'text-text-secondary',
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    for old, new in replacements.items():
        content = re.sub(old, new, content)
        
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

files_to_process = glob.glob('src/**/*.tsx', recursive=True)
for file in files_to_process:
    # Skip ui folder as it has the new components
    if 'src/components/ui' not in file:
        process_file(file)

print("Global white background refactor complete.")
