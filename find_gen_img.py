with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'const handleGenerateImage =' in line:
        print(f"Found handleGenerateImage at line {i+1}")
        break
