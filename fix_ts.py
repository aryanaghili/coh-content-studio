with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('  url?: string;\n}', '  url?: string;\n  selectable?: boolean;\n}')
content = content.replace("title: '', type: 'Document', useFor: ''", "title: '', type: 'Business Memo', useFor: ''")

with open('src/App.tsx', 'w') as f:
    f.write(content)
