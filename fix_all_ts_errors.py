import re

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "role:" in line and "SourceFile" not in line and "CoreDocument" not in line:
        if "'Core Document'" in line or "'Task Source'" in line or "'Approved Example'" in line or "'Partner Context'" in line or "'Visual Reference'" in line or "'Archive'" in line:
            continue # skip this line
    if "supportsOperatingCoreSection:" in line:
        continue
    if "useFor:" in line:
        continue
    # fix Business Memo / Deck string literals in Suggested Core Documents that still cause TS errors
    if "type: 'Business Memo' | 'Deck'" in line or "type: 'Business Memo'" in line or "type: 'Deck'" in line:
        # carefully replace them
        if "type: 'Business Memo'" in line and "SourceFile" not in line and "CoreDocument" not in line:
            line = line.replace("'Business Memo'", "'Other'")
        if "type: 'Deck'" in line and "SourceFile" not in line and "CoreDocument" not in line:
            line = line.replace("'Deck'", "'Other'")
    
    new_lines.append(line)

with open('src/App.tsx', 'w') as f:
    f.writelines(new_lines)
print("TS errors cleaned line by line.")
