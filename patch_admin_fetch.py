import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

old_handle = """  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const validCode = import.meta.env.VITE_OPERATING_CORE_ADMIN_CODE || 'COH-CORE-2026';
    if (accessCode === validCode) {
      sessionStorage.setItem('coh_superuser_unlocked', 'true');
      setIsUnlocked(true);
      setAccessError(false);
    } else {
      setAccessError(true);
    }
  };"""

new_handle = """  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAccessError(false);
    setErrorMessage('');
    
    try {
      const response = await fetch('http://localhost:3001/api/operating-core/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode })
      });
      
      const data = await response.json();
      
      if (data.success) {
        sessionStorage.setItem('coh_superuser_unlocked', 'true');
        setIsUnlocked(true);
      } else {
        setAccessError(true);
        setErrorMessage(data.error || 'Invalid code');
      }
    } catch (err) {
      setAccessError(true);
      setErrorMessage('Server error connecting to verification service.');
    } finally {
      setIsVerifying(false);
    }
  };"""

if old_handle in content:
    content = content.replace(old_handle, new_handle)
    
    # Also update the error display to use errorMessage
    content = content.replace(
        "{accessError && <span className=\"text-xs text-red-500 text-center\">Incorrect access code.</span>}",
        "{accessError && <span className=\"text-xs text-red-500 text-center\">{errorMessage || 'Incorrect access code.'}</span>}"
    )
    
    # Also update the button to show loading state
    content = content.replace(
        """            <button 
              type="submit" 
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Unlock Operating Core
            </button>""",
        """            <button 
              type="submit" 
              disabled={isVerifying}
              className={`bg-black text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${isVerifying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-800'}`}
            >
              <KeyRound className="w-4 h-4" />
              {isVerifying ? 'Verifying...' : 'Unlock Operating Core'}
            </button>"""
    )
    
    with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
        f.write(content)
    print("Admin fetch patched")
else:
    print("Admin fetch patch failed - string not found")

