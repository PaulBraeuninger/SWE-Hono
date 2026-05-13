/**
 * Module consisting of router for reading operations of library member data.
 * @packageDocumentation
 * @author brpa1033
 */

import { Hono } from 'hono';
import { container } from '../../container.mts';
import { getLogger } from '../../logger/logger.mts';

const { memberReadService } = container;

/**
 * Router for reading operations for library members.
 *
 * @author brpa1033
 */
export const router = new Hono();
const logger = getLogger('member-read-router', 'file');

router.get('/', async (c) => {
    logger.info('GET /member-read called');

    const message = await memberReadService.getHelloWorld();

    return c.json({ message });
});
