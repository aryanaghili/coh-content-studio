import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Remove interface CoreDocument { ... }
content = re.sub(r'interface CoreDocument \{[\s\S]*?\n\}', '', content)

# 2. Add imports
if 'getCoreDocuments' not in content:
    content = content.replace("import { generateId", "import { getCoreDocuments } from './lib/coreDocumentsStorage';\nimport type { CoreDocument } from './lib/coreDocumentsStorage';\nimport { generateId")

# 3. Add operatingCoreDocs state
state_declaration = """
  const [operatingCore, setOperatingCore] = useState<OperatingCore>(() => {
"""
new_state = """
  const [operatingCoreDocs, setOperatingCoreDocs] = useState<CoreDocument[]>([]);
  
  useEffect(() => {
    const loadDocs = async () => {
      const docs = await getCoreDocuments();
      setOperatingCoreDocs(docs);
    };
    loadDocs();
  }, []);

  const [operatingCore, setOperatingCore] = useState<OperatingCore>(() => {
"""
if "const [operatingCoreDocs" not in content:
    content = content.replace(state_declaration, new_state)

# 4. Pass operatingCoreDocs to compileOperatingCoreContext
# There are several calls to compileOperatingCoreContext. Let's find them.
# The signature is compileOperatingCoreContext(operatingCore, {...})
# We want it to be compileOperatingCoreContext(operatingCore, {...}, operatingCoreDocs)
# We can do this carefully by replacing the known patterns:
content = content.replace(
    "operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Command Center' })",
    "operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Command Center' }, operatingCoreDocs)"
)
content = content.replace(
    "operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Ideation Workspace', audience: ideationFilterAudience })",
    "operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Ideation Workspace', audience: ideationFilterAudience }, operatingCoreDocs)"
)
content = content.replace(
    "operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Content Workspace', channel: contentFilterChannel })",
    "operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Content Workspace', channel: contentFilterChannel }, operatingCoreDocs)"
)
content = content.replace(
    "operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Revision Studio', action: revisionAction })",
    "operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Revision Studio', action: revisionAction }, operatingCoreDocs)"
)
content = content.replace(
    "operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Advanced Brief', audience: activeWorkItem.audience, channel: activeWorkItem.channel })",
    "operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Advanced Brief', audience: activeWorkItem.audience, channel: activeWorkItem.channel }, operatingCoreDocs)"
)
content = content.replace(
    "compileOperatingCoreContext(draftCore, previewCtx)",
    "compileOperatingCoreContext(draftCore, previewCtx, operatingCoreDocs)"
)

# 5. Reload trigger for OperatingCoreAdmin
trigger_func = """
  const reloadCoreDocs = async () => {
    const docs = await getCoreDocuments();
    setOperatingCoreDocs(docs);
  };
"""
if "reloadCoreDocs" not in content:
    content = content.replace("const handleSaveOperatingCore", trigger_func + "\n  const handleSaveOperatingCore")

    admin_mount_old = "<OperatingCoreAdmin \n          safeCore={operatingCore}\n          onSave={handleSaveOperatingCore}\n          onReset={handleResetOperatingCore}\n        />"
    admin_mount_new = "<OperatingCoreAdmin \n          safeCore={operatingCore}\n          onSave={(c) => { handleSaveOperatingCore(c); reloadCoreDocs(); }}\n          onReset={handleResetOperatingCore}\n        />"
    content = content.replace(admin_mount_old, admin_mount_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("App.tsx updated properly")
