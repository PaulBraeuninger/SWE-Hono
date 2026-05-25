/**
 * The module `member-write-router` defines the router for the member write API.
 * @packageDocumentation
 */

import {
    type MemberCreate,
    type MemberUpdate,
} from '../service/member-write-service.mts';
import {
    MemberCreateSchema,
    type MemberCreateType,
    MemberUpdateSchema,
    type MemberUpdateType,
} from './member-validation.mts';
import {
    createProblemDetails,
    preconditionRequired,
} from '../../problem-details.mts';
import { Hono } from 'hono';
import { container } from '../../container.mts';
import { createBaseUrl } from './create-base-url.mts';
import { getLogger } from '../../logger/logger.mts';
import { rolesRequired } from '../../security/roles-required.mts';

const { memberWriteService } = container;

/**
 * The router to create new member.
 */
export const router = new Hono();

const logger = getLogger('member-write-router', 'file');

// ---------------------------------------------------------------------------------------------------------------------------------
// C R E A T E
// ---------------------------------------------------------------------------------------------------------------------------------
const memberDtoToMemberCreateInput = (
    memberDTO: MemberCreateType,
): MemberCreate => {
    const address = {
        postalCode: memberDTO.address?.postal_code,
        place: memberDTO.address?.place,
    };
    const books = memberDTO.books?.map((bookDTO) => {
        const book = {
            name: bookDTO.name,
            isbn: bookDTO.isbn,
            author: bookDTO.author ?? null,
            genre: bookDTO.genre ?? null,
        };
        return book;
    });
    const member: MemberCreate = {
        username: memberDTO.username,
        lastName: memberDTO.last_name,
        firstName: memberDTO.first_name,
        gender: memberDTO.gender ?? null,
        dateOfBirth: memberDTO.date_of_birth,
        memberSince: memberDTO.member_since ?? null,
        isStudent: memberDTO.is_student ?? false,
        emailAddress: memberDTO.email_address,
        interests: memberDTO.interests ?? [],
        version: 0,
        address: {
            create: address,
        },
        books: {
            create: books ?? [],
        },
    };
    return member;
};

router.post('/', rolesRequired('admin', 'user'), async (c) => {
    const requestBody = await c.req.json();

    // Validate the request body against the schema and parse it into a DTO.
    const memberDTO = MemberCreateSchema.parse(requestBody);
    logger.debug('post: memberDTO=%o', memberDTO);

    // Convert the DTO to the input type for the service layer.
    const member = memberDtoToMemberCreateInput(memberDTO);
    const id = await memberWriteService.create(member);

    // Set the Location header to the URL of the newly created member and return a 201 Created response.
    const location = `${createBaseUrl(c.req)}/${id}`;
    const { header, body } = c;
    header('Location', location);
    return body(null, 201);
});

// ---------------------------------------------------------------------------------------------------------------------------------
// U P D A T E
// ---------------------------------------------------------------------------------------------------------------------------------
const memberDtoToMemberUpdateInput = (
    memberDTO: MemberUpdateType,
): MemberUpdate => {
    return {
        lastName: memberDTO.last_name,
        firstName: memberDTO.first_name,
        gender: memberDTO.gender ?? null,
        dateOfBirth: memberDTO.date_of_birth,
        memberSince: memberDTO.member_since ?? null,
        isStudent: memberDTO.is_student ?? false,
        interests: memberDTO.interests ?? [],
        version: 0,
    };
};

router.put('/:id', rolesRequired('admin', 'user'), async (c) => {
    const { req } = c;
    const id = c.req.param('id') ?? '-1';
    logger.debug('put: id=%s', id);

    const idNumber = Number.parseInt(id, 10);
    if (Number.isNaN(idNumber)) {
        return c.notFound();
    }

    const version = req.header('If-Match');
    logger.debug('put: version=%s', version);
    if (version === undefined) {
        logger.debug('put: version header is missing');
        return createProblemDetails(
            c,
            preconditionRequired,
            'Version fehlt im Header',
        );
    }

    const requestBody = await c.req.json();
    logger.debug('put: requestBody=%o', requestBody);

    // Validate the request body against the schema and parse it into a DTO.
    const memberDTO = MemberUpdateSchema.parse(requestBody);
    logger.debug('put: memberDTO=%o', memberDTO);

    // Convert the DTO to the input type for the service layer.
    const member = memberDtoToMemberUpdateInput(memberDTO);
    const newVersion = await memberWriteService.update({
        id: idNumber,
        member,
        version,
    });
    logger.debug('put: newVersion=%s', newVersion);

    const headers = {
        ETag: `"${newVersion}"`,
    };
    return c.body(null, 204, headers);
});

// ---------------------------------------------------------------------------------------------------------------------------------
// D E L E T E
// ---------------------------------------------------------------------------------------------------------------------------------
router.delete('/:id', rolesRequired('admin'), async (c) => {
    const id = c.req.param('id') ?? '-1';
    logger.debug('delete: id=%s', id);

    const idNumber = Number.parseInt(id, 10);
    const { body } = c;
    if (Number.isNaN(idNumber)) {
        return c.notFound();
    }

    await memberWriteService.delete(idNumber);
    return body(null, 204);
});
