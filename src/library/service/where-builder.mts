/**
 * This module contains the class {@linkcode WhereBuilder}, 
 * which is responsible for building the `where` clause for Prisma queries based on the provided search parameters.
 * @packageDocumentation
 */

import { Gender } from "../../generated/prisma/enums.ts";
import { MemberWhereInput } from "../../generated/prisma/models.ts";
import { getLogger } from "../../logger/logger.mts";
import { SearchParameter } from "./searchparams.mts";

export type BuildIDParams = {
    readonly id: number;
    readonly includeBooks?: boolean;
}

const logger = getLogger('buildWhere', 'func');

/**
 * Builds the `where` clause for Prisma queries based on the provided search parameters.
 * @param searchparams - The search parameters to build the `where` clause from.
 * @returns The `where` clause for Prisma queries.
 */
export const buildWhere = ({
    ...searchparams
}: SearchParameter) => {
    logger.debug('buildWhere: searchparams=%o', searchparams);

    const where: MemberWhereInput = {};

    Object.entries(searchparams).forEach(([key, value])  => {
        switch(key) {
            case 'username':
                where.username = { equals: value as string};
                break;
            case 'firstName':
                where.firstName = { equals: value as string};
                break;
            case 'lastName':
                where.lastName = { equals: value as string};
                break;
            case 'emailAddress':
                where.emailAddress = { equals: value as string};
                break;
            case 'gender':
                where.gender = { equals: value as Gender};
                break;
            case 'dateOfBirth':
                where.dateOfBirth = { equals: new Date(value as string) };
                break;
            case 'memberSince':
                where.memberSince = { equals: new Date(value as string) };
                break;
            case 'isStudent':
                where.isStudent = { equals: value as boolean };
                break;
            case 'interests': // TODO Revision: Does this work?
                if (Array.isArray(value) && value.length > 0) {
                    where.interests = {
                        hasSome: value
                    };
                }
                break;
        }
    });
    logger.debug('buildWhere: where=%o', where);

    return where;
}
