import { beforeAll, describe, expect, test } from 'vitest';
import { type MemberUpdateType } from '../../../src/library/router/member-validation.mts';
import { ProblemDetails } from '../../../src/problem-details.mts';
import {
    APPLICATION_JSON,
    AUTHORIZATION,
    BEARER,
    CONTENT_TYPE,
    IF_MATCH,
    PUT,
    restURL,
} from '../constants.mts';
import { getToken } from '../token.mts';

// ---------------------------------------------------------------------------------------------------------------------------------
// T e s t d a t a
// ---------------------------------------------------------------------------------------------------------------------------------
const updatedMember: MemberUpdateType = {
    first_name: 'Updated',
    last_name: 'User',
    date_of_birth: new Date('1990-01-01'),
    email_address: 'updated.user@acme.com',
};

const updatedMemberInvalidData: MemberUpdateType = {
    first_name: 'Invalid',
    last_name: 'User',
    date_of_birth: new Date('1990-01-01'),
    email_address: 'invalid.email@',
    gender: 'INVALID_GENDER' as any,
};

const existingMemberId = '1';
const nonExistingMemberId = '999999';

// ---------------------------------------------------------------------------------------------------------------------------------
// T e s t s
// ---------------------------------------------------------------------------------------------------------------------------------
describe('PUT /members/:id', () => {
    let token: string;

    beforeAll(async () => {
        token = await getToken('admin', 'p');
    });

    test('Update existing Member', async () => {
        // given
        const url = `${restURL}/${existingMemberId}`;
        const headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(IF_MATCH, '"0"');
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        // when
        const response = await fetch(url, {
            method: PUT,
            body: JSON.stringify(updatedMember),
            headers,
        });

        // then
        const { status } = response;

        expect(status).toBe(204);
    });

    test('Update non-existing Member', async () => {
        // given
        const url = `${restURL}/${nonExistingMemberId}`;
        const headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(IF_MATCH, '"0"');
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        // when
        const response = await fetch(url, {
            method: PUT,
            body: JSON.stringify(updatedMember),
            headers,
        });

        // then
        const { status } = response;

        expect(status).toBe(404);
    });

    test('Update Member with invalid data', async () => {
        // given
        const url = `${restURL}/${existingMemberId}`;
        const headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(IF_MATCH, '"0"');
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);
        const expectedPaths = ['gender', 'email_address'];

        // when
        const response = await fetch(url, {
            method: PUT,
            body: JSON.stringify(updatedMemberInvalidData),
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

    test('Update Member without version tag', async () => {
        // given
        const url = `${restURL}/${existingMemberId}`;
        const headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        // when
        const response = await fetch(url, {
            method: PUT,
            body: JSON.stringify(updatedMember),
            headers,
        });

        // then
        const { statusCode } = (await response.json()) as ProblemDetails;

        expect(statusCode).toBe(428);
    });

    test('Update Member with outdated version tag', async () => {
        // given
        const url = `${restURL}/${existingMemberId}`;
        const headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(IF_MATCH, '"-1"');
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        // when
        const response = await fetch(url, {
            method: PUT,
            body: JSON.stringify(updatedMember),
            headers,
        });

        // then
        const { statusCode } = (await response.json()) as ProblemDetails;

        expect(statusCode).toBe(412);
    });

    test('Update Member without token', async () => {
        // given
        const url = `${restURL}/${existingMemberId}`;
        const headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(IF_MATCH, '"0"');

        // when
        const response = await fetch(url, {
            method: PUT,
            body: JSON.stringify(updatedMember),
            headers,
        });

        // then
        const { status } = response;

        expect(status).toBe(401);
    });

    test('Update Member with invalid token', async () => {
        // given
        const url = `${restURL}/${existingMemberId}`;
        const headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(IF_MATCH, '"0"');
        headers.append(AUTHORIZATION, `${BEARER} invalidtoken`);

        // when
        const response = await fetch(url, {
            method: PUT,
            body: JSON.stringify(updatedMember),
            headers,
        });

        // then
        const { status } = response;

        expect(status).toBe(401);
    });
});
