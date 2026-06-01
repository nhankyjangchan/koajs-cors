import { normalizeMaxAge } from '../../src/lib/utils/normalizeMaxAge.ts';

describe('`normalizeMaxAge` function', (): void => {
    it('should return number as string if argument is integer', (): void => {
        const maxAge: string | null = normalizeMaxAge(3_600);
        expect(maxAge).toBe('3600');
    });

    it('should return null if argument is float', (): void => {
        const maxAge: string | null = normalizeMaxAge(3_600.01);
        expect(maxAge).toBe(null);
    });

    it('should return null if argument is not number', (): void => {
        // @ts-ignore
        const maxAge: string | null = normalizeMaxAge('{}');
        expect(maxAge).toBe(null);
    });
});
