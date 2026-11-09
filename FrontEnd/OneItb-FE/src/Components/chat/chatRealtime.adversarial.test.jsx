import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { GraphQLProvider } from '../../data/graphql/GraphqlProvider';
import { GET_CONVERSATION, GET_MESSAGING_CONTACTS } from '../../data/graphql/chat';
import { clearConversationUnread, MESSAGE_FRAGMENT } from './chatCache';
import { useChatSubscription } from './useChatSubscription';

const wire = vi.hoisted(() => ({ sockets: [] }));

// Keep the installed graphql-ws retry, multiplexing and protocol code.
// Substitute only the wire and the randomized retry delay.
vi.mock('graphql-ws', async (importOriginal) => {
  const actual = await importOriginal();
  class TestSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    readyState = TestSocket.CONNECTING;
    sent = [];
    constructor() { wire.sockets.push(this); }
    send(json) { this.sent.push(JSON.parse(json)); }
    receive(frame) { this.onmessage({ data: JSON.stringify(frame) }); }
    async open() {
      this.readyState = TestSocket.OPEN;
      await this.onopen();
    }
    close(code, reason) {
      if (this.readyState === TestSocket.CLOSED) return;
      this.readyState = TestSocket.CLOSED;
      this.onclose?.({ code, reason, wasClean: code === 1000 });
    }
  }
  return {
    ...actual,
    createClient: (options) => actual.createClient({
      ...options, webSocketImpl: TestSocket, retryWait: async () => {},
    }),
  };
});

const me = '00000000-0000-4000-8000-000000000001';
const peer = '00000000-0000-4000-8000-000000000002';
const thread = { query: GET_CONVERSATION, variables: { otherUserId: peer, first: 100 } };
const contacts = { query: GET_MESSAGING_CONTACTS, variables: { first: 100 } };
const pageInfo = { __typename: 'PageInfo', hasNextPage: false, endCursor: null };
const user = (id) => ({ __typename: 'User', id, firstName: 'Test', lastName: 'Chat', avatarUrl: null });
const message = (index) => ({
  __typename: 'Message', id: `10000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
  senderId: peer, receiverId: me, sender: user(peer), receiver: user(me),
  content: `Evento ${index}`, sentAt: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
  isRead: false,
  attachments: [],
});

let client;
function mount(options = {}) {
  const wrapper = ({ children }) => <ApolloProvider client={client}>{children}</ApolloProvider>;
  return renderHook(() => useChatSubscription({ auth: { id: me }, ...options }), { wrapper });
}
async function acknowledge(index) {
  await waitFor(() => expect(wire.sockets).toHaveLength(index + 1));
  const socket = wire.sockets[index];
  await act(async () => { await socket.open(); });
  expect(socket.sent).toEqual([{ type: 'connection_init', payload: { authorization: 'Bearer fixture-A' } }]);
  await act(async () => { socket.receive({ type: 'connection_ack' }); });
  await waitFor(() => expect(socket.sent.filter((f) => f.type === 'subscribe')).toHaveLength(1));
  const subscription = socket.sent.find((f) => f.type === 'subscribe');
  expect(subscription.payload.operationName).toBe('MessageReceived');
  return { socket, deliver: (item) => socket.receive({
    id: subscription.id, type: 'next', payload: { data: { messageReceived: item } },
  }) };
}
function seed() {
  client.writeQuery({ ...thread, data: { conversation: {
    __typename: 'ConversationConnection', nodes: [], pageInfo,
  } } });
  client.writeQuery({ ...contacts, data: { messagingContacts: {
    __typename: 'MessagingContactsConnection', pageInfo, nodes: [{
      __typename: 'MessagingContact', userId: peer, firstName: 'Test', lastName: 'Peer',
      role: 'Estudiante', avatarUrl: null, lastMessageAt: null, lastMessageContent: '', unreadCount: 0,
    }],
  } } });
}
const nodes = () => client.readQuery(thread).conversation.nodes;
const contact = () => client.readQuery(contacts).messagingContacts.nodes[0];

beforeEach(async () => {
  wire.sockets.length = 0;
  localStorage.setItem('token', 'fixture-A');
  client = new GraphQLProvider().apolloInstance;
  await client.clearStore();
  vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
    const body = JSON.parse(options.body);
    if (body.operationName !== 'MarkConversationRead') throw new Error(body.operationName);
    return new Response(JSON.stringify({ data: { markConversationRead: {
      __typename: 'MarkConversationReadPayload', otherUserId: peer, markedCount: 0,
    } } }), { headers: { 'Content-Type': 'application/json' } });
  }));
});
afterEach(async () => {
  cleanup();
  try {
    await waitFor(() => expect(wire.sockets.every((socket) => socket.readyState === 3)).toBe(true));
    await client.clearStore();
  } finally {
    localStorage.clear();
    vi.unstubAllGlobals();
  }
});

it.each([
  ['open', true, peer, [1, 1, 1]],
  ['closed', false, peer, [1, 0, 0]],
  ['no selection', true, null, [1, 1, 0]],
])('RT-01 %s: one reconciliation per recovered connection for eligible queries',
  async (_label, isOpen, selectedContactId, expected) => {
    const refetch = Array.from({ length: 3 }, () => vi.fn().mockResolvedValue({}));
    const { result } = mount({ isOpen, selectedContactId,
      refetchContacts: refetch[0], refetchActive: refetch[1], refetchConversation: refetch[2] });
    let { socket } = await acknowledge(0);
    for (let cycle = 1; cycle <= 3; cycle += 1) {
      refetch.forEach((fn) => fn.mockClear());
      await act(async () => { socket.close(1006, 'synthetic network loss'); });
      await waitFor(() => expect(result.current.socketStatus).toBe('connecting'));
      ({ socket } = await acknowledge(cycle));
      expect(result.current.socketStatus).toBe('connected');
      expect(refetch.map((fn) => fn.mock.calls.length)).toEqual(expected);
    }
  });

it('RT-02: 64 distinct messages plus 16 repeated frames yield 64 nodes and 64 unread', async () => {
  seed();
  mount({ isOpen: false });
  const { deliver } = await acknowledge(0);
  const batch = Array.from({ length: 64 }, (_, index) => message(index));
  await act(async () => {
    batch.forEach(deliver);
    batch.slice(0, 16).forEach(deliver);
  });
  expect(nodes().map((item) => item.id).sort()).toEqual(batch.map((item) => item.id).sort());
  expect.soft(contact().unreadCount).toBe(64);
  expect.soft(contact().lastMessageAt).toBe(batch[63].sentAt);
});

it('RT-03: marking read updates the normalized Message and the thread', async () => {
  seed();
  mount({ isOpen: false });
  const { deliver } = await acknowledge(0);
  const item = message(1);
  await act(async () => { deliver(item); });
  expect(nodes()[0].isRead).toBe(false);
  expect(contact().unreadCount).toBe(1);
  clearConversationUnread(client.cache, peer, me);
  expect(contact().unreadCount).toBe(0);
  const entity = client.cache.readFragment({ id: client.cache.identify(item), fragment: MESSAGE_FRAGMENT });
  expect(entity.isRead).toBe(true);
  expect(nodes()[0].isRead).toBe(true);
});

it('RT-04: a burst from one new peer shares the pending active-list refresh', async () => {
  let finish;
  const pending = new Promise((resolve) => { finish = resolve; });
  const refetchActive = vi.fn().mockResolvedValue({});
  mount({ refetchActive, activeData: { activeConversations: { nodes: [] } } });
  const { deliver } = await acknowledge(0);
  refetchActive.mockClear();
  refetchActive.mockImplementation(() => pending);
  try {
    await act(async () => { for (let i = 0; i < 32; i += 1) deliver(message(i)); });
    expect(refetchActive).toHaveBeenCalledTimes(1);
  } finally {
    finish({});
  }
});

it('RT-05: unmount completes the subscription and ignores a queued frame', async () => {
  seed();
  const { unmount } = mount({ isOpen: false });
  const { socket, deliver } = await acknowledge(0);
  const id = socket.sent.find((frame) => frame.type === 'subscribe').id;
  unmount();
  await waitFor(() => expect(socket.sent.filter((f) => f.type === 'complete')).toEqual([{ type: 'complete', id }]));
  await act(async () => { deliver(message(1)); });
  expect(nodes()).toEqual([]);
  expect(contact().unreadCount).toBe(0);
});

it('RT-06: nine consecutive losses before ACK exhaust the configured retry budget', async () => {
  const { result } = mount({ isOpen: false });
  for (let attempt = 0; attempt <= 8; attempt += 1) {
    await waitFor(() => expect(wire.sockets).toHaveLength(attempt + 1));
    const socket = wire.sockets[attempt];
    await act(async () => {
      await socket.open();
      socket.close(1006, 'synthetic repeated loss');
    });
  }
  await waitFor(() => expect(result.current.subscriptionError?.message).toMatch(/1006/));
  expect(result.current.socketStatus).toBe('disconnected');
  expect(wire.sockets).toHaveLength(9);
  expect(wire.sockets.flatMap((socket) => socket.sent).filter((f) => f.type === 'subscribe')).toEqual([]);
});
