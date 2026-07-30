import { parse } from 'graphql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GraphQLProvider,
  resolveHttpUri,
  resolveWsUri,
} from './GraphqlProvider';

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
