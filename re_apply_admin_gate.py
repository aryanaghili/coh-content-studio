import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

# Add imports for the gate
if "Lock" not in content:
    content = content.replace("import { Save, RefreshCw, Plus, Trash2, Eye, EyeOff } from 'lucide-react';", 
"""import { Save, RefreshCw, Plus, Trash2, Eye, EyeOff, Lock, Unlock, KeyRound } from 'lucide-react';
import { normalizeText } from '../lib/operatingCore';""")

# Add state and gate UI
gate_logic = """
  // --- Superuser Access Gate ---
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('coh_superuser_unlocked') === 'true';
  });
  const [accessCode, setAccessCode] = useState('');
  const [accessError, setAccessError] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const validCode = import.meta.env.VITE_OPERATING_CORE_ADMIN_CODE || 'COH-CORE-2026';
    if (accessCode === validCode) {
      sessionStorage.setItem('coh_superuser_unlocked', 'true');
      setIsUnlocked(true);
      setAccessError(false);
    } else {
      setAccessError(true);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('coh_superuser_unlocked');
    setIsUnlocked(false);
    setAccessCode('');
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200 max-w-md w-full text-center">
          <div className="mx-auto w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-neutral-600" />
          </div>
          <h2 className="text-xl font-serif text-neutral-900 mb-2">Operating Core Locked</h2>
          <p className="text-sm text-neutral-500 mb-6">
            The Operating Core is the foundational brain of COH Content Studio. It is restricted to superuser administrators to prevent accidental overwrites of strategic guardrails.
          </p>
          <form onSubmit={handleUnlock} className="flex flex-col gap-3">
            <input 
              type="password" 
              placeholder="Enter Access Code" 
              value={accessCode}
              onChange={(e) => { setAccessCode(e.target.value); setAccessError(false); }}
              className="px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-center"
            />
            {accessError && <span className="text-xs text-red-500 text-center">Incorrect access code.</span>}
            <button 
              type="submit" 
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Unlock Operating Core
            </button>
          </form>
        </div>
      </div>
    );
  }
"""

if "coh_superuser_unlocked" not in content:
    content = content.replace("const handleSave = () => {", gate_logic + "\n  const handleSave = () => {")

# Add Lock button to the UI header
lock_button = """          <button 
            onClick={handleLock} 
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-neutral-100 text-neutral-600 rounded-md hover:bg-neutral-200 transition-colors"
          >
            <Lock className="w-4 h-4" />
            Lock
          </button>
"""
if "onClick={handleLock}" not in content:
    content = content.replace(
        '<button \n            onClick={onReset}', 
        lock_button + '          <button \n            onClick={onReset}'
    )

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

print("Gate re-applied")
