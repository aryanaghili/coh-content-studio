with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "item.title === 'Multi-Channel Pack' ? 'Multi-Channel Campaign' : 'Single Channel'",
    "item.title === 'Multi-Channel Pack' ? 'Multi-Channel Pack' : 'Single Channel'"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Type fixed")
