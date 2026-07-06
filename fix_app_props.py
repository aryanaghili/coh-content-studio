import os

app_file = "src/App.tsx"
with open(app_file, "r") as f:
    content = f.read()

# Fix setSourceLibrary -> handleAddToLibrary
bad_prop = "onSaveToLibrary={(item) => {\n              setSourceLibrary(prev => [item, ...prev]);\n            }}"
good_prop = "onSaveToLibrary={handleAddToLibrary}"
content = content.replace(bad_prop, good_prop)

with open(app_file, "w") as f:
    f.write(content)
