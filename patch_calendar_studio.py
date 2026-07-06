import os

file_path = "src/components/EditorialCalendarStudio.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Make the outer layout stack
content = content.replace(
    '<div className="grid grid-cols-12 gap-6 items-start h-full">',
    '<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">'
)
content = content.replace(
    '<div className="col-span-8 flex flex-col h-full bg-white border border-coh-gold/20 rounded shadow-sm">',
    '<div className="col-span-1 lg:col-span-8 flex flex-col h-full bg-white border border-coh-gold/20 rounded shadow-sm">'
)
content = content.replace(
    '<div className="col-span-4 space-y-6 overflow-y-auto pr-2 pb-6 max-h-full">',
    '<div className="col-span-1 lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 pb-6 lg:max-h-full">'
)

with open(file_path, "w") as f:
    f.write(content)

print("Patched EditorialCalendarStudio.tsx")
