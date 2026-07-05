with open('src/App.tsx', 'r') as f:
    content = f.read()

import_statement = "import { createDefaultOperatingCore, compileOperatingCoreContext, normalizeText } from './lib/operatingCore';"
if "import { createDefaultOperatingCore" in content and "normalizeText" not in content:
    content = content.replace(
        "import { createDefaultOperatingCore, compileOperatingCoreContext } from './lib/operatingCore';",
        import_statement
    )

old_state = """  const [operatingCore, setOperatingCore] = useState<OperatingCore>(() => {
    const saved = localStorage.getItem('coh_operating_core_v1');
    return saved ? JSON.parse(saved) : createDefaultOperatingCore();
  });"""

new_state = """  const [operatingCore, setOperatingCore] = useState<OperatingCore>(() => {
    const saved = localStorage.getItem('coh_operating_core_v1');
    if (saved) {
      try {
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
  });"""

if old_state in content:
    content = content.replace(old_state, new_state)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("normalize re-applied")
