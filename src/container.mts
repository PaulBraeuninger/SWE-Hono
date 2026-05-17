// TODO Temporary solution; needs revision:
/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MemberReadService } from './library/service/member-read-service.mts';
import { MemberWriteService } from './library/service/member-write-service.mts';
import { DbPopulateService } from './config/dev/db-populate.mts';
import { KeycloakService } from './security/keycloak-service.mts';

const memberReadService = new MemberReadService();

/**
 * Container with singletons for the emulation of manual DI (similar to a
 * container in the Spring Framework).
 *
 * @author brpa1033
 */
export const container = {
    memberReadService,
    memberWriteService: new MemberWriteService(memberReadService),
    keycloakService: new KeycloakService(),
    dbPopulateService: new DbPopulateService(),
};
