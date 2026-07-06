export interface CoreDocument {
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

// ⚠️ MOCK BACKEND STORAGE ABSTRACTION 
// Currently falls back to localStorage because the application does not have a true persistent 
// shared backend (e.g. Postgres, Firebase) configured yet. 
const STORAGE_KEY = 'coh-backend-mock-core-documents';

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getCoreDocuments(): Promise<CoreDocument[]> {
  await delay(300);
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse Core Documents from local storage:', e);
    return [];
  }
}

export async function addCoreDocument(doc: Omit<CoreDocument, 'id' | 'createdAt' | 'updatedAt' | 'appliedToOperatingCore'>): Promise<CoreDocument> {
  await delay(400);
  const current = await getCoreDocuments();
  const newDoc: CoreDocument = {
    ...doc,
    id: `cdoc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    appliedToOperatingCore: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newDoc, ...current]));
  return newDoc;
}

export async function updateCoreDocument(id: string, updates: Partial<CoreDocument>): Promise<CoreDocument> {
  await delay(300);
  const current = await getCoreDocuments();
  const idx = current.findIndex(d => d.id === id);
  if (idx === -1) throw new Error('Core document not found');
  
  const updatedDoc = {
    ...current[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  current[idx] = updatedDoc;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return updatedDoc;
}

export async function deleteCoreDocument(id: string): Promise<void> {
  await delay(300);
  const current = await getCoreDocuments();
  const filtered = current.filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export async function applyCoreDocumentToOperatingCore(id: string): Promise<CoreDocument> {
  // Sets the metadata flag so the compiler knows it should be evaluated
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
