/**
 * This module defines the SearchParameter type, which represents the search parameters for
 * finding members in the library system.
 *
 * @packageDocumentation
 */

import { Gender } from '../../generated/prisma/enums.ts';

export type SearchParameter = {
    readonly username?: string;
    readonly firstName?: string;
    readonly lastName?: string;
    readonly emailAddress?: string;
    readonly gender?: Gender;
    readonly dateOfBirth?: string;
    readonly memberSince?: string;
    readonly isStudent?: boolean;
    readonly fantasy?: string;
    readonly thriller?: string;
    readonly scienceFiction?: string;
    readonly crimeNovel?: string;
    readonly nonFiction?: string;
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

const genre_keys = [
    'fantasy',
    'thriller',
    'scienceFiction',
    'crimeNovel',
    'nonFiction',
];

export const isValidGenre = (value: unknown): boolean => {
    return (
        typeof value === 'string' && Object.values(genre_keys).includes(value)
    );
};

export const isValidGender = (value: unknown): boolean => {
    return (
        typeof value === 'string' &&
        Object.values(Gender).includes(value as Gender)
    );
};
