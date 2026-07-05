import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove Suggested Core Documents block from App.tsx
content = re.sub(r'\{\/\* Suggested Core Documents.*?\{\/\* End Suggested Core Documents \*\/\}(?:\s*</div>)?', '', content, flags=re.DOTALL)

# Simplify Source Library description to remove Core Documents reference
content = content.replace("Store and manage all documents, links, notes, examples, partner context, visual references, and source materials. Some sources can be linked to Operating Core as Core Documents. Others can be selected only for specific generation tasks.", "Store and manage all documents, links, notes, examples, partner context, visual references, and source materials for task-specific generation.")

# Remove Core Documents reference from the helper text span
content = content.replace('<span className="text-xs text-coh-navy/70">Source Library stores task-specific materials. Foundational brain documents are managed by the superuser in Operating Core as Core Documents.</span>', '<span className="text-xs text-coh-navy/70">Source Library stores task-specific materials. Foundational brain documents are managed separately in the Operating Core.</span>')

# Remove `if (sourceLibraryFilter === 'Core Documents')` block completely
content = re.sub(r'if \(sourceLibraryFilter === \'Core Documents\'\) \{.*?\} else if', 'if', content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("App leftovers cleaned.")
