import { GraphQLError } from "graphql";
import { container } from "../../container.mts";
import { getLogger } from "../../logger/logger.mts";
import { MemberWithAddress, MemberWithAddressAndBooks } from "../service/member-read-service.mts";
import { ID, Member, SearchParameterInput, toMemberType, toSearchParameter } from "./types.mts";
import { NotFoundError } from "../service/errors.mts";
import { createPageable } from "../service/pageable.mts";
import { Slice } from "../service/slice.mts";

const logger = getLogger('graphql-query-handler', 'file');

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
