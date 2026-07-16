import os

dirs_to_process = ["src", "src/components", "src/ui"]
file_paths = []

for d in dirs_to_process:
    if os.path.exists(d):
        for f in os.listdir(d):
            if f.endswith(".tsx") or f.endswith(".ts"):
                file_paths.append(os.path.join(d, f))

# Define explicit replacements
replacements = {
    # 1. Reverse the glass backgrounds back to clean white
    "bg-white/5 backdrop-blur-md/50": "bg-slate-50",
    "bg-white/5 backdrop-blur-md": "bg-white",
    "bg-white/10 backdrop-blur-lg": "bg-white",
    "bg-white/10 backdrop-blur-md": "bg-white",
    "bg-white/10 backdrop-blur-sm": "bg-white",
    "bg-white/15 backdrop-blur-sm": "bg-slate-50",
    "bg-black/20 backdrop-blur-sm": "bg-white",
    
    # 2. Update borders
    "border-white/10": "border-slate-100",
    "border-white/20": "border-slate-200",
    "border-white/30": "border-slate-200",
    
    # 3. Typography (remove serif, switch white to slate)
    "font-serif": "font-sans",
    "text-white/40": "text-slate-400",
    "text-white/50": "text-slate-500",
    "text-white/60": "text-slate-500",
    "text-white/70": "text-slate-600",
    "text-white/80": "text-slate-700",
    "text-white": "text-slate-800", # We will fix buttons later
    
    # 4. Modals and Backdrops
    "bg-black/40": "bg-slate-900/20",
    "bg-black/60": "bg-slate-900/40",
    
    # 5. Accent Colors (Gold -> Violet)
    "bg-coh-gold": "bg-violet-600",
    "text-coh-gold": "text-violet-600",
    "border-coh-gold/10": "border-violet-100",
    "border-coh-gold/20": "border-violet-200",
    "border-coh-gold/30": "border-violet-200",
    "border-coh-gold/40": "border-violet-300",
    "border-coh-gold": "border-violet-500",
    "from-coh-gold to-yellow-600": "from-violet-600 to-indigo-600",
    
    # 6. Secondary Accent (Navy -> Slate)
    "bg-coh-navy": "bg-slate-900",
    
    # 7. Radius and Shadows
    "rounded-lg": "rounded-2xl",
    "rounded-xl": "rounded-[20px]",
    "rounded-2xl": "rounded-3xl",
    "shadow-[0_4px_30px_rgba(0,0,0,0.1)]": "shadow-sm",
    "shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]": "shadow-2xl",
    "shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]": "shadow-xl"
}

for fp in file_paths:
    with open(fp, "r") as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    # Post-replacements (Fixing buttons where bg-violet-600 and text-slate-800 clash)
    content = content.replace("bg-violet-600 text-slate-800", "bg-violet-600 text-white")
    content = content.replace("bg-slate-900 text-slate-800", "bg-slate-900 text-white")
    content = content.replace("text-slate-800 font-bold bg-violet-600", "text-white font-bold bg-violet-600")
    
    # Let's also make sure primary buttons (like from-violet-600) have white text
    content = content.replace("from-violet-600 to-indigo-600 text-slate-800", "from-violet-600 to-indigo-600 text-white")
    
    with open(fp, "w") as f:
        f.write(content)

print(f"Applied Hyper-Modern Light theme to {len(file_paths)} files.")
