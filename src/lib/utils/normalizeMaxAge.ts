/**
 * @internal
 */
export function normalizeMaxAge(maxAge: string | number = ''): string | null {
    if (!maxAge)
        return null;
    return Number.isInteger(+maxAge) ? String(maxAge) : null;
}
