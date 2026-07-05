import re

with open('src/lib/operatingCore.ts', 'r') as f:
    content = f.read()

# Replace all literal backslash-n pairs in string literals with a standard newline character.
# This means taking '\\n' and changing it to '\n'
content = content.replace(r'\\n', r'\n')

with open('src/lib/operatingCore.ts', 'w') as f:
    f.write(content)

print("Updated operatingCore.ts")

with open('src/App.tsx', 'r') as f:
    app_content = f.read()

# Add localStorage migration
# Find: const savedCore = localStorage.getItem('coh_operating_core_v1');
migration_logic = """
    let savedCore = localStorage.getItem('coh_operating_core_v1');
    if (savedCore) {
      if (savedCore.includes('\\\\n')) {
        savedCore = savedCore.replace(/\\\\n/g, '\\n');
        localStorage.setItem('coh_operating_core_v1', savedCore);
      }
      setOperatingCore(JSON.parse(savedCore));
    } else {
"""

app_content = app_content.replace(
"""    const savedCore = localStorage.getItem('coh_operating_core_v1');
    if (savedCore) {
      setOperatingCore(JSON.parse(savedCore));
    } else {""", migration_logic)

# Replace "Knowledge Library" with "Source Library"
app_content = app_content.replace('Knowledge Library', 'Source Library')
app_content = app_content.replace('knowledge-library', 'source-library')
app_content = app_content.replace('knowledgeLibrary', 'sourceLibrary')
app_content = app_content.replace('KnowledgeLibrary', 'SourceLibrary')

# Handle Core Documents terminology
app_content = app_content.replace('Core Sources', 'Core Documents')
app_content = app_content.replace('Foundational Source', 'Core Document')

with open('src/App.tsx', 'w') as f:
    f.write(app_content)

print("Updated App.tsx")
