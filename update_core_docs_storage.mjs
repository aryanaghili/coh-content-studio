import fs from 'fs';

const content = `export interface CoreDocument {
  id: string;
  title: string;
  documentType: string;
  status: string;
  brainArea: string;
  brainRole: string;
  shortContext: string;
  sourceUrl?: string;
  fileReference?: string;
  rawText: string;
  extractedText?: string;
  distilledKernelNotes?: string;
  extractedClaimEvidence?: string;
  extractedVoiceGuidance?: string;
  extractedVisualGuidance?: string;
  extractedRevisionGuidance?: string;
  appliedToOperatingCore: boolean;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastReviewedAt?: string;
}

const STORAGE_KEY = 'coh-backend-mock-core-documents';

// Helper to simulate network latency for local
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function isDbConfigured() {
  try {
     const res = await fetch('/api/operating-core');
     return res.ok;
  } catch(e) { return false; }
}

export async function getCoreDocuments(): Promise<CoreDocument[]> {
  try {
    const res = await fetch('/api/operating-core/documents');
    if (res.ok) {
       return await res.json();
    }
  } catch(e) {}
  
  // Fallback
  await delay(300);
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export async function addCoreDocument(doc: Omit<CoreDocument, 'id' | 'createdAt' | 'updatedAt' | 'appliedToOperatingCore'>): Promise<CoreDocument> {
  const newDoc: CoreDocument = {
    ...doc,
    id: \`cdoc-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
    appliedToOperatingCore: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch('/api/operating-core/documents', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(newDoc)
    });
    if (res.ok) {
       const { id } = await res.json();
       newDoc.id = id;
       return newDoc;
    }
  } catch(e) {}

  // Fallback
  await delay(400);
  const current = await getCoreDocuments();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newDoc, ...current]));
  return newDoc;
}

export async function updateCoreDocument(id: string, updates: Partial<CoreDocument>): Promise<CoreDocument> {
  let fallbackNeeded = false;
  try {
     const res = await fetch(\`/api/operating-core/documents/\${id}\`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updates)
     });
     if (!res.ok) fallbackNeeded = true;
  } catch(e) { fallbackNeeded = true; }

  const current = await getCoreDocuments();
  const idx = current.findIndex(d => d.id === id);
  if (idx === -1) throw new Error('Core document not found');
  
  const updatedDoc = {
    ...current[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  if (fallbackNeeded) {
    await delay(300);
    current[idx] = updatedDoc;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
  return updatedDoc;
}

export async function deleteCoreDocument(id: string): Promise<void> {
  let fallbackNeeded = false;
  try {
     const res = await fetch(\`/api/operating-core/documents/\${id}\`, { method: 'DELETE' });
     if (!res.ok) fallbackNeeded = true;
  } catch(e) { fallbackNeeded = true; }

  if (fallbackNeeded) {
    await delay(300);
    const current = await getCoreDocuments();
    const filtered = current.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
}

export async function applyCoreDocumentToOperatingCore(id: string): Promise<CoreDocument> {
  return updateCoreDocument(id, {
    appliedToOperatingCore: true,
    appliedAt: new Date().toISOString(),
    lastReviewedAt: new Date().toISOString()
  });
}

export async function unapplyCoreDocumentFromOperatingCore(id: string): Promise<CoreDocument> {
  return updateCoreDocument(id, {
    appliedToOperatingCore: false,
    appliedAt: undefined
  });
}
`;

fs.writeFileSync('src/lib/coreDocumentsStorage.ts', content, 'utf8');
