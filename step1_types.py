import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add CoreDocument interface after SourceFile
core_doc_type = """interface CoreDocument {
  id: string;
  title: string;
  type: string;
  status: 'Draft' | 'Active' | 'Archived' | 'Needs Review';
  brainArea: string;
  brainRole: string;
  notes: string;
  content: string;
  distilledKernelNotes: string;
  extractedClaimEvidence: string;
  extractedVoiceGuidance: string;
  extractedVisualGuidance: string;
  extractedRevisionGuidance: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  appliedToCore: boolean;
}

"""

if "interface CoreDocument" not in content:
    content = content.replace('interface SourceFile {', core_doc_type + 'interface SourceFile {')

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Step 1 types added.")
