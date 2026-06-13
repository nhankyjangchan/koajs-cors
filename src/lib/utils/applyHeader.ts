import type { Headers } from '@lib/types';
import type { Context } from 'koa';

/**
 * @internal
 */
export function applyHeader(
    ctx: Context,
    headers: Headers,
    field: string,
    value: string
): void {
    ctx.set(field, value);
    headers[field] = value;
}
