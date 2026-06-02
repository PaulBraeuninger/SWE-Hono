import { beforeAll, describe, expect, test } from "vitest";
import { getToken } from "../token.mts";
import { DELETE, restURL } from "../constants.mts";

const id = 3;

describe('DELETE /rest', () => {
    let token: string;

    beforeAll(async () => {
        token = await getToken('admin', 'p');
    });

    test.concurrent('Delete member with id 3', async () => {
        // Arrange
        const url = `${restURL}/${id}`;
        const headers = new Headers();
        headers.append('Authorization', `Bearer ${token}`);

        // Act
        const { status } = await fetch(url, {
            method: DELETE,
            headers,
        });

        // Assert
        expect(status).toBe(204);
    });
});
