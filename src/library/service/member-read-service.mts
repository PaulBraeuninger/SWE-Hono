/**
 * Module consisting of service for reading operations of library member data.
 * @packageDocumentation
 * @author brpa1033
 */

import { prismaClient } from '../../config/prisma-client.mts';
import { type Prisma } from '../../generated/prisma/client.ts';
import { MemberInclude } from '../../generated/prisma/models.ts';
import { NotFoundError } from './errors.mts';
import { getLogger } from '../../logger/logger.mts';
import { Pageable } from './pageable.mts';
import {
    isValidGender,
    isValidGenre,
    SearchParameter,
    searchParameterNames,
} from './searchparams.mts';
import { Slice } from './slice.mts';
import { buildWhere } from './where-builder.mts';

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

    /**
     * Finds a member by their ID.
     * @param id - The ID of the member to find.
     * @param includeBooks - Whether to include the member's books in the response.
     * @returns The member with the specified ID, including their address and optionally their books.
     */
    async findById({
        id,
        includeBooks,
    }: findByIdParams): Promise<Readonly<MemberWithAddressAndBooks>> {
        this.#logger.debug(`findById: id=${id}`);

        const include = includeBooks
            ? this.#includeAddressAndBooks
            : this.#includeAddress;
        const member: MemberWithAddressAndBooks | null =
            await prismaClient.member.findUnique({
                where: { id },
                include,
            });

        if (member === null) {
            this.#logger.debug(`Member with id ${id} not found`);
            throw new Error(`Member with id=${id} not found`);
        }

        member.interests ??= [];

        this.#logger.debug('findById: member=%o', member);
        return member;
    }

    /**
     * Finds members based on the provided search parameters and pagination information.
     * @param searchparameter - The search parameters to filter members by.
     * @param pageable - The pagination information for the query.
     * @returns A slice of members that match the search parameters and pagination information.
     */
    async find(
        searchparameter: SearchParameter | null,
        pageable: Pageable,
    ): Promise<Readonly<Slice<Readonly<MemberWithAddress>>>> {
        this.#logger.debug(
            'find: searchparameter=%s, pageable=%o',
            JSON.stringify(searchparameter),
            pageable,
        );

        if (searchparameter === null) {
            return await this.#findAll(pageable);
        }

        const keys = Object.keys(searchparameter) as (keyof SearchParameter)[];
        if (keys.length === 0) {
            return await this.#findAll(pageable);
        }

        if (!this.#isSearchParamValid(searchparameter)) {
            this.#logger.debug('find: Invalid search parameters');
            throw new NotFoundError('Invalid search parameters');
        }

        const where = buildWhere(searchparameter);
        const { number, size } = pageable;
        const members: MemberWithAddress[] = await prismaClient.member.findMany(
            {
                where,
                skip: number * size,
                take: size,
                include: this.#includeAddress,
            },
        );
        if (members.length === 0) {
            this.#logger.debug(
                'find: No members found with given search parameters',
            );
            throw new NotFoundError(
                `No members found with: ${JSON.stringify(searchparameter)}, page ${number}`,
            );
        }
        const totalElements = await this.count(where);
        return this.#createSlice(members, totalElements);
    }

    /**
     * Counts the number of members that match the provided `where` clause.
     * @param where - The `where` clause to filter members by.
     * @returns The number of members that match the provided `where` clause.
     */
    async count(where?: Prisma.MemberWhereInput) {
        this.#logger.debug('count: where=%o', where ?? 'undefined');
        const { count } = prismaClient.member;
        const number =
            where === undefined ? await count() : await count({ where });
        this.#logger.debug('count: number=%d', number);
        return number;
    }

    async #findAll(
        pageable: Pageable,
    ): Promise<Readonly<Slice<Readonly<MemberWithAddress>>>> {
        this.#logger.debug('findAll: pageable=%o', pageable);
        const { number, size } = pageable;
        const members: MemberWithAddress[] = await prismaClient.member.findMany(
            {
                skip: number * size,
                take: size,
                include: this.#includeAddress,
            },
        );
        if (members.length === 0) {
            this.#logger.debug('findAll: No members found');
            throw new NotFoundError(`Invalid page "${number}"`);
        }
        const totalElements = await this.count();
        return this.#createSlice(members, totalElements);
    }

    #createSlice(
        members: MemberWithAddress[],
        totalElements: number,
    ): Readonly<Slice<MemberWithAddress>> {
        const membersDTO = members.map((member) => {
            member.interests ??= [];
            return member;
        });
        const slice: Slice<MemberWithAddress> = {
            content: membersDTO,
            totalElements,
        };
        this.#logger.debug('createSlice: slice=%o', slice);
        return slice;
    }

    #isSearchParamValid(searchparameter: SearchParameter): boolean {
        let isValid = true;
        const keys = Object.keys(searchparameter) as (keyof SearchParameter)[];
        keys.forEach((key) => {
            if (!searchParameterNames.includes(key) && !isValidGenre(key)) {
                isValid = false;
                this.#logger.debug(`Invalid search parameter: ${key}`);
            }
        });

        if (!isValid) {
            isValid = this.#checkGender(searchparameter);
        }

        return isValid;
    }

    #checkGender(searchparam: SearchParameter): boolean {
        const { gender } = searchparam;
        this.#logger.debug(`checkGender: gender=%s`, gender ?? 'undefined');

        return gender === undefined || isValidGender(gender);
    }
}
