import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

ai_replace = """        setActiveDraftHistory([{
          version: 1,
          text: rawA,
          timestamp: new Date().toLocaleTimeString(),
          actionUsed: `AI Generated (${aiProvider}/${aiTextModel})`
        }]);
        setImportedIdeationContext(null);

        // Attach to Active Work Item
        setActiveWorkItem(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            status: qcIssues.length > 0 ? 'Needs Source Check' : 'Draft',
            draftVersions: [{ id: `draft-${Date.now()}`, text: rawA, createdAt: new Date().toISOString() }, ...prev.draftVersions],
            visualDirection: visualBrief,
            updatedAt: new Date().toISOString()
          };
        });"""

proto_replace = """      setActiveDraftHistory([{
        version: 1,
        text: rawA,
        timestamp: new Date().toLocaleTimeString(),
        actionUsed: 'Prototype generation (AI not connected)'
      }]);

      // Attach to Active Work Item
      setActiveWorkItem(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: getFictionalContentWarnings(rawA).length > 0 ? 'Needs Source Check' : 'Draft',
          draftVersions: [{ id: `draft-${Date.now()}`, text: rawA, createdAt: new Date().toISOString() }, ...prev.draftVersions],
          visualDirection: visualPrompt,
          updatedAt: new Date().toISOString()
        };
      });"""

content = content.replace("""        setActiveDraftHistory([{
          version: 1,
          text: rawA,
          timestamp: new Date().toLocaleTimeString(),
          actionUsed: `AI Generated (${aiProvider}/${aiTextModel})`
        }]);
        setImportedIdeationContext(null);""", ai_replace, 1)

content = content.replace("""      setActiveDraftHistory([{
        version: 1,
        text: rawA,
        timestamp: new Date().toLocaleTimeString(),
        actionUsed: 'Prototype generation (AI not connected)'
      }]);""", proto_replace, 1)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Step 4: Active work item attached on generate.")
