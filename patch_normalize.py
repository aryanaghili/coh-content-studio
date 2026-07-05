import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add normalize helper
normalize_helper = """
// Utility to aggressively sanitize literal \\n from strings while preserving genuine carriage returns
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/\\\\n/g, '\\n').replace(/\\s+$/, '');
}
"""

if "export function normalizeText" not in content:
    # insert before export default function App
    content = content.replace("export default function App() {", normalize_helper + "\nexport default function App() {")

# Modify localStorage hydration
local_storage_patch = """
  const [operatingCore, setOperatingCore] = useState<OperatingCore>(() => {
    const saved = localStorage.getItem('coh_operating_core_v1');
    if (saved) {
      try {
        // Run deep normalization on parsed object
        const parsed = JSON.parse(saved);
        const normalizeDeep = (obj: any): any => {
          if (typeof obj === 'string') return normalizeText(obj);
          if (Array.isArray(obj)) return obj.map(normalizeDeep);
          if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj).reduce((acc, key) => {
              acc[key] = normalizeDeep(obj[key]);
              return acc;
            }, {} as any);
          }
          return obj;
        };
        return normalizeDeep(parsed);
      } catch (e) {
        return createDefaultOperatingCore();
      }
    }
    return createDefaultOperatingCore();
  });
"""

# Replace existing operatingCore initialization
content = re.sub(
    r"const \[operatingCore, setOperatingCore\] = useState<OperatingCore>\(\(\) => \{.*?\n  \}\);",
    local_storage_patch.strip(),
    content,
    flags=re.DOTALL
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Normalized App.tsx")
