with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

start = -1
end = -1
for i, line in enumerate(lines):
    if "{activeTab === 'command-center' && (" in line:
        start = i
    if start != -1 and "{/* --- TAB 2: CONTENT WORKSPACE --- */}" in line:
        end = i - 1
        break

if start != -1 and end != -1:
    with open('command_center_original.txt', 'w') as f:
        f.writelines(lines[start:end+1])
    print("Extracted Command Center")
else:
    print("Not found")
