import {
    APPLICATION_JSON,
    AUTHORIZATION,
    BEARER,
    CONTENT_TYPE,
    LOCATION,
    POST,
    restURL,
} from '../constants.mts';
import { beforeAll, describe, expect, test } from 'vitest';
import { MemberCreateType } from '../../../src/library/router/member-validation.mts';
import { MemberReadService } from '../../../src/library/service/member-read-service.mts';
import { ProblemDetails } from '../../../src/problem-details.mts';
import { getToken } from '../token.mts';

// ---------------------------------------------------------------------------------------------------------------------------------
// T e s t  d a t a
// ---------------------------------------------------------------------------------------------------------------------------------