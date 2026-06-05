import { type Context, type Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import { getLogger } from './logger.mts';

const logger = getLogger('requestLogger', 'func');

/**
 * Hono middleware that logs the HTTP method and URL for each incoming request.
 */
// https://hono.dev/docs/guides/middleware
export const requestLogger = createMiddleware(
    async (c: Context, next: Next) => {
        const { method, url } = c.req;
        logger.debug('method=%s, url=%s', method, url);
        await next();
    },
);
