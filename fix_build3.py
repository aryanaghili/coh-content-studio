with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('format: activeWorkItem.outputFormat || "Post",\n', '')

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Build issues fixed.")
