import { createSchema, createYoga } from 'graphql-yoga';
import { Hono } from 'hono';
import { getLogger } from '../../logger/logger.mts';
import {
    createHandler,
    updateHandler,
    tokenHandler,
} from './mutation-handler.mts';
// TODO: import { rolesRequired } from '../../security/roles-required.mts';
import {
    type CreateMemberInput,
    type UpdateMemberInput,
    ID,
} from './types.mts';

const logger = getLogger('graphql-app', 'file');
type GraphQLContext = {
    request: Request;
};

const resolvers = {
    Mutation: {
        create: async (
            _: unknown,
            { input }: { input: CreateMemberInput },
            { request }: GraphQLContext,
        ) => {
            // TODO: await rolesRequired(request, 'admin', 'user');
            return createHandler(input);
        },
        update: async (
            _: unknown,
            { input }: { input: UpdateMemberInput },
            { request }: GraphQLContext,
        ) => {
            // TODO: await rolesRequired(request, 'admin', 'user');
            return updateHandler(input);
        },
        token: async (
            _: unknown,
            { username, password }: { username: string; password: string },
        ) => tokenHandler({ username, password }),
    },
};
