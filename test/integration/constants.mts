/**
 * This module defines constants used in integration tests, such as URLs, HTTP methods, and header names.
 * It imports configuration values from the application's config files to ensure consistency with the server settings.
 * These constants are used across multiple test files to avoid hardcoding values and to improve maintainability.
 */

import { paths } from '../../src/config/paths.mts'
import { serverConfig } from '../../src/config/server.mts'

const { host, port } = serverConfig;

export const baseURL = `http://${host}:${port}`;
export const restURL = `${baseURL}/rest`;
export const graphqlURL = `${baseURL}/graphql`;

export const tokenPath = `${paths.auth}${paths.token}`;

export const POST = 'POST';
export const GET = 'GET';
export const PUT = 'PUT';
export const DELETE = 'DELETE';

export const BEARER = 'Bearer';
export const ACCEPT = 'Accept';
export const CONTENT_TYPE = 'Content-Type';
export const APPLICATION_JSON = 'application/json';
export const LOCATION = 'location';
export const AUTHORIZATION = 'Authorization';
export const IF_NONE_MATCH = 'If-None-Match';
export const IF_MATCH = 'If-Match';

export const GRAPHQL_RESPONSE_JSON = 'application/graphql-response+json';
