import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

work_item_interface = """
// --- WORK ITEM EXPERIENCE LAYER ---
export type WorkItemStatus = 'Idea' | 'Brief' | 'Draft' | 'Needs Revision' | 'Needs Source Check' | 'Visual Direction Ready' | 'Image Generated' | 'Approved' | 'Saved';

export interface WorkItemDraft {
  id: string;
  text: string;
  createdAt: string;
}

export interface WorkItemRevision {
  id: string;
  originalDraftId: string;
  revisedText: string;
  createdAt: string;
  notes?: string;
}

export interface WorkItemImage {
  id: string;
  url: string;
  createdAt: string;
  prompt: string;
}

export interface WorkItem {
  id: string;
  title: string;
  type?: string;
  channel?: string;
  outputFormat?: string;
  audience?: string;
  purpose?: string;
  language?: string;
  status: WorkItemStatus;
  
  sourceContext?: string;
  sourceTitle?: string;
  sourceType?: string;
  
  draftVersions: WorkItemDraft[];
  selectedDraftId?: string;
  
  visualDirection?: string;
  imageResults: WorkItemImage[];
  
  revisionHistory: WorkItemRevision[];
  
  approved: boolean;
  saved: boolean;
  
  createdAt: string;
  updatedAt: string;
  origin?: string;
}
"""

# Insert interface near top
if "interface WorkItem {" not in content:
    content = re.sub(
        r'(interface SourceFile \{)',
        work_item_interface + r'\n\1',
        content,
        count=1
    )

# Add activeWorkItem state
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
"""

if "const [activeWorkItem, setActiveWorkItem] = useState" not in content:
    content = re.sub(
        r'(const \[savedIdeas, setSavedIdeas\] = useState.*?\n  \}, \[savedIdeas\]\);)',
        r'\1\n' + state_code,
        content,
        flags=re.DOTALL,
        count=1
    )

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Step 1: WorkItem interface and state added.")
