/**
 * Safely parse specifications from string, object, or null/undefined
 */
export function parseSpecifications(specs: unknown): Record<string, string> {
  if (!specs) return {};

  if (typeof specs === 'object' && !Array.isArray(specs)) {
    return Object.fromEntries(
      Object.entries(specs as Record<string, unknown>).map(([k, v]) => [k, String(v ?? '')])
    );
  }

  if (typeof specs === 'string') {
    try {
      const parsed = JSON.parse(specs);
      if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) {
        return Object.fromEntries(
          Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [k, String(v ?? '')])
        );
      }
    } catch {
      // In case of non-json string, return empty or raw string key
      return {};
    }
  }

  return {};
}
