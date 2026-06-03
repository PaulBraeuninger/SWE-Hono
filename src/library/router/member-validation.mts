/**
 * The module `member-validation` defines validation logic for member-related operations.
 * @packageDocumentation
 */

import ISBN from 'isbn3';
import { z } from 'zod';

const MemberAll = z.strictObject({
    id: z.union([z.number().int().gt(0), z.string().regex(/^[1-9]\d*$/u)]),
    username: z.string(),
    last_name: z.string(),
    first_name: z.string(),
    gender: z.enum(['MALE', 'FEMALE', 'DIVERSE']).optional(),
    date_of_birth: z.coerce.date(),
    member_since: z.coerce.date().optional(),
    is_student: z.boolean().optional(),
    email_address: z.email(),
    interests: z
        .array(
            z.enum([
                'FANTASY',
                'SCIENCE_FICTION',
                'CRIME_NOVEL',
                'THRILLER',
                'NON_FICTION',
            ]),
        )
        .optional(),
    address: z.strictObject({
        postal_code: z.string(),
        place: z.string(),
    }),
    books: z
        .array(
            z.strictObject({
                name: z.string(),
                isbn: z
                    .string()
                    .refine((isbn) => ISBN.parse(isbn)?.isValid === true, {
                        message: 'Invalid ISBN',
                    }),
                author: z.string().optional(),
                still_borrowed: z.boolean().optional(),
                genre: z
                    .enum([
                        'FANTASY',
                        'SCIENCE_FICTION',
                        'CRIME_NOVEL',
                        'THRILLER',
                        'NON_FICTION',
                    ])
                    .optional(),
            }),
        )
        .optional(),
    version: z.number().int().gte(0),
    generated: z.coerce.date(),
    updated: z.coerce.date(),
});

export const MemberCreateSchema = MemberAll.omit({
    id: true,
    version: true,
    generated: true,
    updated: true,
}).readonly();

export const MemberUpdateSchema = MemberAll.omit({
    id: true,
    version: true,
    username: true,
    address: true,
    books: true,
    generated: true,
    updated: true,
}).readonly();

export type MemberCreateType = z.infer<typeof MemberCreateSchema>;
export type MemberUpdateType = z.infer<typeof MemberUpdateSchema>;

// -------------------------------------------------------------------------------------------------
// G r a p h Q L   S c h e m a s
// -------------------------------------------------------------------------------------------------
const GraphQLGenreEnum = z.enum([
    'FANTASY',
    'SCIENCE_FICTION',
    'CRIME_NOVEL',
    'THRILLER',
    'NON_FICTION',
]);

const GraphQLInterestsEnum = z.enum([
    'FANTASY',
    'SCIENCE_FICTION',
    'CRIME_NOVEL',
    'THRILLER',
    'NON_FICTION',
]);

const GraphQLAddressSchema = z.strictObject({
    postalCode: z.string(),
    place: z.string(),
});

const GraphQLBookSchema = z.strictObject({
    name: z.string(),
    isbn: z.string().refine((isbn) => ISBN.parse(isbn)?.isValid === true, {
        message: 'Invalid ISBN',
    }),
    author: z.string().optional(),
    genre: GraphQLGenreEnum.optional(),
});

export const MemberCreateGraphQLSchema = z
    .strictObject({
        username: z.string(),
        lastName: z.string(),
        firstName: z.string(),
        gender: z.enum(['MALE', 'FEMALE', 'DIVERSE']).optional(),
        dateOfBirth: z.coerce.date(),
        memberSince: z.coerce.date().optional(),
        isStudent: z.boolean().optional(),
        emailAddress: z.email(),
        interests: z.array(GraphQLInterestsEnum).optional(),
        address: GraphQLAddressSchema.optional(),
        books: z.array(GraphQLBookSchema).optional(),
    })
    .readonly();

export const MemberUpdateGraphQLSchema = z.strictObject({
    username: z.string().optional(),
    lastName: z.string().optional(),
    firstName: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'DIVERSE']).optional(),
    dateOfBirth: z.coerce.date(),
    memberSince: z.coerce.date().optional(),
    isStudent: z.boolean().optional(),
    emailAddress: z.email(),
    interests: z.array(GraphQLInterestsEnum).optional(),
});
