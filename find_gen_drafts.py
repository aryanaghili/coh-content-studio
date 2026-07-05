with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'const handleGenerateDrafts =' in line:
        print(f"Found handleGenerateDrafts at line {i+1}")
        break
