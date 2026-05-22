import { type Context, type HonoRequest, type Next } from 'hono';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { JOSEError } from 'jose/errors';
import { keycloakConfig } from '../config/keycloak.mts';
import { getLogger } from '../logger/logger.mts';
import {
    ForbiddenError,
    InternalServerError,
    UnauthorizedError,
} from './errors.mts';

const logger = getLogger('roles-required', 'file');

type Rolle = 'admin' | 'user';

const { issuer, jwksUri, clientId, audience } = keycloakConfig;
const jwks = createRemoteJWKSet(new URL(jwksUri));

// Extract token from the request header.
const getToken = (req: HonoRequest) => {
    const auth = req.header('Authorization');
    if (!auth?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Authorization fehlt im Header');
    }
    const token = auth.slice(7);
    logger.debug('getToken: token=%s', token);
    return token;
};

// Decode Base64 to JSON and verify.
const verifyToken = async (token: string) => {
    try {
        // https://github.com/panva/jose/blob/main/docs/jwt/verify/functions/jwtVerify.md
        // iat, exp, and nbf are verified implicitly.
        return await jwtVerify(token, jwks, {
            // See properties within the token payload.
            issuer,
            audience,
        });
    } catch (err) {
        logger.debug('verifyToken: verifyResult err=%o', err as object);
        if (err instanceof JOSEError) {
            // Derived errors: JWTClaimValidationFailed, JWTExpired, ...
            throw new UnauthorizedError('Token nicht (mehr) gueltig');
        }
        throw new InternalServerError();
    }
};

// Extract roles from the verified JWT payload.
// {
//   "exp": ...,
//   "iat": ...,
//   ...
//   "resource_access": {
//     "javascript-client": {
//       "roles": ["admin"]
//     }
const getRollen = (payload: any) => {
    const roles = payload?.resource_access?.[clientId]?.roles;
    if (!Array.isArray(roles)) {
        throw new ForbiddenError('Keine Rolle im Token enthalten');
    }
    logger.debug('getRollen: roles=%o', roles);
    return roles;
};

/**
 * Middleware: at least one required role must be present in the token.
 * Validates JWT audience, expiration, and roles.
 * @param roles Roles as individual string arguments
 */
export const rolesRequired = (...roles: Rolle[]) => {
    // @ts-ignore
    return async (c: Context, next: Next) => {
        const { req } = c;

        // Extract token from the request header.
        const token = getToken(req);

        // Decode Base64 to JSON and verify.
        const verifyResult = await verifyToken(token);
        if (verifyResult instanceof Response) {
            return verifyResult;
        }

        // Extract payload from the verified JWT.
        const { payload } = verifyResult;
        logger.debug('rolesRequired: payload=%o', payload);

        // Extract roles from payload.resource_access.CLIENT_ID.roles.
        const rollenResult = getRollen(payload);

        // Is one of the required roles present in the payload?
        const rolleVorhanden = roles.some((role) =>
            rollenResult.includes(role),
        );
        if (!rolleVorhanden) {
            throw new ForbiddenError('Erforderliche Rolle nicht vorhanden');
        }

        // Store payload on request for potential later processing.
        (req as any).tokenPayload = payload;

        await next();
    };
};
