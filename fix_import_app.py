import os

filepath = "src/App.tsx"
with open(filepath, "r") as f:
    content = f.read()

if "import { LANGUAGES" not in content:
    content = "import { LANGUAGES, getLanguageDirection } from './lib/languages';\n" + content
    
    with open(filepath, "w") as f:
        f.write(content)

print("Added import to App.tsx")
