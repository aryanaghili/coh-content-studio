import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

state_additions = """  const [savedSources, setSavedSources] = useState<SourceFile[]>([]);
  const [operatingCoreDocuments, setOperatingCoreDocuments] = useState<CoreDocument[]>([]);
  const [isSuperadminUnlocked, setIsSuperadminUnlocked] = useState<boolean>(false);
  const [superadminInput, setSuperadminInput] = useState<string>('');"""

content = content.replace("  const [savedSources, setSavedSources] = useState<SourceFile[]>([]);", state_additions)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Step 1 state added.")
