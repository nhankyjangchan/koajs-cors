import { createOriginResolver } from '../../../src/lib/resolvers/createOriginResolver';
import type { Plugin } from '../../../src/_types/pluginTypes';

describe('`createOriginResolver` function', (): void => {
    it('should return `matchExactOrigin` strategy if options.origin is `string`', (): void => {
        const origin: string = 'http://koajs.com';
        const strategy: Plugin.OriginResolver = createOriginResolver(origin);
        expect(strategy.name).toBe('matchExactOrigin');
    });

    it('should return `resolveDynamicOrigin` strategy if options.origin is `function`', (): void => {
        // @ts-ignore
        const origin: Plugin.ComputeOrigin = (): void => {};
        const strategy: Plugin.OriginResolver = createOriginResolver(origin);
        expect(strategy.name).toBe('resolveDynamicOrigin');
    });

    it('should return `matchOriginFromList` strategy if options.origin is `Set`', (): void => {
        const origin: Set<string> = new Set();
        const strategy: Plugin.OriginResolver = createOriginResolver(origin);
        expect(strategy.name).toBe('matchOriginFromList');
    });

    it('should return `rejectRequest` strategy if options.origin has another type', (): void => {
        const origin: object = {};
        // @ts-ignore
        const strategy: Plugin.OriginResolver = createOriginResolver(origin);
        expect(strategy.name).toBe('rejectRequest');
    });

    it('should return `rejectRequest` strategy if options.origin does not exist', (): void => {
        const strategy: Plugin.OriginResolver = createOriginResolver();
        expect(strategy.name).toBe('rejectRequest');
    });
});
