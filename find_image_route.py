with open('server.js', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '/api/ai/generate-image' in line:
        print(f"Found /api/ai/generate-image at line {i+1}")
        break
