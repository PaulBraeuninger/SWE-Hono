/**
 * The module `errors` defines custom error classes for the member service.
 * @packageDocumentation
 */

/**
 * Thrown, when a given entity was not found.
 */
export class NotFoundError extends Error {}

/**
 * Thrown, when a given username already exists.
 */
export class UsernameAlreadyExistsError extends Error {
    readonly username: string;

    /**
     * The constructor of the `usernameAlreadyExistsError` class.
     *
     * @param username The username.
     */
    constructor(username: string) {
        super(`Username ${username} already exists`);
        this.username = username;
    }
}

/**
 * Thrown, when a given version string is invalid.
 */
export class VersionInvalidError extends Error {
    readonly version: string | undefined;

    /**
     * The constructor of the `VersionInvalidError` class.
     *
     * @param version The version string.
     */
    constructor(version: string | undefined) {
        super(`Version ${version} is invalid`);
        this.version = version;
    }
}

/**
 * Thrown, when a given version stringis outdated.
 */
export class VersionOutdatedError extends Error {
    readonly version: number;

    /**
     * The constructor of the `VersionOutdatedError` class.
     *
     * @param version The version string.
     */
    constructor(version: number) {
        super(`Version ${version} is outdated`);
        this.version = version;
    }
}
