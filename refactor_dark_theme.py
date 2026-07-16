import re

file_path = "src/App.tsx"

with open(file_path, "r") as f:
    content = f.read()

replacements = {
    # Backgrounds
    "bg-white": "bg-white/5 backdrop-blur-md",
    "bg-coh-cream": "bg-white/10 backdrop-blur-sm",
    "bg-coh-cream/45": "bg-white/5 backdrop-blur-sm",
    "bg-coh-cream-dark": "bg-white/15 backdrop-blur-sm",
    
    # Texts
    "text-coh-navy/40": "text-white/40",
    "text-coh-navy/50": "text-white/50",
    "text-coh-navy/55": "text-white/60",
    "text-coh-navy/60": "text-white/60",
    "text-coh-navy/70": "text-white/70",
    "text-coh-navy/80": "text-white/80",
    "text-coh-navy": "text-white",
    
    # Borders (we can keep some gold for accents, but tone down the default borders)
    "border-coh-gold/10": "border-white/10",
    "border-coh-gold/15": "border-white/10",
    "border-coh-gold/20": "border-white/10",
    "border-coh-gold/25": "border-white/10",
    "border-coh-gold/30": "border-white/20",
    
    # Shadows
    "shadow-sm": "shadow-[0_4px_30px_rgba(0,0,0,0.1)]",
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Special fixes
# Re-invert specific text colors where we need them dark (e.g. inside a gold button)
# The gold button has `bg-coh-gold` or `text-coh-gold`. If the background is gold, text should be navy.
content = content.replace('bg-coh-gold text-white', 'bg-coh-gold text-coh-navy')

with open(file_path, "w") as f:
    f.write(content)

print("Applied dark theme tokens to App.tsx")
