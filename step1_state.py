with open('src/App.tsx', 'r') as f:
    content = f.read()

state_code = """
  // --- WORK ITEM STATE ---
  const [activeWorkItem, setActiveWorkItem] = useState<WorkItem | null>(() => {
    const local = localStorage.getItem('coh_active_work_item_v1');
    if (local) {
      try {
        return JSON.parse(local) as WorkItem;
      } catch (e) {
        console.error("Failed to parse active work item", e);
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (activeWorkItem) {
      localStorage.setItem('coh_active_work_item_v1', JSON.stringify(activeWorkItem));
    } else {
      localStorage.removeItem('coh_active_work_item_v1');
    }
  }, [activeWorkItem]);

  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>(() => {
"""

if "const [activeWorkItem, setActiveWorkItem] = useState" not in content:
    content = content.replace("  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>(() => {", state_code, 1)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Step 1b: State injected.")
