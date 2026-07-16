import re

filepath = 'src/components/OperatingCoreAdmin.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Replace the Operating Core Locked styling
content = content.replace(
    '<span className="bg-blue-100 text-blue-800 px-2 rounded">Operating Core Locked</span>',
    '<span className="text-text-primary px-2">Operating Core Locked</span>'
)

# And fix any leftover bg-white that might have been missed due to extra classes
content = re.sub(r'\bbg-white\b', 'bg-surface-primary', content)
content = re.sub(r'\bbg-gray-50\b', 'bg-surface-inset', content)
content = re.sub(r'\bbg-slate-50\b', 'bg-surface-inset', content)
content = re.sub(r'\btext-gray-800\b', 'text-text-primary', content)

# Check if Card is imported, if not, wait Operating Core uses raw divs mostly, which is fine, but let's make sure the lock screen looks good.
# Let's replace the lock icon color
content = content.replace(
    '<Lock className="mx-auto mb-4 text-brand-gold" size={32} />',
    '<Lock className="mx-auto mb-4 text-brand-gold" size={48} />'
)

with open(filepath, 'w') as f:
    f.write(content)

print("OperatingCoreAdmin updated.")
