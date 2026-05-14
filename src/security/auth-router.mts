/**
 * This module provides the router for authentication on the REST API.
 * @packageDocumentation
 */

// eslint-disable-next-line max-classes-per-file
import { Hono } from 'hono';
import { paths } from '../config/paths.mts';
import { container } from '../container.mts';
import { getLogger } from '../logger/logger.mts';
import { createProblemDetails, unauthorized } from '../problem-details.mts';

const logger = getLogger('auth-router', 'file');
const keycloakService = container.keycloakService;

/** Entity class for token data. */
export class TokenData {
    /** Username */
    username: string | undefined;

    /** Password */
    password: string | undefined;
}

/**
 * Router for authentication on the REST API.
 */
export const router = new Hono();

router.post(paths.token, async (c) => {
    const body: Record<string, string> = await c.req.parseBody();
    const username = body['username'];
    const password = body['password'];
    logger.debug('post: username=%s', username);

    const result = await keycloakService.token({
        username,
        password,
    });
    if (result === undefined) {
        return createProblemDetails(
            c,
            unauthorized,
            'Fehler beim Authentifizieren',
        );
    }

    return c.json(result);
});
