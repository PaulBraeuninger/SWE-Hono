/**
 * Module consisting of service for reading operations of library member data.
 * @packageDocumentation
 * @author brpa1033
 */

import { prismaClient } from '../../config/prisma-client.mts';
import { type Prisma } from '../../generated/prisma/client.ts';
import { MemberInclude } from '../../generated/prisma/models.ts';
import { getLogger } from '../../logger/logger.mts';

/** Parameters for finding a member by ID. */
type findByIdParams = {
    readonly id: number;
    readonly includeBooks?: boolean;
};

export type MemberWithAddress = Prisma.MemberGetPayload<{
    include: {
        address: true;
    };
}>;

export type MemberWithAddressAndBooks = Prisma.MemberGetPayload<{
    include: {
        address: true;
        books: true;
    };
}>;

/**
 * Service for reading operations of library member data.
 */
export class MemberReadService {

    readonly #includeAddress: MemberInclude = {
        address: true,
    };
    readonly #includeAddressAndBooks: MemberInclude = {
        address: true,
        books: true,
    };

    readonly #logger = getLogger(MemberReadService.name);

    async findById({
        id, 
        includeBooks
    }: findByIdParams): Promise<Readonly<MemberWithAddressAndBooks>> {
        this.#logger.info(`findById: id=${id}`);

        const include = includeBooks ? this.#includeAddressAndBooks : this.#includeAddress;
        const member: MemberWithAddressAndBooks | null = await prismaClient.member.findUnique({
            where: { id },
            include,
        });

        if (!member) {
            this.#logger.debug(`Member with id ${id} not found`);
            throw new Error(`Member with id=${id} not found`);
        }

        member.interests ??= [];

        this.#logger.debug('findById: member=%o', member);
        return member;
    }

    // TODO Delete this method
    /**
     * Example method for getting a simple string response.
     *
     * @returns 'Hello World'
     */
    async getHelloWorld(): Promise<string> {
        this.#logger.info('getHelloWorld called');

        return 'Hello World';
    }
}
