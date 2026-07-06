import re

with open('src/lib/operatingCore.ts', 'r') as f:
    content = f.read()

imports = "import type { CoreDocument } from './coreDocumentsStorage';\n"
if "CoreDocument" not in content:
    content = imports + content

sig_old = "export function compileOperatingCoreContext(core: OperatingCore | null, context: CompileContext): string {"
sig_new = "export function compileOperatingCoreContext(core: OperatingCore | null, context: CompileContext, appliedDocs: CoreDocument[] = []): string {"
content = content.replace(sig_old, sig_new)

# Now inject the Applied Documents directly after the Operating Core context logic
# In compileOperatingCoreContext, it returns the generated string. We can find the end where it returns `parts.join('\n\n')`.
return_statement = "return parts.join('\\n\\n');"

applied_docs_logic = """
  // 3. Applied Core Document Insights
  const validDocs = appliedDocs.filter(d => d.appliedToOperatingCore);
  if (validDocs.length > 0) {
    parts.push(`--- INJECTED CORE DOCUMENT INSIGHTS ---\\n` + validDocs.map(d => {
      let docText = `[Core Document: ${d.title} (${d.documentType})]\\n`;
      if (d.distilledKernelNotes) docText += `- Strategy Insight: ${d.distilledKernelNotes}\\n`;
      if (d.extractedClaimEvidence) docText += `- Claim/Evidence: ${d.extractedClaimEvidence}\\n`;
      if (d.extractedVoiceGuidance) docText += `- Voice Guidance: ${d.extractedVoiceGuidance}\\n`;
      if (d.extractedVisualGuidance) docText += `- Visual Guidance: ${d.extractedVisualGuidance}\\n`;
      if (d.extractedRevisionGuidance) docText += `- Revision Guidance: ${d.extractedRevisionGuidance}\\n`;
      return docText;
    }).join('\\n\\n'));
  }

  return parts.join('\\n\\n');
"""

content = content.replace(return_statement, applied_docs_logic)

with open('src/lib/operatingCore.ts', 'w') as f:
    f.write(content)
print("Updated operatingCore.ts")
