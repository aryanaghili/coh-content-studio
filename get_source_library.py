with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

start = -1
end = -1
for i, line in enumerate(lines):
    if "{activeTab === 'source-library' && (" in line:
        start = i
    if start != -1 and "{/* --- TAB 7: SETTINGS --- */}" in line:
        end = i - 1
        break

if start != -1 and end != -1:
    with open('source_library_original.txt', 'w') as f:
        f.writelines(lines[start:end+1])
    print("Extracted Source Library")
else:
    print("Not found")
