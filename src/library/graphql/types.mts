/**
 * Types and type definitions for GraphQL schema and resolvers.
 *
 * @packageDocumentation
 */

import { MemberWithAddressAndBooks } from "../service/member-read-service.mts";
import { SearchParameter } from "../service/searchparams.mts";

export type ID = string & { readonly __brand: 'ID' };
export type Int = number & { readonly __brand: 'Int' };

export const toID = (value: string | number): ID => {
    if (typeof value === 'string') {
        return value as ID;
    }
    return value.toString() as ID;
}

export const toInt = (num: number): Int => (Number.isInteger(num) ? num : Math.round(num)) as Int;
export const toNumber = (id: ID): number => Number.parseInt(id, 10);

export const typeDefinitions = `

    "Root query type providing read access to members"
    type Query {
        "Returns a single member by its ID"
        member(id: ID!): Member!

        "Returns a paginated list of members with optional filtering"
        members(input: SearchParameterInput): [Member!]!
    }

    # TODO add mutations for creating, updating, and deleting members and their books

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

    # TODO Inputs for mutation

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
    address: { id: ID, postalCode: string, place: string };
    books: ({
        id: ID,
        name: string,
        isbn: string,
        author: string | null,
        genre: 'FANTASY' | 'THRILLER' | 'SCIENCE_FICTION' | 'CRIME_NOVEL' | 'NON_FICTION' | null,
    } | undefined | null)[] | undefined;
}

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
            id: member.address ? toID(member.address.id) : 'N/A' as ID,
            postalCode: member.address?.postalCode ?? 'N/A',
            place: member.address?.place ?? 'N/A'
        },
        books: member.books.map(book => ({
            id: toID(book.id),
            name: book.name,
            isbn: book.isbn,
            author: book.author,
            genre: book.genre
        }))
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
}

export type SearchParameterInput = {
    username?: string;
    firstName?: string;
    lastName?: string;
    emailAddress?: string;
    gender?: 'MALE' | 'FEMALE' | 'DIVERSE';
    dateOfBirth?: string;
    memberSince?: string;
    isStudent?: boolean;
}

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
        isStudent
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
