with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

start = -1
end = -1
for i, line in enumerate(lines):
    if "{activeTab === 'revision-studio' && (" in line:
        start = i
    if start != -1 and "{/* --- TAB 5: IDEA LIBRARY --- */}" in line:
        end = i - 1
        break

if start != -1 and end != -1:
    with open('revision_studio_original.txt', 'w') as f:
        f.writelines(lines[start:end+1])
    print("Extracted Revision Studio")
else:
    print("Not found")
