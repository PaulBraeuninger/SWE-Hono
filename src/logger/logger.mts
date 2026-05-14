/**
 * This module provides the {@linkcode getLogger} function for creating a logger
 * based on Pino: https://getpino.io.
 * Alternatives: Winston or possibly Bunyan.
 * @packageDocumentation
 */

import type pino from 'pino';
import { parentLogger } from '../config/logger.mts';

/**
 * Creates a `Pino` logger object with a defined _context_ that is used in each
 * log method, e.g. the name of a class (default), a function, or a file.
 * @param context The context
 * @param kind Usually `class`, `func`, or `file`
 */
export const getLogger: (
    context: string,
    kind?: string,
) => pino.Logger<string> = (context: string, kind = 'class') => {
    const bindings: Record<string, string> = {};
    // Indexed access for a property whose name is passed via "kind".
    // eslint-disable-next-line security/detect-object-injection
    bindings[kind] = context;
    // https://getpino.io/#/docs/child-loggers
    return parentLogger.child(bindings);
};
