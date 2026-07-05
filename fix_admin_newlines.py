import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

# Make sure we import normalizeText if not already there
if 'normalizeText' not in content:
    content = content.replace(
        "import type { OperatingCore } from '../lib/operatingCore';",
        "import { normalizeText, type OperatingCore } from '../lib/operatingCore';"
    )

# Find all textareas rendering string values and wrap them in normalizeText
# Example: value={localCore.strategyKernel.positioning} -> value={normalizeText(localCore.strategyKernel.positioning)}
# Actually, since onChange updates it raw, wrapping value= in normalizeText is enough for rendering.

# Let's do a regex to find value={localCore.xxx} inside <textarea>
def wrap_normalize(match):
    full = match.group(0)
    val = match.group(1)
    if 'normalizeText' not in val and 'localCore' in val:
        return f'value={{normalizeText({val})}}'
    return full

content = re.sub(r'value=\{([^}]+)\}', wrap_normalize, content)

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

print("Admin newlines patched")
