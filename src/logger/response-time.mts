import { type Context, type Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import { getLogger } from './logger.mts';

const logger = getLogger('responseTime', 'func');

/**
 * Hono middleware that logs processing time and status code before sending a
 * response.
 */
// https://hono.dev/docs/guides/middleware
export const responseTime = createMiddleware(async (c: Context, next: Next) => {
    // Temporal (Stage 3) instead of Date
    // https://github.com/tc39/proposal-temporal
    // https://bugs.webkit.org/show_bug.cgi?id=223166
    // https://github.com/oven-sh/bun/issues/15853
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    logger.debug('Response time: %d ms, %d', duration, c.res.status);
});
