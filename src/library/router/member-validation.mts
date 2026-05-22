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

export const MemberUpdateGraphQLSchema = MemberAll.omit({
    username: true,
    email_address: true,
}).readonly();

export type MemberCreateType = z.infer<typeof MemberCreateSchema>;
export type MemberUpdateType = z.infer<typeof MemberUpdateSchema>;
