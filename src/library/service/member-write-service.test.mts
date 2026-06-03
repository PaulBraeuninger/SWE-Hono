import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Prisma } from '../../generated/prisma/client.ts';
import { Gender, Genre } from '../../generated/prisma/enums.ts';
import { MemberReadService } from './member-read-service.mts';
import {
    type MemberCreate,
    MemberWriteService,
} from './member-write-service.mts';

const { createMock, countMock, transactionMock, sendmailMock } = vi.hoisted(
    () => ({
        createMock: vi.fn<Prisma.MemberDelegate['create']>(),
        countMock: vi.fn<Prisma.MemberDelegate['count']>(),
        transactionMock: vi.fn(),
        sendmailMock: vi.fn(),
    }),
);

vi.mock('../../config/prisma-client.mts', () => ({
    prismaClient: {
        member: {
            create: createMock,
            count: countMock,
        },
        $transaction: transactionMock,
    },
}));

vi.mock('../../mail/sendmail.mts', () => ({
    sendmail: sendmailMock,
}));

describe('MemberWriteService create', () => {
    let memberReadService: MemberReadService;
    let memberWriteService: MemberWriteService;

    beforeEach(() => {
        memberReadService = new MemberReadService();
        memberWriteService = new MemberWriteService(memberReadService);

        createMock.mockReset();
        countMock.mockReset();
        transactionMock.mockReset();
        sendmailMock.mockReset();

        transactionMock.mockImplementation(async (callback) => {
            return callback({
                member: {
                    create: createMock,
                    count: countMock,
                },
            });
        });
    });

    test('New member', async () => {
        //given
        const idMock = 1;
        const memberCreate: MemberCreate = {
            username: 'servicetestuser',
            firstName: 'Test',
            lastName: 'User',
            gender: Gender.DIVERSE,
            dateOfBirth: new Date('2000-01-01'),
            memberSince: new Date('2024-01-01'),
            isStudent: true,
            emailAddress: 'service.test.user@acme.com',
            interests: [Genre.FANTASY, Genre.SCIENCE_FICTION],
            address: {
                create: {
                    place: 'Test City',
                    postalCode: '12345',
                },
            },
            books: {
                create: [
                    {
                        name: 'Test Book 1',
                        isbn: '978-3-16-148410-0',
                        author: 'Test Author 1',
                        genre: Genre.FANTASY,
                    },
                ],
            },
        };

        const memberTmp: any = { ...memberCreate };
        memberTmp.id = idMock;
        memberTmp.address.create.id = 11;
        memberTmp.books.create[0].id = 111;

        createMock.mockResolvedValue(memberTmp);
        sendmailMock.mockResolvedValue(undefined);

        // when
        const id = await memberWriteService.create(memberCreate);

        // then
        expect(id).toBe(idMock);
        expect(createMock).toHaveBeenCalledTimes(1);
    });
});
