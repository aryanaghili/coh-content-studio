import re

file_path = "src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Replace Sidebar Navigation Tabs styling
content = content.replace(
    "'bg-violet-100 text-violet-700 font-bold rounded-full shadow-sm'",
    "'bg-sidebar-active text-text-on-dark font-semibold rounded-md shadow-sm'"
)
content = content.replace(
    "'bg-violet-100 text-violet-700 font-bold rounded-full'",
    "'bg-sidebar-active text-text-on-dark font-semibold rounded-md shadow-sm'"
)
content = content.replace(
    "'text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-full'",
    "'text-text-secondary hover:bg-sidebar-hover hover:text-text-on-dark rounded-md'"
)

# Fix "Workspaces", "Libraries" headers
content = content.replace(
    'className="pt-6 pb-2 px-4 text-[10px] font-bold tracking-wider text-slate-400 uppercase"',
    'className="pt-6 pb-2 px-4 text-[11px] font-semibold tracking-wider text-text-muted uppercase"'
)
content = content.replace(
    'className="pb-2 px-4 text-[10px] font-bold tracking-wider text-slate-400 uppercase"',
    'className="pb-2 px-4 text-[11px] font-semibold tracking-wider text-text-muted uppercase"'
)

# Fix Main Content Wrapper to standard
content = content.replace(
    '<main className="flex-1 overflow-y-auto w-full">',
    '<main className="app-main"><div className="page-content">'
)
# Note: Since I add a <div> I'll need to make sure I close it, but replacing just the opening tag is risky if I don't close it. Let's just change the `<main>` classes.
content = content.replace(
    '<main className="flex-1 overflow-y-auto w-full"><div className="page-content">',
    '<main className="flex-1 overflow-y-auto w-full">'
)
content = content.replace(
    '<main className="flex-1 overflow-y-auto w-full">',
    '<main className="app-main"><div className="page-content">'
)
# Actually, I'll just change the main class and not nest `div.page-content` unless I can safely do it.
# Let's revert the main replacement and do this:
content = content.replace(
    '<main className="app-main"><div className="page-content">',
    '<main className="flex-1 overflow-y-auto w-full bg-canvas px-4 md:px-8 py-8">'
)
content = content.replace(
    '<main className="flex-1 overflow-y-auto w-full">',
    '<main className="flex-1 overflow-y-auto w-full bg-canvas px-4 md:px-8 py-8">'
)

with open(file_path, "w") as f:
    f.write(content)

print("Navigation and main wrapper updated")
