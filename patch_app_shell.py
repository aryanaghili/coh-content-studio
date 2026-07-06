import os
import re

file_path = "src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add Menu, X to lucide imports (safer to just add a new import line if they are not already imported)
if "Menu, X" not in content and "import { Menu, X }" not in content:
    content = content.replace("import React,", "import React,\n  { useState } from 'react';\nimport { Menu, X } from 'lucide-react';\n//")
    content = content.replace("import { Menu, X } from 'lucide-react';\n//", "import { Menu, X } from 'lucide-react';")

# 2. Add state
state_declaration = "  const [activeTab, setActiveTab] = useState<string>('command-center');"
new_state = "  const [activeTab, setActiveTab] = useState<string>('command-center');\n  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);"
if "isMobileMenuOpen" not in content:
    content = content.replace(state_declaration, new_state)

# 3. Modify App Shell layout
old_shell = """  return (
    <div className="min-h-screen flex bg-coh-cream font-sans text-coh-navy antialiased">
      
      {/* --- Sidebar Navigation (REORDERED) --- */}
      <aside className="w-85 border-r border-coh-gold/30 bg-coh-navy text-coh-cream flex flex-col justify-between p-8 shrink-0">"""

new_shell = """  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-coh-cream font-sans text-coh-navy antialiased">
      
      {/* --- Mobile Top Bar --- */}
      <div className="md:hidden flex items-center justify-between bg-coh-navy text-coh-cream p-4 border-b border-coh-gold/30 shrink-0">
        <div className="font-serif text-lg font-normal tracking-tight text-coh-cream">
          Climate Opera Haus
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-coh-gold hover:text-coh-cream">
          <Menu size={24} />
        </button>
      </div>

      {/* --- Sidebar Navigation Overlay/Drawer --- */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <aside className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 w-85 max-w-[85vw] border-r border-coh-gold/30 bg-coh-navy text-coh-cream flex flex-col justify-between p-6 md:p-8 shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Mobile close button */}
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden absolute top-4 right-4 p-2 text-coh-gold hover:text-coh-cream">
          <X size={24} />
        </button>"""

if "min-h-screen flex flex-col md:flex-row" not in content:
    content = content.replace(old_shell, new_shell)

# 4. Fix main tag
old_main = '<main className="flex-1 overflow-y-auto px-12 py-10">'
new_main = '<main className="flex-1 overflow-y-auto px-4 md:px-12 py-6 md:py-10 flex flex-col min-w-0">'
if new_main not in content:
    content = content.replace(old_main, new_main)

# Also ensure onClick on sidebar buttons closes the menu!
# We must use regex to capture the inner string of the arrow function properly.
# e.g. onClick={() => setActiveTab('command-center')} -> onClick={() => { setIsMobileMenuOpen(false); setActiveTab('command-center'); }}
content = re.sub(r"onClick=\{\(\) => setActiveTab\('([^']+)'\)\}", r"onClick={() => { setIsMobileMenuOpen(false); setActiveTab('\1'); }}", content)

with open(file_path, "w") as f:
    f.write(content)

print("Patched App.tsx shell correctly")
