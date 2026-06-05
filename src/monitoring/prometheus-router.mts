import { Hono } from 'hono';
import { register } from 'prom-client';

/**
 * Router for Prometheus metrics.
 */
export const router = new Hono();

router.get('/', async (c) => {
    return c.text(await register.metrics(), 200, {
        'Content-Type': register.contentType,
    });
});
