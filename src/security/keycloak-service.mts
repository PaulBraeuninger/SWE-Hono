/* eslint-disable camelcase, @typescript-eslint/naming-convention */

import { keycloakConfig } from '../config/keycloak.mts';
import { getLogger } from '../logger/logger.mts';

const { accessTokenUrl, clientId, secret } = keycloakConfig;
const AUTHORIZATION = 'Authorization';
const BASIC_AUTH = 'Basic';
const CONTENT_TYPE = 'Content-Type';
const X_WWW_FORM_URLENCODED = 'application/x-www-form-urlencoded';
const POST = 'POST';

/** Type definition for token input data. */
export type TokenData = {
    readonly username: string | undefined;
    readonly password: string | undefined;
};

export class KeycloakService {
    readonly #headers: Headers;
    readonly #headersAuthorization: Headers;
    readonly #logger = getLogger(KeycloakService.name);

    constructor() {
        this.#headers = new Headers();
        this.#headers.append(CONTENT_TYPE, X_WWW_FORM_URLENCODED);

        const encoded = btoa(`${clientId}:${secret}`);
        this.#headersAuthorization = new Headers();
        this.#headersAuthorization.append(CONTENT_TYPE, X_WWW_FORM_URLENCODED);
        this.#headersAuthorization.append(
            AUTHORIZATION,
            `${BASIC_AUTH} ${encoded}`,
        );
    }

    async token({ username, password }: TokenData) {
        this.#logger.debug('token: username=%s', username);
        if (username === undefined || password === undefined) {
            return;
        }

        // https://www.keycloak.org/docs-api/23.0.4/rest-api/index.html
        // https://stackoverflow.com/questions/62683482/keycloak-rest-api-call-to-get-access-token-of-a-user-through-admin-username-and
        // https://stackoverflow.com/questions/65714161/keycloak-generate-access-token-for-a-user-with-keycloak-admin
        const body = `username=${username}&password=${password}&grant_type=password&client_id=${clientId}&client_secret=${secret}`;

        this.#logger.debug('token: path=%s', accessTokenUrl);
        this.#logger.debug('token: headers=%o', this.#headers);
        this.#logger.debug('token: body=%s', body);
        let response: Response;
        try {
            response = await fetch(accessTokenUrl, {
                method: POST,
                body,
                headers: this.#headers,
            });
        } catch (err) {
            this.#logger.warn(
                'Fehler beim Zugriff auf Keycloak: %o',
                err as object,
            );
            return;
        }

        const { status } = response;
        if (status !== 200) {
            this.#logger.warn(
                'Fehler beim Netzwerkzugriff auf Keycloak. Statuscode: %d',
                status,
            );
            return;
        }

        const responseBody = await response.json();
        this.#logPayload(responseBody);
        this.#logger.debug('token: responseBody=%o', responseBody as object);
        return responseBody;
    }

    // Log roles: required on the client side.
    // { ..., "azp": "nest-client", "exp": ..., "resource_access": { "nest-client": { "roles": ["admin"] } ...}
    // azp = authorized party
    async #logPayload(responseBody: unknown) {
        if (
            !this.#logger.isLevelEnabled('debug') ||
            responseBody === null ||
            typeof responseBody !== 'object' ||
            !Object.hasOwn(responseBody, 'access_token')
        ) {
            return;
        }
        // https://www.keycloak.org/docs-api/latest/rest-api/index.html#ClientInitialAccessCreatePresentation
        const { access_token } = responseBody as { access_token: string };
        // Payload is the middle part between 2 dots and encoded in Base64.
        const [, payloadStr] = access_token.split('.');

        // Decode Base64.
        if (payloadStr === undefined) {
            return;
        }
        const payloadDecoded = atob(payloadStr);

        // Create JSON object for payload from the decoded string.

        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        const payload = JSON.parse(payloadDecoded);
        const { azp, exp, resource_access } = payload;
        this.#logger.debug('#logPayload: exp=%s', exp);
        const { roles } = resource_access[azp]; // eslint-disable-line security/detect-object-injection
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */

        this.#logger.debug('#logPayload: roles=%o', roles);
    }
}
/* eslint-enable camelcase, @typescript-eslint/naming-convention */
