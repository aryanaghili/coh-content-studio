with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("Fact Boundary Violation", "Source Check Recommended")

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Step 10 applied.")
