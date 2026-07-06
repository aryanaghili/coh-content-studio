import express from 'express';
import { sql } from '@vercel/postgres';
import { put, del } from '@vercel/blob';

const router = express.Router();

// Helper to check if DB is configured
const isDbConfigured = () => {
  return !!process.env.POSTGRES_URL;
};

// Error handler for unconfigured DB
const handleUnconfiguredDb = (res) => {
  return res.status(503).json({ error: 'Persistent storage not configured.' });
};

// Initialize tables if they don't exist
async function initDb() {
  if (!isDbConfigured()) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS operating_core (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS core_documents (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        "documentType" VARCHAR(100),
        status VARCHAR(100),
        "brainArea" VARCHAR(100),
        "brainRole" VARCHAR(100),
        "shortContext" TEXT,
        "sourceUrl" TEXT,
        "fileReference" TEXT,
        "rawText" TEXT,
        "extractedText" TEXT,
        "distilledKernelNotes" TEXT,
        "extractedClaimEvidence" TEXT,
        "extractedVoiceGuidance" TEXT,
        "extractedVisualGuidance" TEXT,
        "extractedRevisionGuidance" TEXT,
        "appliedToOperatingCore" BOOLEAN DEFAULT FALSE,
        "appliedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        "createdBy" VARCHAR(255),
        "lastReviewedAt" TIMESTAMP
      );
    `;
    console.log('Operating Core DB initialized.');
  } catch (err) {
    console.error('Failed to initialize Operating Core DB:', err);
  }
}

initDb();

// GET /api/operating-core
router.get('/', async (req, res) => {
  if (!isDbConfigured()) return handleUnconfiguredDb(res);
  try {
    const { rows } = await sql`SELECT key, value FROM operating_core`;
    const coreData = {};
    rows.forEach(r => {
      coreData[r.key] = r.value;
    });
    res.json(coreData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Operating Core' });
  }
});

// PUT /api/operating-core
router.put('/', async (req, res) => {
  if (!isDbConfigured()) return handleUnconfiguredDb(res);
  try {
    const data = req.body;
    for (const [key, value] of Object.entries(data)) {
      await sql`
        INSERT INTO operating_core (key, value) 
        VALUES (${key}, ${value}) 
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update Operating Core' });
  }
});

// GET /api/operating-core/documents
router.get('/documents', async (req, res) => {
  if (!isDbConfigured()) return handleUnconfiguredDb(res);
  try {
    const { rows } = await sql`SELECT * FROM core_documents ORDER BY "createdAt" DESC`;
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch Core Documents' });
  }
});

// POST /api/operating-core/documents
router.post('/documents', async (req, res) => {
  if (!isDbConfigured()) return handleUnconfiguredDb(res);
  try {
    const doc = req.body;
    
    // In a real app, you might upload a file here. We'll handle file uploads via a separate blob endpoint if needed,
    // or expect the frontend to pass the blob URL in \`fileReference\`.

    const id = doc.id || \`doc_\${Date.now()}\`;
    
    await sql`
      INSERT INTO core_documents (
        id, title, "documentType", status, "brainArea", "brainRole", "shortContext", "sourceUrl", "fileReference",
        "rawText", "extractedText", "distilledKernelNotes", "extractedClaimEvidence", "extractedVoiceGuidance",
        "extractedVisualGuidance", "extractedRevisionGuidance", "appliedToOperatingCore", "appliedAt", "createdBy", "lastReviewedAt"
      ) VALUES (
        ${id}, ${doc.title || 'Untitled'}, ${doc.documentType || null}, ${doc.status || 'Draft'}, ${doc.brainArea || null},
        ${doc.brainRole || null}, ${doc.shortContext || null}, ${doc.sourceUrl || null}, ${doc.fileReference || null},
        ${doc.rawText || null}, ${doc.extractedText || null}, ${doc.distilledKernelNotes || null}, ${doc.extractedClaimEvidence || null},
        ${doc.extractedVoiceGuidance || null}, ${doc.extractedVisualGuidance || null}, ${doc.extractedRevisionGuidance || null},
        ${doc.appliedToOperatingCore || false}, ${doc.appliedAt ? new Date(doc.appliedAt) : null}, ${doc.createdBy || null}, ${doc.lastReviewedAt ? new Date(doc.lastReviewedAt) : null}
      )
    `;
    res.json({ success: true, id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create Core Document' });
  }
});

// PUT /api/operating-core/documents/:id
router.put('/documents/:id', async (req, res) => {
  if (!isDbConfigured()) return handleUnconfiguredDb(res);
  try {
    const { id } = req.params;
    const doc = req.body;

    await sql`
      UPDATE core_documents SET
        title = COALESCE(${doc.title}, title),
        "documentType" = COALESCE(${doc.documentType}, "documentType"),
        status = COALESCE(${doc.status}, status),
        "brainArea" = COALESCE(${doc.brainArea}, "brainArea"),
        "brainRole" = COALESCE(${doc.brainRole}, "brainRole"),
        "shortContext" = COALESCE(${doc.shortContext}, "shortContext"),
        "sourceUrl" = COALESCE(${doc.sourceUrl}, "sourceUrl"),
        "fileReference" = COALESCE(${doc.fileReference}, "fileReference"),
        "rawText" = COALESCE(${doc.rawText}, "rawText"),
        "extractedText" = COALESCE(${doc.extractedText}, "extractedText"),
        "distilledKernelNotes" = COALESCE(${doc.distilledKernelNotes}, "distilledKernelNotes"),
        "extractedClaimEvidence" = COALESCE(${doc.extractedClaimEvidence}, "extractedClaimEvidence"),
        "extractedVoiceGuidance" = COALESCE(${doc.extractedVoiceGuidance}, "extractedVoiceGuidance"),
        "extractedVisualGuidance" = COALESCE(${doc.extractedVisualGuidance}, "extractedVisualGuidance"),
        "extractedRevisionGuidance" = COALESCE(${doc.extractedRevisionGuidance}, "extractedRevisionGuidance"),
        "appliedToOperatingCore" = COALESCE(${doc.appliedToOperatingCore}, "appliedToOperatingCore"),
        "appliedAt" = COALESCE(${doc.appliedAt ? new Date(doc.appliedAt) : null}, "appliedAt"),
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update Core Document' });
  }
});

// DELETE /api/operating-core/documents/:id
router.delete('/documents/:id', async (req, res) => {
  if (!isDbConfigured()) return handleUnconfiguredDb(res);
  try {
    const { id } = req.params;
    // Check if there is a fileReference to delete from Vercel Blob
    const { rows } = await sql`SELECT "fileReference" FROM core_documents WHERE id = ${id}`;
    if (rows.length > 0 && rows[0].fileReference && rows[0].fileReference.startsWith('https://')) {
       // Attempt to delete blob
       try {
         await del(rows[0].fileReference);
       } catch(e) {
         console.warn('Failed to delete blob:', e);
       }
    }

    await sql`DELETE FROM core_documents WHERE id = ${id}`;
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete Core Document' });
  }
});

// POST /api/operating-core/documents/:id/apply
router.post('/documents/:id/apply', async (req, res) => {
  if (!isDbConfigured()) return handleUnconfiguredDb(res);
  try {
    const { id } = req.params;
    // Mark the document as applied
    await sql`
      UPDATE core_documents 
      SET "appliedToOperatingCore" = TRUE, "appliedAt" = NOW(), "updatedAt" = NOW()
      WHERE id = ${id}
    `;
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to apply Core Document' });
  }
});

// Endpoint to get a blob token or upload directly
router.post('/blob-upload', async (req, res) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return handleUnconfiguredDb(res);
  try {
     // Assuming body has filename and base64 content for simplicity, or it's a proxy.
     // Vercel recommends frontend uploads directly using a client token, but for this basic impl:
     const { filename, base64 } = req.body;
     const buffer = Buffer.from(base64, 'base64');
     const blob = await put(filename, buffer, { access: 'public' });
     res.json(blob);
  } catch (err) {
     res.status(500).json({ error: 'Failed to upload blob' });
  }
});

export default router;
