/**
 * This module contains the class {@linkcode WhereBuilder},
 * which is responsible for building the `where` clause for Prisma queries based on the provided search parameters.
 * @packageDocumentation
 */
import { Gender } from '../../generated/prisma/enums.ts';
import { MemberWhereInput } from '../../generated/prisma/models.ts';
import { getLogger } from '../../logger/logger.mts';
import { SearchParameter } from './searchparams.mts';

const buildInterests = ({
    fantasy,
    thriller,
    scienceFiction,
    crimeNovel,
    nonFiction,
}: {
    fantasy: string | undefined;
    thriller: string | undefined;
    scienceFiction: string | undefined;
    crimeNovel: string | undefined;
    nonFiction: string | undefined;
}): ReadonlyArray<string> => {
    const interests: string[] = [];

    if (fantasy?.toLowerCase() === 'true') {
        interests.push('FANTASY');
    }
    if (thriller?.toLowerCase() === 'true') {
        interests.push('THRILLER');
    }
    if (scienceFiction?.toLowerCase() === 'true') {
        interests.push('SCIENCE_FICTION');
    }
    if (crimeNovel?.toLowerCase() === 'true') {
        interests.push('CRIME_NOVEL');
    }
    if (nonFiction?.toLowerCase() === 'true') {
        interests.push('NON_FICTION');
    }

    return interests;
};

export type BuildIDParams = {
    readonly id: number;
    readonly includeBooks?: boolean;
};

const logger = getLogger('buildWhere', 'func');

/**
 * Builds the `where` clause for Prisma queries based on the provided search parameters.
 * @param searchparams - The search parameters to build the `where` clause from.
 * @returns The `where` clause for Prisma queries.
 */
export const buildWhere = ({
        fantasy,
        thriller,
        scienceFiction,
        crimeNovel,
        nonFiction,
        ...restProperties
    }: SearchParameter) => {

    logger.debug('buildWhere: fantasy=%s, thriller=%s, scienceFiction=%s, crimeNovel=%s, nonFiction=%s, restProperties=%o',
        fantasy, thriller, scienceFiction, crimeNovel, nonFiction, restProperties);

    const where: MemberWhereInput = {};

    Object.entries(restProperties).forEach(([key, value]) => {
        switch (key) {
            case 'username':
                where.username = { equals: value as string };
                break;
            case 'firstName':
                where.firstName = { equals: value as string };
                break;
            case 'lastName':
                where.lastName = { equals: value as string };
                break;
            case 'emailAddress':
                where.emailAddress = { equals: value as string };
                break;
            case 'gender':
                where.gender = { equals: value as Gender };
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
        }
    });

    const interests = buildInterests({
        fantasy,
        thriller,
        scienceFiction,
        crimeNovel,
        nonFiction,
    });

    if (interests.length > 0) {
        where.interests = { array_contains: interests };
    }

    logger.debug('buildWhere: where=%o', where);

    return where;
};
