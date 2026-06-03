import { GraphQLError } from 'graphql';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { JOSEError } from 'jose/errors';
import { keycloakConfig } from '../../config/keycloak.mts';
import { getLogger } from '../../logger/logger.mts';

const { issuer, jwksUri, clientId, audience } = keycloakConfig;
const jwks = createRemoteJWKSet(new URL(jwksUri));
const logger = getLogger('graphql/roles-required', 'file');

// Extract the token from the header
const getToken = (headers: Headers) => {
    const auth = headers.get('Authorization');
    if (!auth?.startsWith('Bearer ')) {
        throw new GraphQLError('Authorization with the given token is wrong', {
            extensions: {
                code: 'UNAUTHENTICATED',
            },
        });
    }
    const token = auth.slice(7);
    logger.debug('getToken: token=%s', token);
    return token;
};

// Verify the given token
const verifyToken = async (token: string) => {
    try {
        return await jwtVerify(token, jwks, {
            issuer,
            audience,
        });
    } catch (err) {
        logger.debug('verifyToken: verifyResult err=%o', err as any);
        if (err instanceof JOSEError) {
            throw new GraphQLError('Token invalid', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                },
            });
        }

        throw new GraphQLError((err as any).message ?? 'Unknown error', {
            extensions: {
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
};

// Get the different roles
const getRollen = (payload: any) => {
    const roles = payload?.resource_access?.[clientId]?.roles;
    if (!Array.isArray(roles)) {
        throw new GraphQLError('Required role does not exists', {
            extensions: {
                code: 'FORBIDDEN',
            },
        });
    }
    logger.debug('getRollen: roles=%o', roles);
    return roles;
};

// Chck the given roles
export const rolesRequired = async (request: Request, ...roles: string[]) => {
    const token = getToken(request.headers);

    let jwt = await verifyToken(token);

    const { payload } = jwt;
    logger.debug('rolesRequired: payload=%o', payload);

    const rollenToken = getRollen(payload);

    const rolleVorhanden = roles.some((role) => rollenToken.includes(role));
    if (!rolleVorhanden) {
        throw new GraphQLError('Required role does not exists', {
            extensions: {
                code: 'FORBIDDEN',
            },
        });
    }

    (request as any).tokenPayload = payload;
};
