import { addOriginToVary } from '../../../src/lib/utils/addOriginToVary';

describe('`addOriginToVary` function', (): void => {
    it('should return `*` if base header is `*`', (): void => {
        const baseHeader: string = '*';
        const mergedVary: string = addOriginToVary(baseHeader);
        expect(mergedVary).toBe('*');
    });

    it('should return `origin` if base header is empty', (): void => {
        const baseHeader: string = '';
        const mergedVary: string = addOriginToVary(baseHeader);
        expect(mergedVary).toBe('origin');
    });

    it('should return `origin` if base header has not fields', (): void => {
        const baseHeader: string = ',,';
        const mergedVary: string = addOriginToVary(baseHeader);
        expect(mergedVary).toBe('origin');
    });

    it('should return `origin` only once', (): void => {
        const baseHeader: string = 'Origin, origin, oRiGin';
        const mergedVary: string = addOriginToVary(baseHeader);
        expect(mergedVary).toBe('origin');
    });

    it('should concatenate the headers correctly and return `origin, accept-encoding`', (): void => {
        const baseHeader: string = 'Accept-Encoding';
        const mergedVary: string = addOriginToVary(baseHeader);
        expect(mergedVary).toBe('origin, accept-encoding');
    });

    it('should concatenate the headers correctly and return `origin, user-agent, accept-language`', (): void => {
        const baseHeader: string = 'User-Agent, Accept-Language';
        const mergedVary: string = addOriginToVary(baseHeader);
        expect(mergedVary).toBe('origin, user-agent, accept-language');
    });

    it('should return merged header with stringified base header, if base header is not string', (): void => {
        const baseHeader: object = { koa: 'the best', I: 'love it', prop: null };
        const mergedVary: string = addOriginToVary(baseHeader);
        expect(mergedVary).toBe('origin, [object object]');
    });

    it('should return merged header with headers always in lowercase', (): void => {
        const baseHeader: string = 'X-Api, USER-AGENT';
        const mergedVary: string = addOriginToVary(baseHeader);
        expect(mergedVary).toBe('origin, x-api, user-agent');
    });
});
