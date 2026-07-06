import os
import re

APP_TSX_PATH = 'src/App.tsx'
ADMIN_TSX_PATH = 'src/components/OperatingCoreAdmin.tsx'

with open(APP_TSX_PATH, 'r') as f:
    app_content = f.read()

# In App.tsx, update operatingCore initialization to use useEffect instead of lazy init for API, with fallback to localStorage.
# We will add an `isDbConfigured` state.

app_content = app_content.replace(
    "const [operatingCore, setOperatingCore] = useState<OperatingCore>(() => {",
    """const [operatingCore, setOperatingCore] = useState<OperatingCore>(createDefaultOperatingCore());
  const [dbStatus, setDbStatus] = useState<'checking' | 'configured' | 'local_only'>('checking');

  useEffect(() => {
    const fetchCore = async () => {
      try {
        const res = await fetch('/api/operating-core');
        if (res.status === 503) {
          setDbStatus('local_only');
          // Fallback to localStorage
          const saved = localStorage.getItem('coh_operating_core_v1');
          if (saved) {
            try {
              setOperatingCore(JSON.parse(saved));
            } catch (e) { console.error('Failed to parse local core'); }
          }
        } else if (res.ok) {
          const data = await res.json();
          setDbStatus('configured');
          if (Object.keys(data).length > 0) {
            setOperatingCore(prev => ({...prev, ...data}));
          } else {
            // New DB, save default
            await fetch('/api/operating-core', {
               method: 'PUT',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify(createDefaultOperatingCore())
            });
          }
        } else {
           setDbStatus('local_only');
        }
      } catch (err) {
        console.error('API fetch error', err);
        setDbStatus('local_only');
        const saved = localStorage.getItem('coh_operating_core_v1');
        if (saved) {
          try {
            setOperatingCore(JSON.parse(saved));
          } catch (e) { console.error('Failed to parse local core'); }
        }
      }
    };
    fetchCore();
  }, []);

  const [operatingCore_init_unused, setOperatingCore_init_unused] = useState<OperatingCore>(() => {"""
)

# Replace the useEffect that saves to localStorage
app_content = app_content.replace(
    """  useEffect(() => {
    localStorage.setItem('coh_operating_core_v1', JSON.stringify(operatingCore));
  }, [operatingCore]);""",
    """  useEffect(() => {
    if (dbStatus === 'local_only') {
      localStorage.setItem('coh_operating_core_v1', JSON.stringify(operatingCore));
    } else if (dbStatus === 'configured') {
      fetch('/api/operating-core', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operatingCore)
      }).catch(err => console.error('Failed to save to DB', err));
    }
  }, [operatingCore, dbStatus]);"""
)

# Pass dbStatus to OperatingCoreAdmin
app_content = app_content.replace(
    "<OperatingCoreAdmin \n              core={operatingCore}",
    "<OperatingCoreAdmin \n              dbStatus={dbStatus}\n              core={operatingCore}"
)

# And in the onSave/onReset handlers
app_content = app_content.replace(
    """                setOperatingCore(newCore);
                localStorage.setItem('coh_operating_core_v1', JSON.stringify(newCore));""",
    """                setOperatingCore(newCore);"""
)

app_content = app_content.replace(
    """                setOperatingCore(defaultCore);
                localStorage.setItem('coh_operating_core_v1', JSON.stringify(defaultCore));""",
    """                setOperatingCore(defaultCore);"""
)

with open(APP_TSX_PATH, 'w') as f:
    f.write(app_content)
print("Updated App.tsx")


with open(ADMIN_TSX_PATH, 'r') as f:
    admin_content = f.read()

# Update the Props interface
admin_content = admin_content.replace(
    "interface Props {\n  core: OperatingCore;",
    "interface Props {\n  dbStatus?: 'checking' | 'configured' | 'local_only';\n  core: OperatingCore;"
)

# Destructure dbStatus
admin_content = admin_content.replace(
    "export function OperatingCoreAdmin({ core, sourceLibrary, onSave, onReset, onAddNewCoreSource }: Props) {",
    "export function OperatingCoreAdmin({ dbStatus = 'local_only', core, sourceLibrary, onSave, onReset, onAddNewCoreSource }: Props) {"
)

# Fetch Core Documents
admin_content = admin_content.replace(
    "const [operatingCoreDocuments, setOperatingCoreDocuments] = useState<CoreDocument[]>([]);",
    """const [operatingCoreDocuments, setOperatingCoreDocuments] = useState<CoreDocument[]>([]);

  useEffect(() => {
    const fetchDocs = async () => {
      if (dbStatus === 'configured') {
        try {
          const res = await fetch('/api/operating-core/documents');
          if (res.ok) {
            setOperatingCoreDocuments(await res.json());
          }
        } catch(e) { console.error('Failed to fetch docs', e); }
      } else if (dbStatus === 'local_only') {
        const saved = localStorage.getItem('coh_core_docs_v1');
        if (saved) {
           try { setOperatingCoreDocuments(JSON.parse(saved)); } catch(e){}
        }
      }
    };
    fetchDocs();
  }, [dbStatus]);

  useEffect(() => {
     if (dbStatus === 'local_only') {
        localStorage.setItem('coh_core_docs_v1', JSON.stringify(operatingCoreDocuments));
     }
  }, [operatingCoreDocuments, dbStatus]);
"""
)

# Replace the warning
warning_original = """<div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded mb-4 flex items-center gap-2">
                <span className="text-red-500">⚠️</span> 
                <strong>Storage Warning:</strong> Local/browser storage only. Not safe for shared use. Connect a production database for team persistence.
              </div>"""
warning_new = """{dbStatus === 'local_only' ? (
              <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded mb-4 flex items-center gap-2">
                <span className="text-red-500">⚠️</span> 
                <strong>Storage Warning:</strong> Local/browser storage only. Not safe for shared use. Connect a production database for team persistence.
              </div>
              ) : dbStatus === 'configured' ? (
              <div className="bg-green-50 border border-green-200 text-green-800 text-xs p-3 rounded mb-4 flex items-center gap-2">
                <span className="text-green-500">✓</span> 
                <strong>Persistent storage configured.</strong> Team knowledge base is active.
              </div>
              ) : null}"""
admin_content = admin_content.replace(warning_original, warning_new)


# Function replacements for document actions
admin_content = admin_content.replace(
    """const newDoc = await addCoreDocument({""",
    """
                  const baseDoc = {
                    title: 'New Core Document',
                    documentType: 'Strategic Plan',
                    status: 'Draft',
                    brainArea: 'Passport',
                    brainRole: 'Rule',
                    shortContext: '',
                    rawText: '',
                    createdBy: 'Superadmin'
                  };
                  if (dbStatus === 'configured') {
                     const res = await fetch('/api/operating-core/documents', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(baseDoc)
                     });
                     if (res.ok) {
                        const {id} = await res.json();
                        setOperatingCoreDocuments([{...baseDoc, id, createdAt: new Date().toISOString()} as CoreDocument, ...operatingCoreDocuments]);
                     }
                  } else {
                     const newDoc = await addCoreDocument(baseDoc);
                     setOperatingCoreDocuments([newDoc, ...operatingCoreDocuments]);
                  }
                  /* """
)
admin_content = admin_content.replace(
    """setOperatingCoreDocuments([newDoc, ...operatingCoreDocuments]);\n                }}""",
    """*/\n                }}"""
)


# Helper to replace setOperatingCoreDocuments inline update logic
admin_content = admin_content.replace(
    "setOperatingCoreDocuments(docs);",
    """
    if (dbStatus === 'configured') {
       fetch(`/api/operating-core/documents/${doc.id}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(docs[idx])
       });
    }
    setOperatingCoreDocuments(docs);
    """
)


admin_content = admin_content.replace(
    "setOperatingCoreDocuments(operatingCoreDocuments.filter(d => d.id !== doc.id));",
    """
    if (dbStatus === 'configured') {
       fetch(`/api/operating-core/documents/${doc.id}`, { method: 'DELETE' });
    }
    setOperatingCoreDocuments(operatingCoreDocuments.filter(d => d.id !== doc.id));
    """
)

with open(ADMIN_TSX_PATH, 'w') as f:
    f.write(admin_content)
print("Updated OperatingCoreAdmin.tsx")
