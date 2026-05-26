/**
 * Types and type definitions for GraphQL schema and resolvers.
 *
 * @packageDocumentation
 */

import { MemberWithAddressAndBooks } from '../service/member-read-service.mts';
import {
    MemberCreate,
    MemberUpdate,
} from '../service/member-write-service.mts';
import { SearchParameter } from '../service/searchparams.mts';

export type ID = string & { readonly __brand: 'ID' };
export type Int = number & { readonly __brand: 'Int' };

export const toID = (value: string | number): ID => {
    if (typeof value === 'string') {
        return value as ID;
    }
    return value.toString() as ID;
};

export const toInt = (num: number): Int =>
    (Number.isInteger(num) ? num : Math.round(num)) as Int;
export const toNumber = (id: ID): number => Number.parseInt(id, 10);
const toDateOrNull = (dateStr: string | Date): Date | null =>
    dateStr === undefined || dateStr === null ? null : new Date(dateStr);

export const typeDefinitions = `

    "Root query type providing read access to members"
    type Query {
        "Returns a single member by its ID"
        member(id: ID!): Member!

        "Returns a paginated list of members with optional filtering"
        members(input: SearchParameterInput): [Member!]!
    }

    type Mutation {
        "Creates a new member with the provided details"
        createMember(input: CreateMemberInput!): CreatePayload
        updateMember(id: ID!, version: Int!, input: CreateMemberInput!): UpdatePayload
        deleteMember(id: ID!, version: Int!): DeletePayload
        login(username: String!, password: String!): TokenPayload
    }

    "Represents a library member as aggregate root"
    type Member {
        id: ID!
        version: Int!
        username: String!
        firstName: String!
        lastName: String!
        gender: Gender
        dateOfBirth: String!
        memberSince: String
        isStudent: Boolean
        emailAddress: String!
        interests: [String!]
        address: Address
        books: [Book!]!
    }

    "Represents a postal address belonging to a member"
    type Address {
        id: ID!
        postalCode: String!
        place: String!
    }

    "Represents a book owned or registered by a member"
    type Book {
        id: ID!
        name: String!
        isbn: String!
        author: String
        genre: Genre
    }

    "Generated ID after creating a new member"
    type CreatePayload {
        id: ID!
    }

    "Version number after updating a member"
    type UpdatePayload {
        version: Int
    }

    "Indicates whether a delete operation was successful"
    type DeletePayload {
        success: Boolean
    }

    "Represents JWT token data"
    type TokenPayload {
        access_token: String!
        expires_in: Int!
        refresh_token: String!
        refresh_expires_in: Int!
    }

    input SearchParameterInput {
        username: String
        firstName: String
        lastName: String
        emailAddress: String
        gender: Gender
        dateOfBirth: String
        memberSince: String
        isStudent: Boolean
    }

    input CreateMemberInput {
        username: String!
        firstName: String!
        lastName: String!
        emailAddress: String!
        gender: Gender
        dateOfBirth: String!
        memberSince: String
        isStudent: Boolean
        interests: [String!]
        address: CreateAddressInput
        books: [CreateBookInput!]
    }

    input CreateAddressInput {
        postalCode: String!
        place: String!
    }

    input CreateBookInput {
        name: String!
        isbn: String!
        author: String
        genre: Genre
    }

    "Represents available gender values"
    enum Gender {
        MALE
        FEMALE
        DIVERSE
    }

    "Represents available book genres"
    enum Genre {
        FANTASY
        THRILLER
        SCIENCE_FICTION
        CRIME_NOVEL
        NON_FICTION
    }

`;

// SEARCHING

export type Member = {
    id: ID;
    version: Int;
    username: string;
    firstName: string;
    lastName: string;
    gender?: 'MALE' | 'FEMALE' | 'DIVERSE';
    dateOfBirth?: string;
    memberSince?: string;
    isStudent?: boolean;
    emailAddress: string;
    interests: string[];
    address: { id: ID; postalCode: string; place: string };
    books:
        | (
              | {
                    id: ID;
                    name: string;
                    isbn: string;
                    author: string | null;
                    genre:
                        | 'FANTASY'
                        | 'THRILLER'
                        | 'SCIENCE_FICTION'
                        | 'CRIME_NOVEL'
                        | 'NON_FICTION'
                        | null;
                }
              | undefined
              | null
          )[]
        | undefined;
};

export const toMemberType = (member: MemberWithAddressAndBooks): Member => {
    const result: Member = {
        id: toID(member.id),
        version: toInt(member.version),
        username: member.username,
        firstName: member.firstName,
        lastName: member.lastName,
        emailAddress: member.emailAddress,
        interests: [],
        address: {
            id: member.address ? toID(member.address.id) : ('N/A' as ID),
            postalCode: member.address?.postalCode ?? 'N/A',
            place: member.address?.place ?? 'N/A',
        },
        books: member.books.map((book) => ({
            id: toID(book.id),
            name: book.name,
            isbn: book.isbn,
            author: book.author,
            genre: book.genre,
        })),
    };

    const { gender, dateOfBirth, memberSince, isStudent } = member;

    if (gender !== null) {
        result.gender = gender;
    }
    if (dateOfBirth !== null) {
        result.dateOfBirth = dateOfBirth.toISOString();
    }
    if (memberSince !== null) {
        result.memberSince = memberSince.toISOString();
    }
    if (isStudent !== null) {
        result.isStudent = isStudent;
    }
    //TODO Address/Books optional fields

    return result;
};

export type SearchParameterInput = {
    username?: string;
    firstName?: string;
    lastName?: string;
    emailAddress?: string;
    gender?: 'MALE' | 'FEMALE' | 'DIVERSE';
    dateOfBirth?: string;
    memberSince?: string;
    isStudent?: boolean;
};

export const toSearchParameter = (param?: SearchParameterInput) => {
    if (param === undefined) {
        return null;
    }

    const {
        username,
        firstName,
        lastName,
        emailAddress,
        gender,
        dateOfBirth,
        memberSince,
        isStudent,
    } = param;

    const searchParam: Record<string, any> = {};

    if (username !== undefined) {
        searchParam['username'] = username;
    }
    if (firstName !== undefined) {
        searchParam['firstName'] = firstName;
    }
    if (lastName !== undefined) {
        searchParam['lastName'] = lastName;
    }
    if (emailAddress !== undefined) {
        searchParam['emailAddress'] = emailAddress;
    }
    if (gender !== undefined) {
        searchParam['gender'] = gender;
    }
    if (dateOfBirth !== undefined) {
        searchParam['dateOfBirth'] = dateOfBirth;
    }
    if (memberSince !== undefined) {
        searchParam['memberSince'] = memberSince;
    }
    if (isStudent !== undefined) {
        searchParam['isStudent'] = isStudent;
    }

    return searchParam as SearchParameter;
};

// MUTATIONS

// --------------------------------------------------------------------------------------------------------------------
// C r e a t e
// --------------------------------------------------------------------------------------------------------------------
export type CreateMemberInput = {
    username: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    gender?: 'MALE' | 'FEMALE' | 'DIVERSE' | null;
    dateOfBirth: string;
    memberSince?: string;
    isStudent?: boolean | null;
    interests?: string[];
    address?: {
        postalCode: string;
        place: string;
    };
    books?: {
        name: string;
        isbn: string;
        author?: string;
        genre?:
            | 'FANTASY'
            | 'THRILLER'
            | 'SCIENCE_FICTION'
            | 'CRIME_NOVEL'
            | 'NON_FICTION';
    }[];
};

export const toCreate = (member: CreateMemberInput): MemberCreate => {
    const {
        username,
        firstName,
        lastName,
        emailAddress,
        gender,
        dateOfBirth,
        memberSince,
        isStudent,
        interests,
        address,
        books,
    } = member;
    const createData: MemberCreate = {
        version: 0,
        username,
        firstName,
        lastName,
        emailAddress,
        gender: gender ?? null,
        dateOfBirth,
        memberSince: memberSince ? toDateOrNull(memberSince) : null,
        isStudent: isStudent ?? null,
        interests: interests ?? [],
        address: {
            create: {
                postalCode: address?.postalCode ?? 'N/A',
                place: address?.place ?? 'N/A',
            },
        },
        books: {
            create:
                books?.map((book) => ({
                    name: book.name,
                    isbn: book.isbn,
                    author: book.author ?? null,
                    genre: book.genre ?? null,
                })) ?? [],
        },
    };
    return createData;
};

export type CreatePayload = {
    readonly id: ID;
};

// --------------------------------------------------------------------------------------------------------------------
// U p d a t e
// --------------------------------------------------------------------------------------------------------------------
export type UpdateMemberInput = Omit<MemberCreate, 'books'> & {
    id: ID;
    version: Int;
};

export const toUpdate = (member: UpdateMemberInput): MemberUpdate => {
    const {
        version,
        username,
        firstName,
        lastName,
        emailAddress,
        gender,
        dateOfBirth,
        memberSince,
        isStudent,
        interests,
    } = member;
    const updateData: MemberUpdate = {
        version,
        username,
        firstName,
        lastName,
        emailAddress,
        gender: gender ?? null,
        dateOfBirth,
        memberSince: memberSince ? toDateOrNull(memberSince) : null,
        isStudent: isStudent ?? null,
        interests: interests ?? [],
    };
    return updateData;
};

export type UpdatePayload = {
    version: Int;
};

// --------------------------------------------------------------------------------------------------------------------
// D e l e t e
// --------------------------------------------------------------------------------------------------------------------
export type DeletePayload = {
    success: boolean;
};

// --------------------------------------------------------------------------------------------------------------------
// A u t h e n t i c a t i o n
// --------------------------------------------------------------------------------------------------------------------
export type TokenPayload = {
    access_token: string;
    expires_in: Int;
    refresh_token: string;
    refresh_expires_in: Int;
};
