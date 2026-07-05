import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

new_source_type = """type SourceType = 
    | 'Event Notes'
    | 'Partner Profile'
    | 'Sponsor Notes'
    | 'Meeting Notes'
    | 'Campaign Notes'
    | 'Article / Media Coverage'
    | 'Website Reference'
    | 'Visual Reference'
    | 'Approved Example'
    | 'Pasted Notes'
    | 'Link / URL'
    | 'Other';

interface SourceFile {
  id: string;
  title: string;
  type: SourceType;
  status: 'Active' | 'Draft' | 'Archived';
  useCase?: string; // Designation
  shortContext?: string; // Notes
  content: string; // Extracted Text / Summary
  url?: string; // Link if relevant
  createdAt: string;
}

export interface CoreDocument {
  id: string;
  documentTitle: string;
  documentType: 'Business Model' | 'Strategic Plan' | 'Business Memo' | 'Master Deck' | 'Website Copy' | 'One-Pager' | 'Sponsorship Deck' | 'Partner Deck' | 'Approved Voice Example' | 'Approved Visual Example' | 'Other';
  status: 'Active' | 'Draft' | 'Archived';
  brainRole: string;
  supportsOperatingCoreSection: string;
  uploadFile?: string; 
  sourceUrl?: string; 
  fullText: string; 
  distilledKernelNotes?: string;
  extractedClaimEvidence?: string;
  extractedVoiceGuidance?: string;
  extractedVisualGuidance?: string;
  extractedRevisionGuidance?: string;
  lastReviewedDate?: string;
  appliedToOperatingCore: boolean;
}"""

content = re.sub(
    r'interface SourceFile \{.*?createdAt: string;\n\}',
    new_source_type,
    content,
    flags=re.DOTALL
)

# Remove Role, Supports Section, and "Use to update Operating Core" from App.tsx UI
content = re.sub(r'\{sourceLibraryFilter === \'Core Documents\'.*?\{/\* End Filters \*/\}', '{/* End Filters */}', content, flags=re.DOTALL)
content = re.sub(r'<option value="Core Documents">Core Documents</option>', '', content)

# The user wants Tone of Voice, Business Model, Strategic Plan logic completely removed from Source Library fields.
content = re.sub(r'<div className="mb-4 bg-coh-navy/5 p-4 rounded border border-coh-navy/10">\s*<h4 className="text-xs font-bold uppercase tracking-wider text-coh-navy/60 mb-3">Use to update Operating Core</h4>.*?</div>', '', content, flags=re.DOTALL)
content = re.sub(r'<div className="grid grid-cols-2 gap-4 mb-4">\s*<div>\s*<label className="block text-xs font-bold text-coh-navy/60 uppercase tracking-wider mb-2">Role.*?</select>\s*</div>\s*</div>', '', content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("App types and UI cleaned.")
