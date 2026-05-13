/**
 * Module consisting of router for reading operations of library member data.
 * @packageDocumentation
 * @author brpa1033
 */

import { Hono } from 'hono';
import { container } from '../../container.mts';
import { getLogger } from '../../logger/logger.mts';
import { createPageable } from '../service/pageable.mts';
import { createPage } from './page.mts';

const { memberReadService } = container;

/**
 * Router for reading operations for library members.
 *
 * @author brpa1033
 */
export const router = new Hono();
const logger = getLogger('member-read-router', 'file');

/**
 * Searching for a member using path parameter.
 */
router.get('/:id', async (c) => {
    const { req } = c;
    const accept = req.header('Accept')?.toLowerCase() ?? '*/*';

    if (accept !== '*/*' && !/json|html/u.test(accept)) {
        logger.debug('get: Accept=%s', accept);
        return c.body(null, 406);
    }

    const id = c.req.param('id');
    logger.debug('get: id=%s', id);
    const idAsNumber = Number.parseInt(id, 10);
    if (Number.isNaN(idAsNumber)) {
        logger.debug('get: id=%s is not a valid number', id);
        return c.notFound();
    }
    
    const member = await memberReadService.findById({ id: idAsNumber });

    const ifNonMatch = req.header('If-None-Match');
    const { version } = member;
    if (ifNonMatch === `"${version}"`) {
        logger.debug('get: ETag matches, returning 304 Not Modified');
        return c.body(null, 304);
    }

    logger.debug(`get: version=${version}`);

    const { header, json } = c;
    header('ETag', `"${version}"`);

    logger.debug('get: %o', member);

    return json(member);
});

/**
 * Searching for members using query parameters.
 */
router.get('/', async (c) => {
    const { req } = c;
    const accept = req.header('Accept')?.toLowerCase() ?? '*/*';
    if (accept !== '*/*' && !/json|html/u.test(accept)) {
        logger.debug('get: Accept=%s', accept);
        return c.body(null, 406);
    }

    const queryParams = req.query();
    logger.debug('get: queryParams=%o', queryParams);

    const countOnly = queryParams['countOnly'];
    if (typeof countOnly !== 'undefined') {
        const count = await memberReadService.count();
        logger.debug('get: count=%d', count);
        return c.json({ count });
    }

    const { page, size } = queryParams;
    delete queryParams['page'];
    delete queryParams['size'];
    logger.debug('get: page=%s, size=%s, queryParams=%o', page, size, queryParams);

    const pageable = createPageable({ number: page, size });
    const memberSlice = await memberReadService.find(queryParams, pageable);
    const memberPage = createPage(memberSlice, pageable);
    logger.debug('get: memberPage=%o', memberPage);

    return c.json(memberPage);
});
