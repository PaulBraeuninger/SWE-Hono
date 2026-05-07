import { Hono } from 'hono';

/**
 * Module consists of router for Liveness and Readiness.
 * 
 * @packageDocumentation
 * @author brpa1033
 */

export const router = new Hono();

router.get('/liveness', (c) => {
    return c.json({ status: 'alive' });
});

router.get('/readiness', (c) => {
    return c.json({ status: 'ready' });
});