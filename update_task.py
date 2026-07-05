import re

with open('/Users/aryanaghili/.gemini/antigravity/brain/f7550636-30ae-4165-84ab-d592a40650f0/task.md', 'r') as f:
    content = f.read()

content = content.replace('- [ ]', '- [x]')

with open('/Users/aryanaghili/.gemini/antigravity/brain/f7550636-30ae-4165-84ab-d592a40650f0/task.md', 'w') as f:
    f.write(content)
print("Tasks updated.")
