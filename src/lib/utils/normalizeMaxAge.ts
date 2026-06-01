/**
 * @internal
 */
export function normalizeMaxAge(maxAge: number): string | null {
    return Number.isInteger(maxAge) ? String(maxAge) : null;
}
