import { createSchema, createYoga } from 'graphql-yoga';
import { Hono } from 'hono';
import { getLogger } from '../../logger/logger.mts';
import { createHandler, tokenHandler } from './mutation-handler.mts';
import { rolesRequired } from './roles-required.mts';
import { type CreateMemberInput, typeDefs } from './types.mts';

const logger = getLogger('graphql-app', 'file');
type GraphQLContext = {
    request: Request;
};

// --------------------------------------------------------------------------------------------------------------------
// R e s o l v e r s
// --------------------------------------------------------------------------------------------------------------------
const resolvers = {
    Mutation: {
        createMember: async (
            _: unknown,
            { input }: { input: CreateMemberInput },
            { request }: GraphQLContext,
        ) => {
            await rolesRequired(request, 'admin', 'user');
            return createHandler(input);
        },
        login: async (
            _: unknown,
            { username, password }: { username: string; password: string },
        ) => tokenHandler({ username, password }),
    },
};

// --------------------------------------------------------------------------------------------------------------------
// Y o g a   S e r v e r
// --------------------------------------------------------------------------------------------------------------------
const yogaServer = createYoga({
    schema: createSchema({ typeDefs, resolvers }),
});

// --------------------------------------------------------------------------------------------------------------------
// H o n o   A p p
// --------------------------------------------------------------------------------------------------------------------
export const app = new Hono();

app.post('/graphql', async (c) => {
    logger.debug('/graphql');
    const { raw } = c.req;
    const { body } = raw;

    const response = await yogaServer.fetch(raw, { body });
    logger.debug('/graphql: response=%j', response);

    return c.newResponse(response.body, response);
});

export const graphqlApp = app;
