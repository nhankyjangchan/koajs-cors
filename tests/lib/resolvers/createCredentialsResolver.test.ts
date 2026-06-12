import { createCredentialsResolver } from '../../../src/lib/resolvers/createCredentialsResolver';
import type { Plugin } from '../../../src/_types/pluginTypes';

describe('`createCredentialsResolver` function', (): void => {
    it('should return `staticCredentials` strategy if options.credentials is `boolean`', (): void => {
        const credentials: Plugin.Credentials = true;
        const strategy: Plugin.Predicate = createCredentialsResolver(credentials);
        expect(strategy.name).toBe('staticCredentials');
    });

    it('should return `resolveDynamicCredentials` strategy if options.credentials is `function`', (): void => {
        const credentials: Plugin.Predicate = (): boolean => true;
        const strategy: Plugin.Predicate = createCredentialsResolver(credentials);
        expect(strategy.name).toBe('resolveDynamicCredentials');
    });

    it('should return `staticCredentials` strategy if options.credentials has another type', (): void => {
        const credentials: object = {};
        // @ts-ignore
        const strategy: Plugin.Predicate = createCredentialsResolver(credentials);
        expect(strategy.name).toBe('staticCredentials');
    });

    it('should return `staticCredentials` strategy if options.credentials does not exist', (): void => {
        const strategy: Plugin.Predicate = createCredentialsResolver();
        expect(strategy.name).toBe('staticCredentials');
    });
});
