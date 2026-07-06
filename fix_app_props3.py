import os

app_file = "src/App.tsx"
with open(app_file, "r") as f:
    content = f.read()

bad_prop = "generationMode={generationMode}"
good_prop = "generationMode={generationMode}\n            aiService={aiService}"
content = content.replace(bad_prop, good_prop)

with open(app_file, "w") as f:
    f.write(content)
