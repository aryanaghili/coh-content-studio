import os

# Directories to process
dirs_to_process = ["src", "src/components", "src/ui"]
file_paths = []

for d in dirs_to_process:
    if os.path.exists(d):
        for f in os.listdir(d):
            if f.endswith(".tsx") or f.endswith(".ts"):
                file_paths.append(os.path.join(d, f))

# We also want to replace the specific hardcodes the user mentioned
replacements = {
    # Backgrounds
    "bg-white": "bg-white/5 backdrop-blur-md",
    "bg-coh-cream": "bg-white/10 backdrop-blur-sm",
    "bg-coh-cream/45": "bg-white/5 backdrop-blur-sm",
    "bg-coh-cream/30": "bg-white/5 backdrop-blur-sm",
    "bg-coh-cream/50": "bg-white/5 backdrop-blur-sm",
    "bg-coh-cream-dark": "bg-white/15 backdrop-blur-sm",
    "bg-[#faf9f6]": "bg-transparent",
    "bg-gray-50": "bg-white/5 backdrop-blur-md",
    "bg-gray-50/50": "bg-white/5 backdrop-blur-md",
    "bg-gray-100": "bg-white/10 backdrop-blur-md",
    "bg-amber-50": "bg-amber-500/10 backdrop-blur-md",
    "bg-red-50": "bg-red-500/10 backdrop-blur-md",
    "bg-green-50": "bg-green-500/10 backdrop-blur-md",
    
    # Texts
    "text-coh-navy/40": "text-white/40",
    "text-coh-navy/50": "text-white/50",
    "text-coh-navy/55": "text-white/60",
    "text-coh-navy/60": "text-white/60",
    "text-coh-navy/70": "text-white/70",
    "text-coh-navy/80": "text-white/80",
    "text-coh-navy": "text-white",
    
    # Borders
    "border-coh-gold/10": "border-white/10",
    "border-coh-gold/15": "border-white/10",
    "border-coh-gold/20": "border-white/10",
    "border-coh-gold/25": "border-white/10",
    "border-coh-gold/30": "border-white/20",
    "border-gray-100": "border-white/10",
    "border-gray-200": "border-white/10",
    "border-gray-400": "border-white/20",
    "border-coh-navy/10": "border-white/10",
    
    # Shadows
    "shadow-sm": "shadow-[0_4px_30px_rgba(0,0,0,0.1)]",
}

for fp in file_paths:
    with open(fp, "r") as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    # Special fixes
    content = content.replace('bg-coh-gold text-white', 'bg-coh-gold text-coh-navy')
    
    with open(fp, "w") as f:
        f.write(content)

print(f"Applied dark theme tokens to {len(file_paths)} files.")
