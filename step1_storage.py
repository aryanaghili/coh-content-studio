import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

load_additions = """    const storedCoreDocs = localStorage.getItem('coh_core_docs_v1');
    if (storedCoreDocs) setOperatingCoreDocuments(JSON.parse(storedCoreDocs));"""

content = content.replace("const storedSources = localStorage.getItem('coh_sources_v1');", load_additions + "\n    const storedSources = localStorage.getItem('coh_sources_v1');")

save_additions = """  useEffect(() => {
    localStorage.setItem('coh_core_docs_v1', JSON.stringify(operatingCoreDocuments));
  }, [operatingCoreDocuments]);"""

content = content.replace("  useEffect(() => {\n    localStorage.setItem('coh_sources_v1', JSON.stringify(savedSources));\n  }, [savedSources]);", "  useEffect(() => {\n    localStorage.setItem('coh_sources_v1', JSON.stringify(savedSources));\n  }, [savedSources]);\n\n" + save_additions)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Step 1 storage added.")
