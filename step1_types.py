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

interface SourceFile {
"""

if "interface WorkItem {" not in content:
    content = content.replace("interface SourceFile {", work_item_interface, 1)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Step 1a: Interfaces injected.")
