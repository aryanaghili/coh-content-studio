import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Replace massive warning banners if possible, or just the text inside them
content = content.replace("API / Model Setup Issue", "AI generation needs setup")
content = content.replace("COH Brain", "Content Rules active")
content = content.replace("Fact Boundary Violation", "Source check recommended")
content = content.replace("Ready to compile", "Ready to generate")
content = content.replace("Workspace Summary", "Overview")
content = content.replace("Prototype mode", "Needs review")

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Warnings updated.")
