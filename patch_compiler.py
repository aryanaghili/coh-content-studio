import re

with open('src/lib/operatingCore.ts', 'r') as f:
    content = f.read()

# Update compileOperatingCoreContext to prepend the protected kernel
if "export function compileOperatingCoreContext" in content:
    compiler_function_start = """export function compileOperatingCoreContext(core: OperatingCore, ctx: CompileContext): string {
  if (!core.active) return '';

  let compiled = `${PROTECTED_COH_KERNEL}\\n\\n`;
  compiled += `OPERATING CORE - DISTILLED RULES (Editable Brain)\\n`;
  compiled += `===============================================\\n\\n`;
"""
    # Replace the existing function start
    content = re.sub(
        r"export function compileOperatingCoreContext\(core: OperatingCore, ctx: CompileContext\): string \{\n  if \(\!core.active\) return '';\n\n  let compiled = '';",
        compiler_function_start,
        content
    )

with open('src/lib/operatingCore.ts', 'w') as f:
    f.write(content)

print("Compiler patched")
