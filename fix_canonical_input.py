import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add taskSources to canonicalInput in handleGenerateDrafts
injection = """          operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { 
            workspace: isSimple ? 'Simple Mode' : isQuick ? 'Quick Create' : 'Advanced Brief', 
            channel, 
            audience, 
            format 
          }),
          taskSources: (creationMode === 'advanced' ? advancedBrief.selectedSourceIds : []).map(id => {
            const s = sourceLibrary.find(x => x.id === id);
            return s ? { title: s.title, type: s.type, content: s.content || s.notes || s.url } : null;
          }).filter(Boolean)
        };"""

content = content.replace("""          operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { 
            workspace: isSimple ? 'Simple Mode' : isQuick ? 'Quick Create' : 'Advanced Brief', 
            channel, 
            audience, 
            format 
          })
        };""", injection)

# Update suggested examples text
content = content.replace("Suggested Core Sources, not uploaded yet.", "Suggested Core Documents, not uploaded yet.")
content = content.replace("Suggested examples:", "Suggested examples:")
content = content.replace("COH Master Deck", "COH Phase 1 Strategic Plan\\n- COH Master Deck") # Ensure Strategic Plan is in the list if not

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Fixed canonical input to include taskSources.")
