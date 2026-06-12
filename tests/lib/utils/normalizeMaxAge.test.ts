import { normalizeMaxAge } from '../../../src/lib/utils/normalizeMaxAge.ts';

describe('`normalizeMaxAge` function', (): void => {
    it('should return number as string if argument is integer', (): void => {
        const maxAge: string | null = normalizeMaxAge(3_600);
        expect(maxAge).toBe('3600');
    });

    it('should return number as string if the argument is a string like integer', (): void => {
        const maxAge: string | null = normalizeMaxAge('3600');
        expect(maxAge).toBe('3600');
    });

    it('should return null if argument is float', (): void => {
        const maxAge: string | null = normalizeMaxAge(3_600.01);
        expect(maxAge).toBe(null);
    });

    it('should return null if the argument is not a string like integer', (): void => {
        const maxAge: string | null = normalizeMaxAge('{}');
        expect(maxAge).toBe(null);
    });

    it('should return null if argument is invalid', (): void => {
        // @ts-ignore
        const maxAge: string | null = normalizeMaxAge({});
        expect(maxAge).toBe(null);
    });

    it('should return null if argument does not exist', (): void => {
        const maxAge: string | null = normalizeMaxAge();
        expect(maxAge).toBe(null);
    });
});
