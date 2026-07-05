import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

# Reorder sidebar buttons
sidebar_search = r'(<div className="space-y-1 mb-8">.*?)<button onClick=\{\(\) => setActiveTab\(\'evidence\'\)\}.*?Core Documents</button>'
# Move evidence tab to the very top, before passport
content = re.sub(
    r'<button onClick=\{\(\) => setActiveTab\(\'passport\'\)\}',
    r'<button onClick={() => setActiveTab(\'evidence\')} className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${activeTab === \'evidence\' ? \'bg-coh-navy text-white font-semibold\' : \'text-coh-navy/70 hover:bg-coh-cream\'}`}>Core Documents</button>\n          <button onClick={() => setActiveTab(\'passport\')}',
    content
)
# remove the old evidence button
content = re.sub(
    r'<button onClick=\{\(\) => setActiveTab\(\'evidence\'\)\} className=\{`w-full text-left px-3 py-2 text-sm rounded transition-colors \$\{activeTab === \'evidence\' \? \'bg-coh-navy text-white font-semibold\' : \'text-coh-navy/70 hover:bg-coh-cream\'\}`\}>Core Documents</button>',
    '',
    content,
    count=1
)

# Update the "evidence" tab content
upload_center = """
              <div className="flex gap-2 mt-4">
                <button className="text-xs bg-coh-navy text-white px-3 py-1 rounded hover:bg-coh-navy/90 transition-colors">Upload Core Document</button>
                <button className="text-xs bg-coh-navy/10 text-coh-navy px-3 py-1 rounded hover:bg-coh-navy/20 transition-colors">Upload Core Folder</button>
                <button className="text-xs bg-coh-navy/10 text-coh-navy px-3 py-1 rounded hover:bg-coh-navy/20 transition-colors">Add Core Document Link</button>
                <button className="text-xs bg-coh-navy/10 text-coh-navy px-3 py-1 rounded hover:bg-coh-navy/20 transition-colors">Paste Core Document Text</button>
                <button className="text-xs bg-coh-navy/10 text-coh-navy px-3 py-1 rounded hover:bg-coh-navy/20 transition-colors">Add Manual Core Document</button>
              </div>
"""

# Replace the "Link existing Source Library source" button and add upload center
content = re.sub(
    r'<button\s*className="text-xs bg-coh-gold text-white px-3 py-1 rounded hover:bg-coh-gold/90 transition-colors"\s*>\s*Link existing Source Library source\s*</button>',
    upload_center,
    content,
    flags=re.DOTALL
)

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

print("OperatingCoreAdmin.tsx cleaned.")
