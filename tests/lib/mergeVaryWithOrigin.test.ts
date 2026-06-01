import { mergeVaryWithOrigin } from '../../src/lib/utils/mergeVaryWithOrigin.ts';

describe('`mergeVaryWithOrigin` function', (): void => {
    it('should return `*` if base header is `*`', (): void => {
        const baseHeader: string = '*';
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('*');
    });

    it('should return `origin` if base header is empty', (): void => {
        const baseHeader: string = '';
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('origin');
    });

    it('should return `origin` if base header has not fields', (): void => {
        const baseHeader: string = ',,';
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('origin');
    });

    it('should return `origin` only once', (): void => {
        const baseHeader: string = 'Origin, origin, oRiGin';
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('origin');
    });

    it('should return `origin, accept-encoding`', (): void => {
        const baseHeader: string = 'Accept-Encoding';
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('origin, accept-encoding');
    });

    it('should return `origin, user-agent, accept-language`', (): void => {
        const baseHeader: string = 'User-Agent, Accept-Language';
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('origin, user-agent, accept-language');
    });

    it('should return merged header with stringified base header', (): void => {
        const baseHeader: object = { a: 1, b: undefined };
        // @ts-ignore
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('origin, [object object]');
    });

    it('should return merged header with lowercased headers', (): void => {
        const baseHeader: string = 'X-Api, X-Vue-App';
        const mergedVary: string = mergeVaryWithOrigin(baseHeader);
        expect(mergedVary).toBe('origin, x-api, x-vue-app');
    });
});
