with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "role: SourceFile['role']" in line:
        continue
    if "supportsOperatingCoreSection: SourceFile" in line:
        continue
    if "useFor: string" in line and "SourceFile" not in line and "newSource" not in line: # wait, useFor is just a string, but let's just wipe it from newSource type definition
        if "useFor" in line:
            continue
    # We also have an error at 1379: type: 'Tone of Voice'
    if "type: 'Tone of Voice' as SourceFile['type']" in line:
        line = line.replace("'Tone of Voice'", "'Other'")
    
    new_lines.append(line)

with open('src/App.tsx', 'w') as f:
    f.writelines(new_lines)
print("Local type definitions cleaned.")
