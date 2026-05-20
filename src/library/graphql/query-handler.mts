/**
 * Query handlers for GraphQL resolvers.
 *
 * @packageDocumentation
 */

import { GraphQLError } from "graphql";
import { container } from "../../container.mts";
import { getLogger } from "../../logger/logger.mts";
import { MemberWithAddress, MemberWithAddressAndBooks } from "../service/member-read-service.mts";
import { ID, Member, SearchParameterInput, toMemberType, toSearchParameter } from "./types.mts";
import { NotFoundError } from "../service/errors.mts";
import { createPageable } from "../service/pageable.mts";
import { Slice } from "../service/slice.mts";

const logger = getLogger('graphql-query-handler', 'file');

/**
 * Handles the GraphQL query for fetching a member by ID. It retrieves the member from the database
 * and converts it to the GraphQL Member type. If the member is not found, it throws a GraphQLError
 * with a BAD_USER_INPUT code. For any other errors, it throws a GraphQLError with an INTERNAL_SERVER_ERROR code.
 *
 * @param id - The ID of the member to fetch.
 * @returns The member corresponding to the given ID.
 * @throws GraphQLError if the member is not found or if there is an internal server error.
 */
export const memberHandler = async (id: ID) => {
    logger.debug(`Handling member query for id: ${id}`);

    let member: Member;
    try {
        const memberDB: MemberWithAddressAndBooks = await container.memberReadService.findById({
            id: Number.parseInt(id, 10)
        });
        member = toMemberType(memberDB);
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.debug(`memberHandler: No member found for id: ${id}`);
            throw new GraphQLError(error instanceof Error ? error.message : String(error), {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        const { message } = error as Error;
        throw new GraphQLError(message, {
            extensions: {
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }

    logger.debug('memberHandler: result=%o', member);
    return member;
};

/**
 * Handles the GraphQL query for fetching members using search parameters.
 * It retrieves the members from the database and converts them to the GraphQL Member type.
 * If no members are found, it throws a GraphQLError with a BAD_USER_INPUT code.
 * For any other errors, it throws a GraphQLError with an INTERNAL_SERVER_ERROR code.
 *
 * @param input - The search parameters for filtering members.
 * @returns A list of members matching the search criteria.
 * @throws GraphQLError if no members are found or if there is an internal server error.
 */
export const membersHandler = async (
    input?: SearchParameterInput | undefined,
) => {
    logger.debug('Handling members query with input: %o', input ?? 'undefined');
    const pageable = createPageable({});
    const searchParams = toSearchParameter(input);

    let memberSlice: Readonly<Slice<Readonly<MemberWithAddress>>>;

    try {
        memberSlice = await container.memberReadService.find(
            searchParams,
            pageable,
        );
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.debug('membersHandler: No members found');
            throw new GraphQLError(error instanceof Error ? error.message : String(error), {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        const { message } = error as Error;
        throw new GraphQLError(message, {
            extensions: {
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
    logger.debug('membersHandler: slice=%o', memberSlice);

    const result = memberSlice.content.map((member) =>
        toMemberType(member as MemberWithAddressAndBooks),);
    logger.debug('membersHandler: result=%o', result);
    return result;
}
