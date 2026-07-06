import os

app_file = "src/App.tsx"
with open(app_file, "r") as f:
    content = f.read()

# Fix handleAddToLibrary -> setSavedContent
bad_prop = "onSaveToLibrary={handleAddToLibrary}"
good_prop = "onSaveToLibrary={(item) => setSavedContent(prev => [item, ...prev])}"
content = content.replace(bad_prop, good_prop)

with open(app_file, "w") as f:
    f.write(content)
