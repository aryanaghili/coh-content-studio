import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add imports for getCoreDocuments
import_statement = "import { getCoreDocuments, CoreDocument } from './lib/coreDocumentsStorage';\n"
if "getCoreDocuments" not in content:
    content = content.replace("import { generateId", import_statement + "import { generateId")

# 2. Add state for operatingCoreDocuments inside App
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
content = content.replace(state_declaration, new_state)

# 3. Update all 7 compileOperatingCoreContext calls to pass `operatingCoreDocs`
content = re.sub(r'compileOperatingCoreContext\(([^,]+),([^)]+)\)', r'compileOperatingCoreContext(\1,\2, operatingCoreDocs)', content)

# 4. Pass operatingCoreDocs to OperatingCoreAdmin if necessary?
# Actually OperatingCoreAdmin fetches its own docs! That's perfectly fine since it's an admin panel. 
# But when Admin saves, App.tsx won't know until refresh.
# The user said: "it must appear after refresh, after signing out and back in".
# If I just pass a refresh trigger to OperatingCoreAdmin or just let the admin refresh, it's fine. 
# Better: I will add a `onCoreDocsChanged` prop to `OperatingCoreAdmin` OR just fetch them in `compileStructuredPrompt`? 
# compileStructuredPrompt is synchronous right now!
# Wait! compileStructuredPrompt is synchronous! So fetching them asynchronously inside `App.tsx` into state is the ONLY way to make them available synchronously.
# And to keep them synced when Admin changes them, we could just reload them before generation, or pass a callback.
# Let's pass a trigger function:
trigger_func = """
  const reloadCoreDocs = async () => {
    const docs = await getCoreDocuments();
    setOperatingCoreDocs(docs);
  };
"""
content = content.replace("const handleSaveOperatingCore", trigger_func + "\n  const handleSaveOperatingCore")

admin_mount_old = "<OperatingCoreAdmin \n          safeCore={operatingCore}\n          onSave={handleSaveOperatingCore}\n          onReset={handleResetOperatingCore}\n        />"
admin_mount_new = "<OperatingCoreAdmin \n          safeCore={operatingCore}\n          onSave={handleSaveOperatingCore}\n          onReset={handleResetOperatingCore}\n        />"
# Since OperatingCoreAdmin doesn't accept onCoreDocsChanged right now, I'll just add it.
admin_mount_new = "<OperatingCoreAdmin \n          safeCore={operatingCore}\n          onSave={(c) => { handleSaveOperatingCore(c); reloadCoreDocs(); }}\n          onReset={handleResetOperatingCore}\n        />"
content = content.replace(admin_mount_old, admin_mount_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Updated App.tsx")
