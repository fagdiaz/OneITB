import { parse } from 'graphql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GraphQLProvider,
  hasCanonicalPersistedSession,
  isAuthorizationFailure,
  normalizeGraphQLErrors,
  resolveHttpUri,
  resolveWsUri,
  shouldTerminateSessionForOperation,
} from './GraphqlProvider';
import { GET_INQUIRIES_PAGE } from './queries/inquiries';

const ENTITY_TYPES = [
  'User',
  'Inquiry',
  'Message',
  'Notification',
  'AcademicResource',
  'AcademicProgress',
  'JobOffer',
  'JobApplication',
];

const writePrivateEntities = (cache, suffix) => {
  ENTITY_TYPES.forEach((typeName) => {
    const entity = { __typename: typeName, id: `${typeName}-${suffix}` };
    cache.writeFragment({
      id: cache.identify(entity),
      fragment: parse(`fragment SessionEntity on ${typeName} { id }`),
      data: entity,
    });
  });
};

describe('GraphQLProvider session boundary', () => {
  let client;
  let unregisterTerminationHandler;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    client = new GraphQLProvider().apolloInstance;
    await client.clearStore();
  });

  afterEach(async () => {
    unregisterTerminationHandler?.();
    unregisterTerminationHandler = null;
    await client.clearStore();
    vi.restoreAllMocks();
  });

  it('purges every identity-scoped entity without reset refetches', async () => {
    writePrivateEntities(client.cache, 'user-a');
    expect(JSON.stringify(client.cache.extract())).toContain('User-user-a');

    await GraphQLProvider.invalidateSessionTransport();

    expect(client.cache.extract()).toEqual({});
  });

  it('starts user B from a cache that contains no user A entities', async () => {
    writePrivateEntities(client.cache, 'user-a');
    await GraphQLProvider.invalidateSessionTransport();
    writePrivateEntities(client.cache, 'user-b');

    const serializedCache = JSON.stringify(client.cache.extract());
    expect(serializedCache).not.toContain('user-a');
    expect(serializedCache).toContain('user-b');
  });

  it('coalesces concurrent termination requests into one transition', async () => {
    let releaseTermination;
    const gate = new Promise((resolve) => {
      releaseTermination = resolve;
    });
    const handler = vi.fn(() => gate);
    unregisterTerminationHandler = GraphQLProvider.registerSessionTerminationHandler(handler);

    const first = GraphQLProvider.requestSessionTermination('manual');
    const second = GraphQLProvider.requestSessionTermination('expired');

    expect(first).toBe(second);
    await Promise.resolve();
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('manual');

    releaseTermination();
    await first;
  });
});

describe('GraphQLProvider local transport', () => {
  it('uses the browser origin for HTTP and WebSocket defaults', () => {
    expect(resolveHttpUri()).toBe('/graphql');
    expect(resolveWsUri('/graphql')).toBe(
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/graphql`,
    );
  });
});

describe('GraphQLProvider feed cache isolation', () => {
  it('keeps inquiry pages isolated by career filters', () => {
    const client = new GraphQLProvider().apolloInstance;
    const variablesFor = (careerIds) => ({
      searchTerm: null,
      careerId: null,
      careerIds,
      subjectIds: null,
      inquiryId: null,
      authorId: null,
      first: 15,
      after: null,
    });
    const inquiry = (id, title) => ({
      __typename: 'Inquiry',
      id,
      title,
      content: 'Contenido',
      fileUrl: null,
      attachments: [],
      publishDate: '2026-08-05T00:00:00Z',
      isActive: true,
      isHiddenByModerator: false,
      preferAttachmentCover: false,
      reportCount: 0,
      user: {
        __typename: 'User',
        id: `user-${id}`,
        firstName: 'Usuario',
        lastName: id,
        avatarUrl: null,
        role: 'Estudiante',
        totalPosts: 1,
        totalComments: 0,
        totalLikesReceived: 0,
        totalReportsReceived: 0,
      },
      subject: { __typename: 'Subject', id: Number(id), name: title, code: `S${id}` },
      reactions: [],
      comments: [],
    });
    const writePage = (careerIds, item) => client.writeQuery({
      query: GET_INQUIRIES_PAGE,
      variables: variablesFor(careerIds),
      data: {
        inquiriesPage: {
          __typename: 'InquiryPage',
          hasNextPage: false,
          nextCursor: '',
          totalCount: 1,
          items: [item],
        },
      },
    });

    writePage([1], inquiry('1', 'Carrera uno'));
    writePage([2], inquiry('2', 'Carrera dos'));

    const firstCareer = client.readQuery({ query: GET_INQUIRIES_PAGE, variables: variablesFor([1]) });
    const secondCareer = client.readQuery({ query: GET_INQUIRIES_PAGE, variables: variablesFor([2]) });
    expect(firstCareer.inquiriesPage.items.map((item) => item.id)).toEqual(['1']);
    expect(secondCareer.inquiriesPage.items.map((item) => item.id)).toEqual(['2']);
  });
});

describe('GraphQLProvider authorization classification', () => {
  const authErrors = [{
    message: 'The current user is not authorized.',
    extensions: { code: 'AUTH_NOT_AUTHORIZED' },
  }];

  it('recognizes authorization failures without treating public identity exchanges as expiry', () => {
    expect(isAuthorizationFailure(authErrors)).toBe(true);
    expect(
      shouldTerminateSessionForOperation('MicrosoftLogin', authErrors),
    ).toBe(false);
    expect(
      shouldTerminateSessionForOperation('GetUserProfile', authErrors),
    ).toBe(true);
  });

  it('normalizes non-array GraphQL error payloads before authorization checks', () => {
    expect(normalizeGraphQLErrors({ errors: authErrors })).toEqual(authErrors);
    expect(normalizeGraphQLErrors(authErrors[0])).toEqual(authErrors);
    expect(normalizeGraphQLErrors(undefined)).toEqual([]);
    expect(isAuthorizationFailure({ errors: authErrors })).toBe(true);
  });

  it('requires both a token and a valid user identity before expiring a session', () => {
    localStorage.setItem('token', 'orphan-token');
    expect(hasCanonicalPersistedSession()).toBe(false);

    localStorage.setItem('user', JSON.stringify({ id: 'user-1' }));
    expect(hasCanonicalPersistedSession()).toBe(true);
  });
});
