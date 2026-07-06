import os

file_path = "src/components/RevisionStudio.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Make the outer layout stack
content = content.replace(
    '<div className="flex flex-col md:flex-row gap-6">',
    '<div className="flex flex-col lg:flex-row gap-6">'
)
content = content.replace(
    '<div className="flex-1 space-y-4 max-w-3xl">',
    '<div className="flex-1 space-y-4 lg:max-w-3xl w-full">'
)
content = content.replace(
    '<div className="w-80 shrink-0 space-y-4">',
    '<div className="w-full lg:w-80 shrink-0 space-y-4">'
)

# Textareas touch friendly
content = content.replace(
    'className="w-full h-full min-h-[300px]',
    'className="w-full h-full min-h-[250px] md:min-h-[300px]'
)

with open(file_path, "w") as f:
    f.write(content)

print("Patched RevisionStudio.tsx")
