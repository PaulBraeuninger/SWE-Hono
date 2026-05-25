import { GraphQLError } from 'graphql';
import { container } from '../../container.mts';
import { getLogger } from '../../logger/logger.mts';
import { MemberCreateSchema } from '../router/member-validation.mts';
import { NotFoundError } from '../service/errors.mts';
import {
    type CreateMemberInput,
    type UpdateMemberInput,
    type CreatePayload,
    type DeletePayload,
    type ID,
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
        MemberCreateSchema.parse(member);
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
