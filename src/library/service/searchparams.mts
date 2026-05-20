/**
 * This module defines the SearchParameter type, which represents the search parameters for
 * finding members in the library system.
 *
 * @packageDocumentation
 */

import { Gender, Genre } from '../../generated/prisma/enums.ts';

export type SearchParameter = {
    readonly username?: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly emailAddress?: string;
    readonly gender?: Gender;
    readonly dateOfBirth?: string;
    readonly memberSince?: string;
    readonly isStudent?: boolean;
    readonly interests?: Genre[]; // TODO Revision: Does this work?
};

export const searchParameterNames = [
    'username',
    'firstName',
    'lastName',
    'emailAddress',
    'gender',
    'dateOfBirth',
    'memberSince',
    'isStudent',
    'interests',
];

export const isValidGenre = (value: unknown): boolean => {
    return (
        typeof value === 'string' &&
        Object.values(Genre).includes(value as Genre)
    );
};

export const isValidGender = (value: unknown): boolean => {
    return (
        typeof value === 'string' &&
        Object.values(Gender).includes(value as Gender)
    );
};
