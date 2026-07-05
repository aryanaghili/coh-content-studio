import re

# Move normalizeText to operatingCore.ts
with open('src/lib/operatingCore.ts', 'r') as f:
    core_content = f.read()

if "export function normalizeText" not in core_content:
    normalize_func = """
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/\\\\n/g, '\\n').replace(/\\s+$/, '');
}
"""
    core_content = core_content + normalize_func
    with open('src/lib/operatingCore.ts', 'w') as f:
        f.write(core_content)

# Remove normalizeText from App.tsx and import it
with open('src/App.tsx', 'r') as f:
    app_content = f.read()

app_content = re.sub(
    r"// Utility to aggressively sanitize literal \\n from strings while preserving genuine carriage returns\nexport function normalizeText\(.*?\) \{.*?\n\}\n",
    "",
    app_content,
    flags=re.DOTALL
)

if "import { normalizeText" not in app_content:
    app_content = app_content.replace(
        "import { createDefaultOperatingCore, compileOperatingCoreContext } from './lib/operatingCore';",
        "import { createDefaultOperatingCore, compileOperatingCoreContext, normalizeText } from './lib/operatingCore';"
    )

with open('src/App.tsx', 'w') as f:
    f.write(app_content)

# Update OperatingCoreAdmin.tsx import
with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    admin_content = f.read()

admin_content = admin_content.replace(
    "import { normalizeText } from '../App';",
    ""
)
admin_content = admin_content.replace(
    "import { createDefaultOperatingCore, compileOperatingCoreContext } from '../lib/operatingCore';",
    "import { createDefaultOperatingCore, compileOperatingCoreContext, normalizeText } from '../lib/operatingCore';"
)

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(admin_content)

print("normalizeText moved to operatingCore.ts")
