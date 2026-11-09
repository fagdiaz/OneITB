import React, { useContext } from 'react';
import { gql } from '@apollo/client';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AuthContext, AuthProvider } from './AuthContext';
import { GraphQLProvider } from '../data/graphql/GraphqlProvider';
import { MARK_CONVERSATION_READ, MESSAGE_RECEIVED } from '../data/graphql/chat';

const wire = vi.hoisted(() => ({ terminate: vi.fn(), sinks: [] }));
vi.mock('graphql-ws', () => ({
  createClient: () => ({
    terminate: wire.terminate,
    subscribe: (_operation, sink) => {
      wire.sinks.push(sink);
      return () => {};
    },
  }),
}));
vi.mock('../auth/microsoftEntra', () => ({
  clearMicrosoftIdentitySession: vi.fn().mockResolvedValue(undefined),
}));

const privateEntity = gql`fragment SessionMessage on Message { id content }`;
let client;
function persist(id) {
  localStorage.setItem('token', `fixture-${id}`);
  localStorage.setItem('user', JSON.stringify({ id, role: 'Estudiante' }));
}
function writeEntity(cache, id, content) {
  const entity = { __typename: 'Message', id, content };
  cache.writeFragment({ id: cache.identify(entity), fragment: privateEntity, data: entity });
}
async function receivingTab() {
  persist('A');
  const { result } = renderHook(() => useContext(AuthContext), { wrapper: AuthProvider });
  await waitFor(() => expect(result.current.auth.id).toBe('A'));
  writeEntity(client.cache, 'A-base', 'A private data');
  client.cache.recordOptimisticTransaction((layer) => {
    writeEntity(layer, 'A-pending', 'A optimistic data');
  }, 'pending-A');
  expect(JSON.stringify(client.cache.extract(false))).toContain('A-base');
  expect(JSON.stringify(client.cache.extract(true))).toContain('A-pending');
  return result;
}
function remote(key, oldValue, newValue) {
  window.dispatchEvent(new StorageEvent('storage', { key, oldValue, newValue, storageArea: localStorage }));
}

beforeEach(async () => {
  localStorage.clear();
  wire.terminate.mockClear();
  wire.sinks.length = 0;
  client = new GraphQLProvider().apolloInstance;
  await client.clearStore();
});
afterEach(async () => {
  cleanup();
  await client.clearStore();
  localStorage.clear();
  vi.unstubAllGlobals();
});

it('MT-01: remote logout removes committed and optimistic data and terminates transport once', async () => {
  const result = await receivingTab();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  await act(async () => {
    remote('token', 'fixture-A', null);
    remote('user', JSON.stringify({ id: 'A', role: 'Estudiante' }), null);
    await GraphQLProvider.waitForSessionTermination();
  });
  expect(result.current.isAuthenticated).toBe(false);
  expect(result.current.auth.id).toBeUndefined();
  expect(result.current.token).toBeNull();
  expect(localStorage.getItem('token')).toBeNull();
  expect(localStorage.getItem('user')).toBeNull();
  expect(wire.terminate).toHaveBeenCalledTimes(1);
  expect(client.cache.extract(false)).toEqual({});
  expect(client.cache.extract(true)).toEqual({});
});

it('MT-02: direct remote A -> B replacement retires A without destroying the new persisted session', async () => {
  const result = await receivingTab();
  const oldUser = localStorage.getItem('user');
  persist('B');
  await act(async () => {
    remote('token', 'fixture-A', 'fixture-B');
    remote('user', oldUser, localStorage.getItem('user'));
    await GraphQLProvider.waitForSessionTermination();
  });
  // A signed-out receiving tab or one hydrated as B is acceptable.
  await waitFor(() => expect(result.current.auth.id).not.toBe('A'));
  if (result.current.isAuthenticated) expect(result.current.auth.id).toBe('B');
  expect(result.current.token).toBe(result.current.isAuthenticated ? 'fixture-B' : null);
  expect(localStorage.getItem('token')).toBe('fixture-B');
  expect(JSON.parse(localStorage.getItem('user')).id).toBe('B');
  expect(wire.terminate).toHaveBeenCalled();
  expect(JSON.stringify(client.cache.extract(false))).not.toContain('A-base');
  expect(JSON.stringify(client.cache.extract(true))).not.toContain('A-pending');
});

it('MT-03: an old logout notification delivered after login B cannot delete B', async () => {
  const result = await receivingTab();
  await act(async () => { await result.current.login('fixture-B', { id: 'B' }); });
  writeEntity(client.cache, 'B-current', 'B private data');
  const terminationCount = wire.terminate.mock.calls.length;
  await act(async () => {
    // Browser queues storage events. Shared storage already contains the newer login.
    remote('token', 'fixture-A', null);
    await GraphQLProvider.waitForSessionTermination();
  });
  expect(localStorage.getItem('token')).toBe('fixture-B');
  expect(JSON.parse(localStorage.getItem('user')).id).toBe('B');
  expect(result.current.auth.id).toBe('B');
  expect(wire.terminate).toHaveBeenCalledTimes(terminationCount);
  expect(JSON.stringify(client.cache.extract(true))).toContain('B-current');
});

it('MT-04: a delayed frame from the old epoch never reaches the observer or cache of B', async () => {
  const result = await receivingTab();
  const seenA = vi.fn();
  const seenB = vi.fn();
  const subscribe = (next) => client.subscribe({ query: MESSAGE_RECEIVED }).subscribe({ next });
  const deliver = (sink, id) => sink.next({ data: { messageReceived: {
    __typename: 'Message', id, content: id, senderId: 'peer', receiverId: 'self',
    sentAt: '2026-11-08T12:00:00Z', isRead: false, attachments: [], sender: null, receiver: null,
  } } });
  const old = subscribe(seenA);
  let current;
  try {
    await waitFor(() => expect(wire.sinks).toHaveLength(1));
    await act(async () => { deliver(wire.sinks[0], 'A-before'); });
    expect(seenA).toHaveBeenCalledTimes(1);
    await act(async () => { await result.current.login('fixture-B', { id: 'B' }); });
    current = subscribe(seenB);
    await waitFor(() => expect(wire.sinks).toHaveLength(2));
    await act(async () => {
      deliver(wire.sinks[0], 'A-late');
      deliver(wire.sinks[1], 'B-current');
    });
    expect(seenA).toHaveBeenCalledTimes(1);
    expect(seenB).toHaveBeenCalledTimes(1);
    expect(seenB.mock.calls[0][0].data.messageReceived.id).toBe('B-current');
    const snapshot = JSON.stringify(client.cache.extract(true));
    expect(snapshot).not.toContain('A-before');
    expect(snapshot).not.toContain('A-late');
    expect(snapshot).toContain('B-current');
  } finally {
    old.unsubscribe();
    current?.unsubscribe();
  }
});

it('MT-05: after a read in one tab, a network refresh in its sibling must match the mutation', async () => {
  persist('A');
  // Independent JS module instance and Apollo store, shared same-origin identity.
  vi.resetModules();
  const { GraphQLProvider: SiblingProvider } = await import('../data/graphql/GraphqlProvider');
  const sibling = new SiblingProvider().apolloInstance;
  expect(sibling.cache).not.toBe(client.cache);
  const query = gql`query Conversation($otherUserId: UUID!) {
    conversation(otherUserId: $otherUserId) { nodes { id isRead } }
  }`;
  const peer = '00000000-0000-4000-8000-000000000002';
  const request = { query, variables: { otherUserId: peer } };
  let serverRead = false;
  const backend = vi.fn(async (_url, options) => {
    const operation = JSON.parse(options.body);
    expect(options.headers.authorization).toBe('Bearer fixture-A');
    expect(operation.variables.otherUserId).toBe(peer);
    let data;
    if (operation.operationName === 'MarkConversationRead') {
      serverRead = true;
      data = { markConversationRead: { __typename: 'MarkConversationReadPayload',
        otherUserId: peer, markedCount: 1 } };
    } else if (operation.operationName === 'Conversation') {
      data = { conversation: { __typename: 'ConversationConnection', nodes: [{
        __typename: 'Message', id: 'shared-message', isRead: serverRead,
      }] } };
    } else throw new Error(operation.operationName);
    return new Response(JSON.stringify({ data }), { headers: { 'Content-Type': 'application/json' } });
  });
  vi.stubGlobal('fetch', backend);
  try {
    await Promise.all([client.query(request), sibling.query(request)]);
    expect(sibling.readQuery(request).conversation.nodes[0].isRead).toBe(false);
    const { data } = await client.mutate({ mutation: MARK_CONVERSATION_READ, variables: request.variables });
    expect(data.markConversationRead.markedCount).toBe(1);
    await sibling.query({ ...request, fetchPolicy: 'network-only' });
    expect(sibling.readQuery(request).conversation.nodes[0].isRead).toBe(true);
    expect(backend).toHaveBeenCalledTimes(4);
  } finally {
    await sibling.clearStore();
    sibling.stop();
  }
});
