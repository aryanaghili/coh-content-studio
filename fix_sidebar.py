import re

file_path = "src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Make sidebar light
content = content.replace("bg-slate-900 text-coh-cream p-4 border-b border-slate-200", "bg-white text-slate-800 p-4 border-b border-slate-200")
content = content.replace("bg-slate-900 text-coh-cream flex flex-col", "bg-white text-slate-800 flex flex-col")
content = content.replace("text-coh-cream", "text-slate-800")
content = content.replace("text-violet-600/70 hover:bg-slate-900-light hover:text-coh-cream", "text-slate-500 hover:bg-slate-50 hover:text-slate-900")
content = content.replace("bg-violet-600 text-coh-navy font-semibold shadow-sm", "bg-violet-100 text-violet-700 font-bold rounded-full")
content = content.replace("text-violet-600/40 uppercase", "text-slate-400 uppercase")
content = content.replace("rounded ${", "rounded-full ${")

with open(file_path, "w") as f:
    f.write(content)

print("App.tsx Sidebar updated!")
