import re

file_path = "src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Refactor Auth Screen
content = content.replace(
    'className="min-h-screen flex items-center justify-center bg-white font-sans text-slate-800 antialiased"',
    'className="min-h-screen flex items-center justify-center bg-canvas font-sans text-text-primary antialiased"'
)
content = content.replace(
    'className="w-full max-w-md bg-white/5 backdrop-blur-md border border-slate-200 p-8 rounded-3xl shadow-lg space-y-6"',
    'className="w-full max-w-md card-level-2 p-8 space-y-6"'
)
content = content.replace(
    'className="w-full bg-white border border-slate-100 p-2.5 rounded text-slate-800 text-sm font-sans"',
    'className="h-10 px-3 py-2 w-full bg-surface-inset border border-border-standard focus-visible:ring-focus-ring rounded-md font-sans text-[14px] text-text-primary outline-none transition-all focus-visible:ring-2"'
)

# Refactor Shell Wrapper
content = content.replace(
    '<div className="min-h-screen flex flex-col md:flex-row bg-white font-sans text-slate-800 antialiased">',
    '<div className="app-shell">'
)

# Refactor Sidebar
content = content.replace(
    '<aside className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 w-85 max-w-[85vw] border-r border-slate-200 bg-white text-slate-800 flex flex-col justify-between p-6 md:p-8 shrink-0 overflow-y-auto ${isMobileMenuOpen ? \'translate-x-0\' : \'-translate-x-full\'}`}>',
    '<aside className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 w-[256px] max-w-[85vw] border-r border-border-strong bg-sidebar-bg text-text-primary flex flex-col justify-between p-6 shrink-0 overflow-y-auto ${isMobileMenuOpen ? \'translate-x-0\' : \'-translate-x-full\'}`}>'
)

# Fix Sidebar Titles/Colors
content = content.replace(
    '<span className="font-sans tracking-widest text-xs uppercase text-violet-600 block mb-2">Climate Opera Haus</span>',
    '<span className="font-sans tracking-widest text-[11px] uppercase text-brand-gold block mb-2">Climate Opera Haus</span>'
)
content = content.replace(
    '<h1 className="font-sans text-2xl font-normal leading-tight tracking-tight border-b border-slate-100 pb-4 text-slate-800">',
    '<h1 className="font-sans text-[21px] font-semibold leading-tight tracking-tight border-b border-border-strong pb-4 text-text-on-dark">'
)

# Fix Mobile Top Bar
content = content.replace(
    '<div className="md:hidden flex items-center justify-between bg-white text-slate-800 p-4 border-b border-slate-200 shrink-0">',
    '<div className="md:hidden flex items-center justify-between bg-surface-primary text-text-primary p-4 border-b border-border-standard shrink-0">'
)
content = content.replace(
    '<div className="font-sans text-lg font-normal tracking-tight text-slate-800">',
    '<div className="font-sans text-lg font-bold tracking-tight text-text-primary">'
)

# Write out
with open(file_path, "w") as f:
    f.write(content)

print("AppShell and Sidebar basic refactored")
