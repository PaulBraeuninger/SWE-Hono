/**
 * Get-tests for /rest/:id endpoint using vitest.
 */

import {
    ACCEPT,
    APPLICATION_JSON,
    CONTENT_TYPE,
    IF_NONE_MATCH,
    restURL,
} from '../constants.mts';
import { describe, expect, test } from 'vitest';

const existingIds = [1, 2];
const nonExistingId = 99999;
const invalidId = 'abc';
const eTagIds = [1, 2];

describe('GET /rest/:id', () => {
    test.concurrent.each(existingIds)(
        'Member with id %i should be found',
        async (id) => {
            // Arrange
            const url = `${restURL}/${id}`;
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

            const body = (await response.json()) as { id: number };

            expect(body.id).toBe(id);
        },
    );

    test.concurrent(
        'No member should be found with non-existing id',
        async () => {
            // Arrange
            const url = `${restURL}/${nonExistingId}`;
            const requestHeaders = new Headers();
            requestHeaders.append(ACCEPT, APPLICATION_JSON);

            // Act
            const response = await fetch(url, {
                headers: requestHeaders,
            });
            const { status } = response;

            // Assert
            expect(status).toBe(404);
        },
    );

    test.concurrent('No member should be found with invalid id', async () => {
        // Arrange
        const url = `${restURL}/${invalidId}`;
        const requestHeaders = new Headers();
        requestHeaders.append(ACCEPT, APPLICATION_JSON);

        // Act
        const response = await fetch(url, {
            headers: requestHeaders,
        });
        const { status } = response;

        // Assert
        expect(status).toBe(404);
    });

    test.concurrent.each(eTagIds)(
        'Member with id %i including If-None-Match',
        async (id) => {
            // Arrange
            const url = `${restURL}/${id}`;
            const requestHeaders = new Headers();
            requestHeaders.append(ACCEPT, APPLICATION_JSON);
            requestHeaders.append(IF_NONE_MATCH, '"0"');

            // Act
            const response = await fetch(url, {
                headers: requestHeaders,
            });
            const { status } = response;

            // Assert
            expect(status).toBe(304);

            const body = await response.text();

            expect(body).toBe('');
        },
    );
});
