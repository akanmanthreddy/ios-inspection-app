/**
 * Display formatting utilities for user-facing data
 */

// Pre-compiled regex for performance optimization
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Checks if a string is a valid UUID (case-insensitive)
 * @param value - The string to check
 * @returns true if the string is a valid UUID
 */
function isUUID(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // Trim whitespace and check length first for performance
  const trimmed = value.trim();
  if (trimmed.length !== 36) {
    return false;
  }

  return UUID_REGEX.test(trimmed);
}

/**
 * Formats inspector name for display, hiding UUIDs and handling edge cases
 * @param inspectorName - The raw inspector name from the API
 * @param fallback - The fallback text to display (default: "Unknown")
 * @returns Formatted inspector name or fallback
 */
export function formatInspectorName(inspectorName: unknown, fallback: string = "Unknown"): string {
  // Handle null, undefined, or non-string values
  if (!inspectorName || typeof inspectorName !== 'string') {
    return fallback;
  }

  const trimmed = inspectorName.trim();

  // Handle empty or whitespace-only strings
  if (!trimmed) {
    return fallback;
  }

  // If it's a UUID, return fallback instead
  if (isUUID(trimmed)) {
    return fallback;
  }

  // Return the actual name
  return trimmed;
}

/**
 * Formats property type for display with proper capitalization
 * @param type - The raw property type from the API
 * @returns Formatted property type
 */
export function formatPropertyType(type: string | null): string {
  if (!type) return 'Unknown';
  return type.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

/**
 * Formats status for display with proper capitalization
 * @param status - The raw status from the API
 * @returns Formatted status
 */
export function formatStatus(status: string): string {
  return status.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}