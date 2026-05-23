import { mergeVaryWithOrigin } from '../src/lib/mergeVaryWithOrigin.ts';

describe('`mergeVaryWithOrigin` function', (): void => {
    it('should return `*` if base header is `*`', (): void => {
        const baseHeader: string = '*';
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('*');
    });

    it('should return `Origin` if base header is empty', (): void => {
        const baseHeader: string = '';
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('Origin');
    });

    it('should return `Origin` if base header has not fields', (): void => {
        const baseHeader: string = ',,';
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('Origin');
    });

    it('should return `Origin` only once', (): void => {
        const baseHeader: string = 'Origin, origin, oRiGin';
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('Origin');
    });

    it('should return `Origin, Accept-Encoding`', (): void => {
        const baseHeader: string = 'Accept-Encoding';
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('Origin, Accept-Encoding');
    });

    it('should return `Origin, User-Agent, Accept-Language`', (): void => {
        const baseHeader: string = 'User-Agent, Accept-Language';
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('Origin, User-Agent, Accept-Language');
    });

    it('should return merged header with stringified base header', (): void => {
        const baseHeader: object = { a: 1, b: undefined };
        // @ts-ignore
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('Origin, [object Object]');
    });
});
