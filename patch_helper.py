import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "Always-on strategy and rules are managed in Operating Core. Foundational materials can be linked as Core Documents.",
    "Source Library stores task-specific materials. Foundational brain documents are managed by the superuser in Operating Core as Core Documents."
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Helper text patched")
