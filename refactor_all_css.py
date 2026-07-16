import os
import glob

replacements = {
    'bg-white/5 backdrop-blur-md border border-slate-100 p-6 rounded-3xl shadow-sm': 'bg-surface-primary border border-border-standard p-6 rounded-2xl shadow-sm',
    'bg-white/5 backdrop-blur-md border border-slate-100 p-5 rounded shadow-sm': 'card-level-1 p-5 border border-border-standard',
    'bg-white/5 backdrop-blur-md border border-slate-100 p-4 rounded shadow-sm': 'card-level-1 p-4 border border-border-standard',
    'bg-white/50 p-6 rounded border border-slate-100': 'bg-surface-inset p-6 rounded-xl border border-border-standard',
    'bg-white border border-slate-100': 'bg-surface-primary border border-border-standard',
    'bg-slate-900/5': 'bg-surface-inset',
    
    'text-slate-800': 'text-text-primary',
    'text-slate-700': 'text-text-primary',
    'text-slate-600': 'text-text-secondary',
    'text-slate-500': 'text-text-secondary',
    'text-slate-400': 'text-text-muted',
    'text-violet-600': 'text-brand-gold',
    
    'bg-slate-900 text-violet-600': 'bg-brand-gold text-text-inverse hover:bg-brand-gold-hover',
    'bg-slate-900 text-white': 'bg-brand-gold text-text-inverse hover:bg-brand-gold-hover',
    'bg-violet-600 text-coh-navy': 'bg-brand-gold text-text-inverse hover:bg-brand-gold-hover',
    'hover:bg-slate-900-light': 'hover:bg-brand-gold-hover',
    'hover:bg-slate-900/90': 'hover:bg-brand-gold-hover',
    'bg-white hover:bg-violet-600/25 text-slate-800': 'bg-surface-primary hover:bg-surface-inset text-text-primary border-border-standard hover:border-brand-gold',
    
    'bg-red-500/10 backdrop-blur-md border border-red-200 text-red-800': 'bg-status-error/10 border border-status-error/20 text-status-error',
    'bg-amber-100 border border-amber-300': 'bg-status-warning/10 border border-status-warning/20',
    'bg-amber-500/10 backdrop-blur-md/70 border border-slate-200 text-slate-800': 'bg-brand-gold/10 border border-brand-gold/20 text-text-primary',
    
    'border-slate-100': 'border-border-standard',
    'border-slate-200': 'border-border-strong',
    'border-violet-500': 'border-brand-gold',
    
    'w-full bg-white border border-slate-100 p-2.5 rounded text-slate-800': 'w-full bg-surface-inset border border-border-standard p-2.5 rounded-lg text-text-primary focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:border-transparent outline-none transition-all',
    'w-full bg-white border border-slate-100 p-2 rounded text-slate-800': 'w-full bg-surface-inset border border-border-standard p-2 rounded-lg text-text-primary focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:border-transparent outline-none transition-all',
    'w-full bg-white border border-slate-100 p-1.5 rounded text-[11px]': 'w-full bg-surface-inset border border-border-standard p-1.5 rounded-md text-[11px] text-text-primary focus-visible:ring-2 focus-visible:ring-focus-ring outline-none',
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

files_to_process = glob.glob('src/**/*.tsx', recursive=True)
for file in files_to_process:
    # Skip ui folder as it has the new components
    if 'src/components/ui' not in file:
        process_file(file)

print("Global refactor complete.")
