import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

# 1. Add literal \n sanitization to all textarea values
# We can just change how draftCore is initialized safely by deep mapping over safeCore
sanitize_fn = """
const deepSanitize = (obj: any): any => {
  if (typeof obj === 'string') return obj.replace(/\\\\n/g, '\\n');
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = deepSanitize(obj[key]);
    }
    return newObj;
  }
  return obj;
};

export default function OperatingCoreAdmin"""

content = content.replace("export default function OperatingCoreAdmin", sanitize_fn)
content = content.replace("const [draftCore, setDraftCore] = useState<OperatingCore>(safeCore);", "const [draftCore, setDraftCore] = useState<OperatingCore>(deepSanitize(safeCore));")

# 2. Reorder Tabs so Core Documents is first
tabs_code = """<button onClick={() => setActiveTab('evidence')} className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${activeTab === 'evidence' ? 'bg-coh-navy text-white font-semibold' : 'text-coh-navy/70 hover:bg-coh-cream'}`}>Core Documents</button>
          <button onClick={() => setActiveTab('passport')} className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${activeTab === 'passport' ? 'bg-coh-navy text-white font-semibold' : 'text-coh-navy/70 hover:bg-coh-cream'}`}>Core Passport</button>"""

# Find where it renders the tabs and reorder them. Actually, 'evidence' is already the first button there in the codebase at line 262! Wait, `evidence` tab active logic?
# Let's change the initial state to 'evidence'
content = content.replace("useState<'passport' | 'kernel' | 'audiences' | 'channels' | 'claims' | 'voice' | 'visual' | 'revision' | 'evidence'>('passport');", "useState<'passport' | 'kernel' | 'audiences' | 'channels' | 'claims' | 'voice' | 'visual' | 'revision' | 'evidence'>('evidence');")

# 3. Badge "Protected COH Kernel: Always On" at top of UI
badge_code = """<div className="flex items-center gap-1 bg-coh-navy/5 px-2 py-1 rounded border border-coh-navy/10 text-[10px] text-coh-navy/70 font-mono mt-1">
            <span className="font-bold">Protected COH Foundation:</span> Always On
          </div>"""
new_badge_code = """<div className="flex items-center gap-2 bg-coh-gold/10 px-3 py-2 rounded border border-coh-gold/30 text-xs text-coh-navy font-mono mt-2 mb-2 w-fit">
            <Lock size={14} className="text-coh-gold"/> <span className="font-bold uppercase">Protected COH Kernel:</span> <span className="text-green-700 font-bold">ALWAYS ON</span>
          </div>"""

content = content.replace(badge_code, new_badge_code)

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)
