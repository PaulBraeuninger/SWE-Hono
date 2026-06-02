import { GraphQLError } from 'graphql';
import { container } from '../../container.mts';
import { getLogger } from '../../logger/logger.mts';
import {
    MemberCreateGraphQLSchema,
    MemberUpdateGraphQLSchema,
} from '../router/member-validation.mts';
import { NotFoundError } from '../service/errors.mts';
import {
    type CreateMemberInput,
    type UpdateMemberInput,
    type CreatePayload,
    type UpdatePayload,
    toCreate,
    toUpdate,
    toID,
    toInt,
    toNumber,
} from './types.mts';

const logger = getLogger('graphql-mutation-handler', 'file');
const { memberWriteService, keycloakService } = container;

// --------------------------------------------------------------------------------------------------------------------
// C R E A T E
// --------------------------------------------------------------------------------------------------------------------
const validateMemberCreate = (member: CreateMemberInput) => {
    try {
        MemberCreateGraphQLSchema.parse(member);
    } catch (err) {
        if (err instanceof Error) {
            const { message } = err;
            if (err.name === 'ZodError') {
                logger.error('Validation error: %s', message);
                throw new GraphQLError(message, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            } else {
                logger.error('Validation error: %s', message);
                throw new GraphQLError(message, {
                    extensions: {
                        code: 'INTERNAL_SERVER_ERROR',
                    },
                });
            }
        } else {
            logger.error(`Unknown validation error: ${err}`);
            throw new GraphQLError('Unknown error', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                },
            });
        }
    }

    logger.debug('validateMemberCreate: ok');
};

export const createHandler = async (
    input: CreateMemberInput,
): Promise<CreatePayload> => {
    logger.debug('createHandler: input=%o', input);

    validateMemberCreate(input);

    const member = toCreate(input);
    logger.debug('createHandler: member=%o', member);
    const id = await memberWriteService.create(member);

    logger.debug('createHandler: id=%d', id);
    return { id: toID(id) };
};

// --------------------------------------------------------------------------------------------------------------------
// U P D A T E
// --------------------------------------------------------------------------------------------------------------------
const validateMemberUpdate = (member: UpdateMemberInput) => {
    try {
        MemberUpdateGraphQLSchema.parse(member);
    } catch (err) {
        if (err instanceof Error) {
            const { message } = err;
            if (err.name === 'ZodError') {
                throw new GraphQLError(message, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            } else {
                throw new GraphQLError(message, {
                    extensions: {
                        code: 'INTERNAL_SERVER_ERROR',
                    },
                });
            }
        } else {
            throw new GraphQLError('Unknown error', {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                },
            });
        }
    }

    logger.debug('validateMemberUpdate: ok');
};

export const updateHandler = async (
    input: UpdateMemberInput,
): Promise<UpdatePayload> => {
    logger.debug('updateHandler: input=%o', input);

    validateMemberUpdate(input);

    const updatedMember = toUpdate(input);
    logger.debug('updateHandler: update=%o', updatedMember);

    let version: number | undefined;
    try {
        version = await memberWriteService.update({
            id: toNumber(input.id),
            member: updatedMember,
            version: `"${input.version}"`,
        });
    } catch (err) {
        if (err instanceof NotFoundError) {
            logger.debug(
                'updateHandler: member with ID: %s not found',
                input.id,
            );
            throw new GraphQLError(err.message, {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
    }

    logger.debug('updateHandler: version=%s', version);
    return { version: toInt(version ?? 0) };
};

// --------------------------------------------------------------------------------------------------------------------
// S E C U R I T Y
// --------------------------------------------------------------------------------------------------------------------
export const tokenHandler = async ({
    username,
    password,
}: {
    username: string;
    password: string;
}) => {
    logger.debug('tokenHandler: username=%s', username);
    const token = await keycloakService.token({ username, password });
    if (token === undefined) {
        throw new GraphQLError('Invalid credentials', {
            extensions: {
                code: 'BAD_USER_INPUT',
            },
        });
    }
    logger.debug('tokenHandler: token=%o', token);
    return token;
};
