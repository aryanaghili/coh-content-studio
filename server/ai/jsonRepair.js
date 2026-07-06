/**
 * JSON Repair & Cleanup Utility
 */
export function repairJson(str) {
  if (!str) return { success: false, errorType: 'AI_PARSE_ERROR', fallbackText: '' };
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
      // Find the first '{' or '[' and last '}' or ']'
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      const firstBracket = cleaned.indexOf('[');
      const lastBracket = cleaned.lastIndexOf(']');
      
      let startIdx = firstBrace;
      let endIdx = lastBrace;
      
      if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
          startIdx = firstBracket;
          endIdx = lastBracket;
      }

      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const potentialJson = cleaned.substring(startIdx, endIdx + 1);
        return JSON.parse(potentialJson);
      }
    } catch (innerErr) {
      // Let it fail
    }
  }
  
  // Return a safe fallback object instead of null to prevent upstream crashes
  return {
      success: false,
      errorType: 'AI_PARSE_ERROR',
      userMessage: 'The AI response could not be converted into the expected structured format.',
      fallbackText: str
  };
}
