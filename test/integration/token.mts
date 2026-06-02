import {
    CONTENT_TYPE,
    POST,
    X_WWW_FORM_URL_ENCODED,
    baseURL,
    tokenPath,
} from './constants.mts';

export const getToken = async (username: string, password: string) => {
    const headers = new Headers();
    headers.append(CONTENT_TYPE, X_WWW_FORM_URL_ENCODED);
    const response = await fetch(`${baseURL}${tokenPath}`, {
        method: POST,
        body: `username=${username}&password=${password}`,
        headers,
    });

    const body = (await response.json()) as { access_token: string };
    if (
        response.status !== 200 ||
        body.access_token === undefined ||
        typeof body.access_token !== 'string'
    ) {
        console.error(`!!!username=${username}, password=${password}`);
        console.error(`!!!status=${response.status}`);
        console.error('!!!body=%j', body);
        throw new Error('Statuscode is not 200 or no string as access_token in body');
    }
    return body.access_token;
};
