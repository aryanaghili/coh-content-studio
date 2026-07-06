export function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    
    // Type validation
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    if (typeof fallback === 'object' && fallback !== null && typeof parsed !== 'object') return fallback;
    
    return parsed as T;
  } catch (err) {
    console.warn(`[Storage] Failed to parse ${key}. Falling back to default.`);
    return fallback;
  }
}
