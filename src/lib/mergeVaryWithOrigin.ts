/**
 * @internal
 */
export function mergeVaryWithOrigin(existingVary: string): string {
    if (existingVary === '*')
        return existingVary;

    const mergedFieldNames: Set<string> = new Set(['Origin']);
    const parsedFieldNames: string[] = String(existingVary).split(',');

    for (let fieldName of parsedFieldNames) {
        fieldName = fieldName.trim();
        if (fieldName && fieldName.toLowerCase() !== 'origin')
            mergedFieldNames.add(fieldName);
    }

    return [...mergedFieldNames].join(', ');
}
