with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

start = -1
end = -1
for i, line in enumerate(lines):
    if "{activeTab === 'content-workspace' && (" in line:
        start = i
    if start != -1 and "          <div className=\"flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]\">" in line:
        end = i - 1
        break

if start != -1 and end != -1:
    with open('content_workspace_original.txt', 'w') as f:
        f.writelines(lines[start:end+1])
    print("Extracted Content Workspace Header")
else:
    print("Not found")
