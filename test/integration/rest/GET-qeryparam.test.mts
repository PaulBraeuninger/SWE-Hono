import { describe, expect, test } from 'vitest';
import {
    ACCEPT,
    APPLICATION_JSON,
    CONTENT_TYPE,
    restURL,
} from '../constants.mts';
import { Member } from '../../../src/generated/prisma/client.ts';
import { Page } from '../../../src/library/router/page.mts';
import { MemberWithAddress } from '../../../src/library/service/member-read-service.mts';

const lastNamesValid = ['Menke'];
const lastNamesInvalid = ['abc', 'def'];
const interestsValid = ['fantasy'];
const interestsInvalid = ['religion', 'jokes'];

describe('GET /rest', () => {
    test.concurrent('Get all members', async () => {
        // Arrange
        const requestHeaders = new Headers();
        requestHeaders.append(ACCEPT, APPLICATION_JSON);

        // Act
        const response = await fetch(restURL, {
            headers: requestHeaders,
        });
        const { status, headers } = response;

        // Assert
        expect(status).toBe(200);
        expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

        const body = (await response.json()) as Page<Member>;

        body.content
            .map((member) => member.id)
            .forEach((id) => expect(id).toBeDefined());
    });

    test.concurrent.each(lastNamesValid)(
        'Get members with name %s',
        async (lastName) => {
            // Arrange
            const params = new URLSearchParams({ lastName });
            const url = `${restURL}?${params.toString()}`;
            const requestHeaders = new Headers();
            requestHeaders.append(ACCEPT, APPLICATION_JSON);

            // Act
            const response = await fetch(url, {
                headers: requestHeaders,
            });
            const { status, headers } = response;

            // Assert
            expect(status).toBe(200);
            expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

            const body = (await response.json()) as Page<MemberWithAddress>;

            expect(body).toBeDefined();

            body.content
                .map((member) => member.lastName)
                .forEach((memberName) => expect(memberName).toBe(lastName));
        },
    );

    test.concurrent.each(lastNamesInvalid)(
        'No members should be found with name %s',
        async (lastName) => {
            // Arrange
            const params = new URLSearchParams({ lastName });
            const url = `${restURL}?${params.toString()}`;
            const requestHeaders = new Headers();
            requestHeaders.append(ACCEPT, APPLICATION_JSON);

            // Act
            const { status } = await fetch(url, {
                headers: requestHeaders,
            });

            // Assert
            expect(status).toBe(404);
        },
    );

    test.concurrent.each(interestsValid)(
        'No members should be found with valid interests',
        async (interests) => {
            // Arrange
            const params = new URLSearchParams({ [interests]: 'true' });
            const url = `${restURL}?${params.toString()}`;
            const requestHeaders = new Headers();
            requestHeaders.append(ACCEPT, APPLICATION_JSON);

            // Act
            const response = await fetch(url, {
                headers: requestHeaders,
            });
            const { status } = response;

            // Assert
            expect(status).toBe(404); // There are no entries with interest fantasy
        },
    );

    test.concurrent.each(interestsInvalid)(
        'No members should be found with interest %s',
        async (interest) => {
            // Arrange
            const params = new URLSearchParams({ [interest]: 'true' });
            const url = `${restURL}?${params}`;
            const requestHeaders = new Headers();
            requestHeaders.append(ACCEPT, APPLICATION_JSON);

            // Act
            const { status } = await fetch(url, {
                headers: requestHeaders,
            });

            // Assert
            expect(status).toBe(404);
        },
    );

    test.concurrent(
        'No members should be found with invalid search parameters',
        async () => {
            // Arrange
            const params = new URLSearchParams({ foo: 'bar' });
            const url = `${restURL}?${params}`;
            const requestHeaders = new Headers();
            requestHeaders.append(ACCEPT, APPLICATION_JSON);

            // Act
            const { status } = await fetch(url, {
                headers: requestHeaders,
            });

            // Assert
            expect(status).toBe(404);
        },
    );
});
