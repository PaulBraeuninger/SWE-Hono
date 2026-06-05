/**
 * The module containes the classes {@linkcode MemberWriteService} for the write operations.
 * @packageDocumentation
 */

import { prismaClient } from '../../config/prisma-client.mts';
import { type Prisma } from '../../generated/prisma/client.ts';
import { getLogger } from '../../logger/logger.mts';
import { sendmail } from '../../mail/sendmail.mts';
import { MemberReadService } from './member-read-service.mts';
import {
    NotFoundError,
    UsernameAlreadyExistsError,
    VersionInvalidError,
    VersionOutdatedError,
} from './errors.mts';

export type MemberCreate = Prisma.MemberCreateInput;
type MemberCreated = Prisma.MemberGetPayload<{
    include: {
        address: true;
        books: true;
    };
}>;

export type MemberUpdate = Prisma.MemberUpdateInput;
/** Type definition of the update model of the member entity. */
export type UpdateParameters = {
    /** ID of the member, that should be updated. */
    readonly id: number | undefined;
    /** Member data for the update operation. */
    readonly member: MemberUpdate;
    /** Version of the member, that should be updated. */
    readonly version: string;
};
type MemberUpdated = Prisma.MemberGetPayload<{}>;

/**
 * The class `MemberWriteService` implements the budiness logic of the project for the write service.
 */
export class MemberWriteService {
    private static readonly VERSION_PATTERN = /^"\d{1,3}"$/u;

    readonly #memberReadService: MemberReadService;

    readonly #logger = getLogger(MemberWriteService.name);

    /**
     * Creates a new instance of the `MemberWriteService` class.
     *
     * @param memberReadService The read service of the member.
     */
    constructor(memberReadService: MemberReadService) {
        this.#memberReadService = memberReadService;
    }

    /**
     * Creates a new member with the given data.
     *
     * @param member the object with the new data to be created.
     * @returns The ID of the created member, or NaN if the creation failed.
     */
    async create(member: MemberCreate) {
        this.#logger.debug('create: Creating member with data: %o', member);

        await this.#validateCreate(member);

        let memberDB: MemberCreated | undefined;
        await prismaClient.$transaction(async (prisma) => {
            memberDB = await prisma.member.create({
                data: member,
                include: {
                    address: true,
                    books: true,
                },
            });
        });
        await this.#sendmail({
            id: memberDB?.id ?? 'N/A',
            username: memberDB?.username ?? 'N/A',
        });

        this.#logger.debug('create: Member created with ID: %s', memberDB?.id);
        return memberDB?.id ?? Number.NaN;
    }

    /**
     * Updates a member with the given data. The update is only successful if the version of the member is up to date,
     * otherwise the update fails and NaN is returned.
     *
     * @param param0 The object, that holds the ID, th member data and the version string of the member.
     * @returns The version of the updated member, or NaN if the update failed.
     */
    async update({ id, member, version }: UpdateParameters) {
        this.#logger.debug(
            'update: Updating member with ID: %s, member: %o, version: %s',
            id,
            member,
            version,
        );
        if (id === undefined) {
            this.#logger.debug('update: ID is undefined, cannot update member');
            throw new NotFoundError();
        }

        await this.#validateUpdate(id, version);

        member.version = { increment: 1 };
        let memberUpdated: MemberUpdated | undefined;
        try {
            await prismaClient.$transaction(async (prisma) => {
                memberUpdated = await prisma.member.update({
                    where: { id },
                    data: member,
                });
            });
        } catch (error) {
            this.#logger.error('update: Error updating member with ID: %s', id);
            throw new NotFoundError();
        }
        this.#logger.debug(
            'update: Update member with data %s',
            JSON.stringify(memberUpdated),
        );

        return memberUpdated?.version ?? Number.NaN;
    }

    /**
     * Deletes a member with the given ID.
     *
     * @param id The ID of the member, that should be deleted.
     * @returns true if the member was deleted, otherwise false.
     */
    async delete(id: number) {
        this.#logger.debug('delete: Deleting member with ID: %s', id);

        const member = await prismaClient.member.findUnique({
            where: { id },
        });
        if (member === null) {
            this.#logger.debug('delete: Member with ID: %s not found', id);
            return false;
        }

        await prismaClient.$transaction(async (prisma) => {
            await prisma.member.delete({
                where: { id },
            });
        });

        this.#logger.debug('delete: Member with ID: %s deleted', id);
        return true;
    }

    /**
     * Validates the creation of a new member by checking if a member with the same username already exists.
     *
     * @param param0 The object, that holds the username to be checked.
     * @returns The function returns undefined if the validation is successful, otherwise it throws an error.
     */
    async #validateCreate({
        username,
    }: Prisma.MemberCreateInput): Promise<undefined> {
        this.#logger.debug(
            '#validateCreate: Validating member creation with username: %s',
            username,
        );
        if (username === undefined) {
            this.#logger.debug('#validateCreate: ok');
            return;
        }

        const count = await prismaClient.member.count({
            where: {
                username,
            },
        });
        if (count > 0) {
            this.#logger.debug(
                '#validateCreate: Member with username %s already exists',
                username,
            );
            throw new UsernameAlreadyExistsError(username);
        }
        this.#logger.debug('#validateCreate: ok');
    }

    /**
     * Sends an email to the admin, that a new member has been created.
     *
     * @param param0 the object, that holds the id and username of the new member.
     */
    async #sendmail({
        id,
        username,
    }: {
        id: number | 'N/A';
        username: string;
    }) {
        const subject = `New member with ID: ${id}`;
        const body = `The member with username <strong>${username}</strong> has been created.`;
        await sendmail({ subject, body });
    }

    /**
     * Validates the update of a member by checking if the version is valid and if the member with the given ID exists.
     *
     * @param id The ID of the member, tha should be updated.
     * @param versionStr The version of the member, that should be updated, as string.
     */
    async #validateUpdate(id: number, versionStr: string) {
        this.#logger.debug(
            '#validateUpdate: Validating member update with ID: %s, version: %s',
            id,
            versionStr,
        );
        if (!MemberWriteService.VERSION_PATTERN.test(versionStr)) {
            throw new VersionInvalidError(versionStr);
        }

        const version = Number.parseInt(versionStr.slice(1, -1), 10);
        const memberDB = await this.#memberReadService.findById({ id });

        if (version < memberDB.version) {
            this.#logger.debug(
                '#validateUpdate: Version %s is outdated, current version is %s',
                version,
                memberDB.version,
            );
            throw new VersionOutdatedError(version);
        }
    }
}
