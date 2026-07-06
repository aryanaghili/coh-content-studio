import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

# Fix import
content = content.replace(
    "import { getCoreDocuments, addCoreDocument, updateCoreDocument, deleteCoreDocument, applyCoreDocumentToOperatingCore, unapplyCoreDocumentFromOperatingCore, CoreDocument } from '../lib/coreDocumentsStorage';",
    "import { getCoreDocuments, addCoreDocument, updateCoreDocument, deleteCoreDocument, applyCoreDocumentToOperatingCore, unapplyCoreDocumentFromOperatingCore } from '../lib/coreDocumentsStorage';\nimport type { CoreDocument } from '../lib/coreDocumentsStorage';"
)

# Fix value={doc.type} to value={doc.documentType}
content = content.replace("value={doc.type ||", "value={doc.documentType ||")

# Fix value={doc.notes} to value={doc.shortContext}
content = content.replace("value={doc.notes ||", "value={doc.shortContext ||")

# Fix value={doc.content} to value={doc.rawText}
content = content.replace("value={doc.content ||", "value={doc.rawText ||")

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

