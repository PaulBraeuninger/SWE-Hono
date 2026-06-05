/**
 * Error class for missing authorization.
 */
export class UnauthorizedError extends Error {}

/**
 * Error class for missing permissions.
 */
export class ForbiddenError extends Error {}

/**
 * Error class for internal server errors.
 */
export class InternalServerError extends Error {}
