import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

# 1. Add imports for coreDocumentsStorage
imports = """import { getCoreDocuments, addCoreDocument, updateCoreDocument, deleteCoreDocument, applyCoreDocumentToOperatingCore, CoreDocument } from '../lib/coreDocumentsStorage';\nimport { useEffect } from 'react';"""
content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';\n" + imports)
if imports not in content:
    # try another way
    content = content.replace("import {", "import { getCoreDocuments, addCoreDocument, updateCoreDocument, deleteCoreDocument, applyCoreDocumentToOperatingCore, CoreDocument } from '../lib/coreDocumentsStorage';\nimport {", 1)

# 2. Update state from any[] to CoreDocument[] and add loading state
state_search = "const [operatingCoreDocuments, setOperatingCoreDocuments] = useState<any[]>(() => {\n    try {\n      const stored = localStorage.getItem('coh-operating-core-documents');\n      return stored ? JSON.parse(stored) : [];\n    } catch (e) {\n      return [];\n    }\n  });\n\n  // Sync to localStorage\n  React.useEffect(() => {\n    localStorage.setItem('coh-operating-core-documents', JSON.stringify(operatingCoreDocuments));\n  }, [operatingCoreDocuments]);"
state_replacement = """const [operatingCoreDocuments, setOperatingCoreDocuments] = useState<CoreDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  
  useEffect(() => {
    const loadDocs = async () => {
      setIsLoadingDocs(true);
      const docs = await getCoreDocuments();
      setOperatingCoreDocuments(docs);
      setIsLoadingDocs(false);
    };
    loadDocs();
  }, []);"""

# use regex for robustness
match = re.search(r"const \[operatingCoreDocuments, setOperatingCoreDocuments\] = useState<any\[\]>\(\(\) => \{[\s\S]*?\}, \[operatingCoreDocuments\]\);", content)
if match:
    content = content[:match.start()] + state_replacement + content[match.end():]
else:
    print("Could not find state definition for operatingCoreDocuments")

# 3. Add Storage Status Banner at the top of Evidence tab
banner = """<div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded mb-4 flex items-center gap-2">
                <span className="text-red-500">⚠️</span> 
                <strong>Storage Warning:</strong> Local/browser storage only. Not safe for shared use. Connect a production database for team persistence.
              </div>"""
content = content.replace('<h3 className="font-serif text-xl font-bold text-coh-navy">Core Documents</h3>', '<h3 className="font-serif text-xl font-bold text-coh-navy">Core Documents</h3>\n' + banner)

# 4. Update the "Add Core Document" button to use API
add_btn_regex = r"setOperatingCoreDocuments\(\[\{[\s\S]*?\}, \.\.\.operatingCoreDocuments\]\);"
new_add_logic = """const newDoc = await addCoreDocument({
                    title: 'New Core Document',
                    documentType: 'Strategic Plan',
                    status: 'Draft',
                    brainArea: 'Passport',
                    brainRole: 'Rule',
                    shortContext: '',
                    rawText: '',
                    createdBy: 'Superadmin'
                  });
                  setOperatingCoreDocuments([newDoc, ...operatingCoreDocuments]);"""
content = re.sub(add_btn_regex, new_add_logic, content)

# make onClick async
content = content.replace("onClick={() => {", "onClick={async () => {")


with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

print("Step 1 done")
