/**
 * JSON Repair & Cleanup Utility
 */
export function repairJson(str) {
  if (!str) return null;
  let cleaned = str.trim();

  // Remove markdown codeblock wrapper
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '').trim();
  }

  // Attempt standard parse first
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Attempt basic repairs
    try {
      // Find the first '{' and last '}'
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        return JSON.parse(cleaned);
      }
    } catch (innerErr) {
      // Let it fail and return null
    }
  }
  return null;
}
