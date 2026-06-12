/**
 * @internal
 */
export function addOriginToVary(existingVary: string): string {
    if (existingVary === '*')
        return existingVary;

    const mergedFieldNames: Set<string> = new Set(['origin']);
    const parsedFieldNames: string[] = String(existingVary).split(',');

    for (let fieldName of parsedFieldNames) {
        fieldName = fieldName.trim().toLowerCase();
        if (fieldName)
            mergedFieldNames.add(fieldName);
    }

    return [...mergedFieldNames].join(', ');
}
