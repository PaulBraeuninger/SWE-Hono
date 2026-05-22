/**
 * The module `create-base-url` defines the base URL for the API.
 * @packageDocumentation
 */

import { type HonoRequest } from 'hono';

const ID_PATTERN = /^[1-9]\d{0,10}$/u;

export const createBaseUrl: (req: HonoRequest) => string = (
    req: HonoRequest,
) => {
    const { url } = req;
    // Remove the path and query string from the URL to get the base URL.
    let baseUrl = url.includes('?') ? url.slice(0, url.lastIndexOf('?')) : url;

    // Remove the ID from the URL if it ends with it.
    const indexOfLastSlash = baseUrl.lastIndexOf('/');
    if (indexOfLastSlash > 0) {
        const idString = baseUrl.slice(indexOfLastSlash + 1);
        if (ID_PATTERN.test(idString)) {
            baseUrl = baseUrl.slice(0, indexOfLastSlash);
        }
    }

    return baseUrl;
};
