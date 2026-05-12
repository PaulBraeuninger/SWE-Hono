/**
 * Module consisting of service for reading operations of library member data.
 * @packageDocumentation
 * @author brpa1033
 */

import { getLogger } from '../../logger/logger.mts';

export class MemberReadService {

    readonly #logger = getLogger(MemberReadService.name);

    /**
     * Example method for getting a simple string response.
     * 
     * @returns 'Hello World'
     */
    async getHelloWorld(): Promise<string> {
        this.#logger.info('getHelloWorld called');

        return 'Hello World';
    }

}