import { describe, expect, test } from "vitest";
import { ACCEPT, APPLICATION_JSON, CONTENT_TYPE, restURL } from "../constants.mts";
import { Member } from "../../../src/generated/prisma/client.ts";
import { Page } from "../../../src/library/router/page.mts";
import { MemberWithAddress } from "../../../src/library/service/member-read-service.mts";

const lastNames = ['Admin', 'Menke'];
const lastNamesInvalid = ['abc', 'def'];
const interests = ['FANTASY', 'SCIENCE_FICTION'];
const interestsInvalid = ['RELIGIOUS', 'JOKES'];

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
        expect(headers.get(CONTENT_TYPE)).toBe(/json/iu);

        const body = (await response.json()) as Page<Member>;

        body.content
            .map((member) => member.id)
            .forEach((id) => expect(id).toBeDefined());

    });

    test.concurrent.each(lastNames)(
        'Get members with name %s',
        async (name) => {
        // Arrange
        const params = new URLSearchParams({ name });
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
        expect(headers.get(CONTENT_TYPE)).toBe(/json/iu);

        const body = (await response.json()) as Page<MemberWithAddress>;

        expect(body).toBeDefined();

        body.content
            .map((member) => member.lastName)
            .forEach((memberName) => expect(memberName).toBe(name));
    });

    test.concurrent.each(lastNamesInvalid)(
        'No members should be found with name %s',
        async (name) => {
        // Arrange
        const params = new URLSearchParams({ name });
        const url = `${restURL}?${params.toString()}`;
        const requestHeaders = new Headers();
        requestHeaders.append(ACCEPT, APPLICATION_JSON);

        // Act
        const { status } = await fetch(url, {
            headers: requestHeaders,
        });

        // Assert
        expect(status).toBe(404);
    });

    test.concurrent.each(interests)(
        'Get members with interest %s',
        async (interest) => {
        // Arrange
        const params = new URLSearchParams({ [interest]: 'true' });
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
        expect(headers.get(CONTENT_TYPE)).toBe(/json/iu);

        const body = (await response.json()) as Page<Member>;

        expect(body).toBeDefined();

        body.content
            .map((member) => member.interests)
            .forEach((memberInterests) =>
                expect(memberInterests).toStrictEqual(
                    expect.arrayContaining([interest.toUpperCase()])
                ));
    });

    test.concurrent.each(interestsInvalid)(
        'No members should be found with interest %s',
        async (interest) => {
        // Arrange
        const params = new URLSearchParams({ [interest]: 'true' });
        const url = `${restURL}?${params.toString()}`;
        const requestHeaders = new Headers();
        requestHeaders.append(ACCEPT, APPLICATION_JSON);

        // Act
        const { status } = await fetch(url, {
            headers: requestHeaders,
        });

        // Assert
        expect(status).toBe(404);
    });
});
