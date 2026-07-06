import os
import re

file_path = "src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Ideation Workspace
content = content.replace(
    '<div className="grid grid-cols-12 gap-8 items-start">',
    '<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">'
)
content = content.replace(
    'className="col-span-4 bg-white border border-coh-gold/20 p-5 rounded shadow-sm space-y-4 text-xs"',
    'className="col-span-1 lg:col-span-4 bg-white border border-coh-gold/20 p-4 lg:p-5 rounded shadow-sm space-y-4 text-xs"'
)
content = content.replace(
    '<div className="col-span-8 space-y-6">',
    '<div className="col-span-1 lg:col-span-8 space-y-6">'
)

# Visual Studio
content = content.replace(
    '<div className="grid grid-cols-12 gap-8">',
    '<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">'
)
content = content.replace(
    '<div className="col-span-4 space-y-6">',
    '<div className="col-span-1 lg:col-span-4 space-y-6">'
)
content = content.replace(
    '<div className="col-span-8">',
    '<div className="col-span-1 lg:col-span-8">'
)

# Make visual studio images fit properly
content = content.replace(
    'className="w-full h-auto rounded shadow-sm object-cover"',
    'className="w-full h-auto rounded shadow-sm object-contain max-h-[80vh]"'
)

# Make textareas min-h on mobile
content = re.sub(
    r'className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy font-mono text-\[11px\]"',
    r'className="w-full min-h-[44px] bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy font-mono text-[11px] md:text-sm"',
    content
)

with open(file_path, "w") as f:
    f.write(content)

print("Patched grids in App.tsx")
