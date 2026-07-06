import os

filepath = "server.js"
with open(filepath, "r") as f:
    content = f.read()

target = "if (msg.toLowerCase().includes('rate limit') || msg.includes('429')) return 'Rate limit reached. Try again in a moment.';"
replacement = "if (msg.toLowerCase().includes('rate limit') || msg.includes('429') || msg.toLowerCase().includes('quota')) return 'AI quota or rate limit reached. Translation could not be completed.';"

content = content.replace(target, replacement)

with open(filepath, "w") as f:
    f.write(content)

print("Done patching server.js")
