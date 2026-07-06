import os

file_path = "src/components/OperatingCoreAdmin.tsx"
with open(file_path, "r") as f:
    content = f.read()

# OperatingCoreAdmin Layout
content = content.replace(
    '<div className="flex h-full bg-coh-cream">',
    '<div className="flex flex-col md:flex-row h-full bg-coh-cream">'
)

# Sidebar
content = content.replace(
    '<div className="w-64 border-r border-coh-gold/30 bg-white flex flex-col shrink-0">',
    '<div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-coh-gold/30 bg-white flex flex-col shrink-0">'
)
content = content.replace(
    '<div className="flex-1 overflow-y-auto py-4">',
    '<div className="md:flex-1 overflow-x-auto md:overflow-x-visible md:overflow-y-auto flex md:block py-2 md:py-4 px-2 md:px-0">'
)
content = content.replace(
    'className={`w-full flex items-center',
    'className={`w-full shrink-0 md:shrink flex items-center'
)

# Textareas 
content = content.replace(
    'rows={3}',
    'rows={4} className="min-h-[44px]"'
)

with open(file_path, "w") as f:
    f.write(content)

print("Patched OperatingCoreAdmin.tsx")
