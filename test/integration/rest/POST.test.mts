import {
    APPLICATION_JSON,
    AUTHORIZATION,
    BEARER,
    CONTENT_TYPE,
    LOCATION,
    POST,
    restURL,
} from '../constants.mts';
import { beforeAll, describe, expect, test } from 'vitest';
import { MemberCreateType } from '../../../src/library/router/member-validation.mts';
import { MemberReadService } from '../../../src/library/service/member-read-service.mts';
import { ProblemDetails } from '../../../src/problem-details.mts';
import { getToken } from '../token.mts';

// ---------------------------------------------------------------------------------------------------------------------------------
// T e s t d a t a
// ---------------------------------------------------------------------------------------------------------------------------------
const newMember: MemberCreateType = {
    username: 'resttestuser',
    first_name: 'Resttest',
    last_name: 'User',
    date_of_birth: new Date('1990-01-01'),
    email_address: 'rest.test.user@acme.com',
    address: {
        place: 'Resttestcity',
        postal_code: '56789',
    },
    gender: 'DIVERSE',
    member_since: new Date('2026-06-03'),
    is_student: false,
    interests: ['FANTASY', 'CRIME_NOVEL'],
    books: [
        {
            name: 'Rest Test Book',
            isbn: '978-3-161-48410-0',
            author: 'Rest Test Author',
            still_borrowed: true,
            genre: 'CRIME_NOVEL',
        },
    ],
};

const newMemberExistingUsername: Omit<MemberCreateType, 'books'> = {
    username: 'admin',
    first_name: 'Admin',
    last_name: 'Admin',
    date_of_birth: new Date('2000-01-01'),
    email_address: 'admin.test@acme.com',
    address: {
        place: 'Existing Username City',
        postal_code: '12345',
    },
};

const newMemberInvalidData: Omit<MemberCreateType, 'books'> = {
    username: 'invalidData',
    first_name: 'Invalid',
    last_name: 'Data',
    date_of_birth: new Date('2000-01-01'),
    email_address: 'wrong_email@',
    address: {
        place: 'Invalid Data City',
        postal_code: '12345',
    },
    gender: 'INVALID_GENDER' as any,
};

// ---------------------------------------------------------------------------------------------------------------------------------
// T e s t   E x e c u t i o n
// ---------------------------------------------------------------------------------------------------------------------------------
describe('POST /rest', () => {
    let token: string;

    beforeAll(async () => {
        token = await getToken('admin', 'p');
    });

    test('New Member', async () => {
        // given
        const headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        // when
        const response = await fetch(restURL, {
            method: POST,
            body: JSON.stringify(newMember),
            headers,
        });

        // then
        const { status } = response;

        expect(status).toBe(201);

        const responseHeaders = response.headers;
        const location = responseHeaders.get(LOCATION);

        expect(location).toBeDefined();

        const indexLastSlash = location?.lastIndexOf('/') ?? -1;

        expect(indexLastSlash).not.toBe(-1);

        const idStr = location?.slice(indexLastSlash + 1);

        expect(idStr).toBeDefined();
        expect(MemberReadService.ID_PATTERN.test(idStr ?? '')).toBe(true);
    });

    test('New Member with existing username', async () => {
        // given
        const headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        // when
        const response = await fetch(restURL, {
            method: POST,
            body: JSON.stringify(newMemberExistingUsername),
            headers,
        });

        // then
        const { status } = response;

        expect(status).toBe(422);

        const body = (await response.json()) as ProblemDetails;

        expect(body.detail).toStrictEqual(expect.stringContaining('Username'));
    });

    test('New Member with invalid data', async () => {
        // given
        const headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        const expectedPaths = ['gender', 'email_address'];

        // when
        const response = await fetch(restURL, {
            method: POST,
            body: JSON.stringify(newMemberInvalidData),
            headers,
        });

        // then
        const { status } = response;

        expect(status).toBe(422);

        const body = (await response.json()) as ProblemDetails;
        const { detail } = body;

        expect(detail).toBeDefined();
        expect(detail).toHaveLength(expectedPaths.length);

        const paths = detail.map((d: any) => d.path[0]);

        expect(paths).toStrictEqual(expect.arrayContaining(expectedPaths));
    });

    test.concurrent('New Member without token', async () => {
        // given
        const headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);

        // when
        const response = await fetch(restURL, {
            method: POST,
            body: JSON.stringify(newMember),
            headers,
        });

        // then
        const { status } = response;

        expect(status).toBe(401);
    });

    test.concurrent('New Member with invalid token', async () => {
        // given
        const headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(AUTHORIZATION, `${BEARER} invalidtoken`);

        // when
        const response = await fetch(restURL, {
            method: POST,
            body: JSON.stringify(newMember),
            headers,
        });

        // then
        const { status } = response;

        expect(status).toBe(401);
    });
});
