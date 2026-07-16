import os

file_path = "src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace("text-text-on-dark", "text-white")
content = content.replace("Editorial Calendar Studio", "Editorial Calendar")

with open(file_path, "w") as f:
    f.write(content)

print("Updated App.tsx successfully.")
