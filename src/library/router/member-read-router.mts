/**
 * Router for reading operations for library members.
 * 
 * @author brpa1033
 */

import { Hono } from 'hono';
import { container } from '../container.mts';
import { getLogger } from '../logger/logger.mts';

export const router = new Hono();
const logger = getLogger('member-read-router', 'file');

router.get('/', async (c) => {
    
});