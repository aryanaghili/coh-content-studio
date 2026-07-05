import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_interface = """interface SourceFile {
  id: string;
  title: string;
  type: 
    | 'Tone of Voice'
    | 'Business Model'
    | 'Strategic Plan'
    | 'Business Memo'
    | 'Website Copy'
    | 'Deck'
    | 'Event Notes'
    | 'Partnership Notes'
    | 'Sponsorship Notes'
    | 'Approved Example'
    | 'Image / Visual Asset'
    | 'Article / Media Coverage'
    | 'Team Notes'
    | 'Link / URL'
    | 'PDF'
    | 'Audio'
    | 'Text'
    | 'Video'
    | 'Image'
    | 'Other';
  status: 'Active' | 'Archived' | 'Needs Review';
  role: 'Core Document' | 'Task Source' | 'Approved Example' | 'Partner Context' | 'Visual Reference' | 'Archive';
  supportsOperatingCoreSection: 'Core Passport' | 'Strategy Kernel' | 'Audiences' | 'Channels' | 'Claims' | 'Voice' | 'Visual' | 'Revision' | 'None';
  useFor: string;
  createdAt: string;
  notes: string;
  content: string;
  url?: string;
  selected?: boolean;
  selectable?: boolean;
}"""

new_interface = """export interface CoreDocument {
  id: string;
  title: string;
  type: 
    | 'Business Model'
    | 'Strategic Plan'
    | 'Business Memo'
    | 'Master Deck'
    | 'Website Copy'
    | 'One-Pager'
    | 'Sponsorship Deck'
    | 'Partner Deck'
    | 'Approved Voice Example'
    | 'Approved Visual Example'
    | 'Other';
  status: 'Active' | 'Archived' | 'Needs Review';
  role: string;
  supportsOperatingCoreSection: string;
  createdAt: string;
  url?: string;
  content: string;
  extractedClaims?: string;
  extractedVoice?: string;
  extractedVisual?: string;
  extractedRevision?: string;
  lastReviewedDate?: string;
  appliedToOperatingCore: boolean;
}

export interface SourceFile {
  id: string;
  title: string;
  type: 
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
  status: 'Active' | 'Archived' | 'Needs Review';
  useFor: string;
  createdAt: string;
  notes: string;
  content: string;
  url?: string;
  selected?: boolean;
  selectable?: boolean;
}"""

if old_interface in content:
    content = content.replace(old_interface, new_interface)
    with open('src/App.tsx', 'w') as f:
        f.write(content)
    print("Interfaces updated successfully")
else:
    print("Old interface not found!")
