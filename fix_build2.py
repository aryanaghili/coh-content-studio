with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("visualAssets: activeWorkItem.imageResults,", "visualAssets: activeWorkItem.imageResults as any,")

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Build issues fixed.")
