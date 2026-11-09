import React, { useContext } from 'react';
import { ApolloProvider } from '@apollo/client';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AuthContext, AuthProvider } from '../../context/AuthContext';
import { GraphQLProvider } from '../../data/graphql/GraphqlProvider';
import { GET_CONVERSATION, GET_MESSAGING_CONTACTS } from '../../data/graphql/chat';
import { MiniChatWidget } from './MiniChatWidget';
import { PrivateChat } from './PrivateChat';

const wire = vi.hoisted(() => ({
  sockets: [], retries: [], active: new Set(), sequence: 0, terminations: 0,
}));
vi.mock('../../auth/microsoftEntra', () => ({
  clearMicrosoftIdentitySession: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('graphql-ws', async (importOriginal) => {
  const actual = await importOriginal();
  class ControlledSocket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    readyState = ControlledSocket.CONNECTING;
    frames = [];
    constructor() { wire.sockets.push(this); }
    send(json) { this.frames.push(JSON.parse(json)); }
    async open() {
      this.readyState = ControlledSocket.OPEN;
      await this.onopen();
    }
    receive(frame) { this.onmessage?.({ data: JSON.stringify(frame) }); }
    close(code, reason) {
      if (this.readyState === ControlledSocket.CLOSED) return;
      this.readyState = ControlledSocket.CLOSED;
      this.onclose?.({ code, reason, wasClean: code === 1000 });
    }
  }
  return {
    ...actual,
    createClient: (options) => {
      const client = actual.createClient({
        ...options, webSocketImpl: ControlledSocket,
        // Explicit scheduler. Retries can advance only when a test releases them.
        retryWait: () => new Promise((resolve) => { wire.retries.push(resolve); }),
      });
      return {
        ...client,
        terminate: () => { wire.terminations += 1; client.terminate(); },
        subscribe: (operation, sink) => {
          const key = ++wire.sequence;
          wire.active.add(key);
          const release = client.subscribe(operation, {
            next: (value) => sink.next(value),
            error: (error) => { wire.active.delete(key); sink.error(error); },
            complete: () => { wire.active.delete(key); sink.complete(); },
          });
          return () => { wire.active.delete(key); release(); };
        },
      };
    },
  };
});

const a = '00000000-0000-4000-8000-000000000001';
const peer = '00000000-0000-4000-8000-000000000002';
const b = '00000000-0000-4000-8000-000000000003';
const text = 'GOB12 envío pendiente';
const pageInfo = { __typename: 'PageInfo', hasNextPage: false, endCursor: null };
const person = (id) => ({
  __typename: 'User', id, firstName: id === peer ? 'Peer' : 'Fixture',
  lastName: id === peer ? 'Contact' : 'Account', role: 'Profesor', avatarUrl: null,
});
const item = (id, content, senderId = a, receiverId = peer) => ({
  __typename: 'Message', id, content, senderId, receiverId,
  sentAt: '2026-11-09T12:00:00Z', isRead: false, attachments: [],
  sender: person(senderId), receiver: person(receiverId),
});
const thread = { query: GET_CONVERSATION, variables: { otherUserId: peer, first: 50 } };
const contacts = { query: GET_MESSAGING_CONTACTS, variables: { first: 50 } };
const response = (data) => new Response(JSON.stringify({ data }), {
  status: 200, headers: { 'Content-Type': 'application/json' },
});
let client;
let pending;
let stored;
let requests;
let scrollDescriptor;

function persist(id) {
  localStorage.setItem('token', `fixture-${id}`);
  localStorage.setItem('user', JSON.stringify({ id, username: 'Fixture' }));
}
function SessionSurface({ surface }) {
  const session = useContext(AuthContext);
  return <>
    <output data-testid="identity">{session.auth.id || 'signed-out'}</output>
    {!session.isLoading && session.auth.id && (
      surface === 'widget' ? <MiniChatWidget /> : <PrivateChat />
    )}
  </>;
}
async function mount(surface = 'page') {
  render(<ApolloProvider client={client}>
    <AuthProvider>
      <MemoryRouter initialEntries={[surface === 'page' ? `/chat?peerId=${peer}` : '/feed']}>
        <SessionSurface surface={surface} />
      </MemoryRouter>
    </AuthProvider>
  </ApolloProvider>);
  await waitFor(() => expect(screen.getByTestId('identity').textContent).toBe(a));
  if (surface === 'widget') {
    fireEvent.click(await screen.findByRole('button', { name: /Abrir chat/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Peer Contact/ }));
  }
  await screen.findByPlaceholderText('Escribí un mensaje...');
}
async function acknowledge(index, identity = a) {
  if (wire.sockets.length <= index && wire.retries.length > 0) {
    await act(async () => { wire.retries.shift()(); });
  }
  await waitFor(() => expect(wire.sockets).toHaveLength(index + 1));
  const socket = wire.sockets[index];
  await act(async () => { await socket.open(); });
  expect(socket.frames).toEqual([{
    type: 'connection_init', payload: { authorization: `Bearer fixture-${identity}` },
  }]);
  await act(async () => { socket.receive({ type: 'connection_ack' }); });
  await waitFor(() => expect(socket.frames.filter((frame) => frame.type === 'subscribe')).toHaveLength(1));
  const subscription = socket.frames.find((frame) => frame.type === 'subscribe');
  expect(subscription.payload.operationName).toBe('MessageReceived');
  return {
    socket,
    deliver: (message) => socket.receive({
      id: subscription.id, type: 'next', payload: { data: { messageReceived: message } },
    }),
  };
}
async function releaseRetry() {
  await waitFor(() => expect(wire.retries).toHaveLength(1));
  await act(async () => { wire.retries.shift()(); });
}
async function startSend() {
  fireEvent.change(screen.getByPlaceholderText('Escribí un mensaje...'), { target: { value: text } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
  await waitFor(() => expect(pending).toHaveLength(1));
  expect(pending[0].input.receiverId).toBe(peer);
  expect(pending[0].input.clientMessageId).toMatch(/^[a-f0-9-]{36}$/i);
  expect(pending[0].input.uploadIds).toEqual([]);
  expect(pending[0].input.content).toBe(text);
  const messages = client.readQuery(thread, true).conversation.nodes;
  expect(messages.filter((message) => message.content === text).map((message) => message.id))
    .toEqual([`optimistic-${pending[0].input.clientMessageId}`]);
}
function assertSingleBubble(expectedId) {
  const messages = client.readQuery(thread, true).conversation.nodes.filter((message) => message.content === text);
  expect(messages).toHaveLength(1);
  if (expectedId) expect(messages[0].id).toBe(expectedId);
  expect(screen.getAllByText(text, { selector: 'p' })).toHaveLength(1);
  expect(client.readQuery(contacts, true).messagingContacts.nodes[0].unreadCount).toBe(0);
}
async function resolveHttp(message) {
  await act(async () => { pending[0].resolve(response({ sendPrivateMessage: message })); });
}
function storageEvent(oldValue, newValue) {
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'token', oldValue, newValue, storageArea: localStorage,
  }));
}

beforeEach(async () => {
  wire.sockets.length = 0;
  wire.retries.length = 0;
  wire.terminations = 0;
  expect(wire.active.size).toBe(0);
  persist(a);
  client = new GraphQLProvider().apolloInstance;
  await client.clearStore();
  pending = [];
  stored = [];
  requests = [];
  scrollDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView');
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
  vi.stubGlobal('fetch', vi.fn(async (_url, options) => {
    const operation = JSON.parse(options.body);
    requests.push(operation.operationName);
    const auth = options.headers.authorization;
    const identity = auth === `Bearer fixture-${a}` ? a : auth === `Bearer fixture-${b}` ? b : null;
    if (!identity) throw new Error('GOB12 unexpected unauthenticated HTTP operation');
    if (operation.operationName === 'SendPrivateMessage') {
      return new Promise((resolve) => pending.push({ resolve, input: operation.variables.input }));
    }
    if (operation.operationName === 'Conversation') {
      expect(operation.variables.otherUserId).toBe(peer);
      return response({ conversation: {
        __typename: 'ConversationConnection', pageInfo,
        nodes: stored.filter((message) => (
          message.senderId === identity && message.receiverId === peer
        ) || (message.senderId === peer && message.receiverId === identity)),
      } });
    }
    if (operation.operationName === 'MessagingContacts') return response({ messagingContacts: {
      __typename: 'MessagingContactsConnection', pageInfo, nodes: [{
        __typename: 'MessagingContact', userId: peer, firstName: 'Peer', lastName: 'Contact',
        role: 'Profesor', avatarUrl: null, unreadCount: 0, lastMessageAt: null, lastMessageContent: '',
      }],
    } });
    if (operation.operationName === 'ActiveConversations') return response({ activeConversations: {
      __typename: 'ActiveConversationsConnection', pageInfo,
      nodes: [{ __typename: 'ActiveConversationDto', contact: person(peer), lastMessage: '' }],
    } });
    if (operation.operationName === 'MessagingPeer') return response({ messagingPeer: person(peer) });
    if (operation.operationName === 'MarkConversationRead') return response({ markConversationRead: {
      __typename: 'MarkConversationReadPayload', otherUserId: peer, markedCount: 0,
    } });
    throw new Error(`Unexpected GOB12 operation ${operation.operationName}`);
  }));
});
afterEach(async () => {
  cleanup();
  try {
    await act(async () => { wire.retries.splice(0).forEach((resume) => resume()); });
    // A pending handshake has no server ACK. Release it after observers have unmounted.
    for (const socket of wire.sockets.filter((socket) => socket.readyState === 0)) {
      await act(async () => {
        await socket.open();
        socket.receive({ type: 'connection_ack' });
      });
    }
    await waitFor(() => expect(wire.active.size).toBe(0));
    await waitFor(() => expect(wire.sockets.every((socket) => socket.readyState === 3)).toBe(true));
    pending.forEach(({ resolve }) => resolve(response({ sendPrivateMessage: item('cleanup', text) })));
    await client.clearStore();
  } finally {
    localStorage.clear();
    vi.unstubAllGlobals();
    if (scrollDescriptor) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', scrollDescriptor);
    else delete HTMLElement.prototype.scrollIntoView;
  }
});

it.each([
  ['page', 'replay-before-http'], ['page', 'http-before-replay'],
  ['widget', 'replay-before-http'], ['widget', 'http-before-replay'],
])('GOB12-WS %s %s reconciles real composer optimism, reconnect and duplicate echo',
  async (surface, order) => {
    await mount(surface);
    const first = await acknowledge(0);
    await startSend();
    assertSingleBubble();
    const definitive = item('10000000-0000-4000-8000-000000000012', text);
    await act(async () => { first.socket.close(1006, 'synthetic transport abort'); });
    expect(first.socket.readyState).toBe(3);
    stored.push(definitive); // The server committed while its HTTP response was delayed.
    const refreshesBefore = requests.filter((name) => name === 'Conversation').length;
    if (order === 'http-before-replay') await resolveHttp(definitive);
    await releaseRetry();
    const recovered = await acknowledge(1);
    await waitFor(() => expect(requests.filter((name) => name === 'Conversation').length).toBeGreaterThan(refreshesBefore));
    await act(async () => { recovered.deliver(definitive); recovered.deliver(definitive); });
    assertSingleBubble();
    if (order === 'replay-before-http') await resolveHttp(definitive);
    await waitFor(() => expect(client.readQuery(thread, true).conversation.nodes.map((row) => row.id))
      .toEqual([definitive.id]));
    assertSingleBubble(definitive.id);
    expect(requests.filter((name) => name === 'SendPrivateMessage')).toHaveLength(1);
    expect(JSON.stringify(client.cache.extract(true))).not.toContain('optimistic-');
    expect(screen.queryByText(/· Enviando/)).toBeNull();
  });

it('GOB12-SESSION remote logout disposes the actual subscription and purges both cache layers', async () => {
  stored.push(item('A-private-before', 'A private history'));
  await mount();
  const first = await acknowledge(0);
  await startSend();
  expect(wire.active.size).toBe(1);
  expect(JSON.stringify(client.cache.extract(false))).toContain('A-private-before');
  expect(JSON.stringify(client.cache.extract(true))).toContain('optimistic-');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  await act(async () => {
    storageEvent(`fixture-${a}`, null);
    await GraphQLProvider.waitForSessionTermination();
  });
  expect(wire.terminations).toBe(1);
  expect(first.socket.readyState).toBe(3);
  await waitFor(() => expect(wire.active.size).toBe(0));
  await act(async () => { wire.retries.splice(0).forEach((resume) => resume()); });
  expect(wire.sockets).toHaveLength(1);
  expect(screen.getByTestId('identity').textContent).toBe('signed-out');
  await resolveHttp(item('A-late-http', text));
  await act(async () => { first.deliver(item('A-late-frame', 'A late frame')); });
  expect(client.cache.extract(false)).toEqual({});
  expect(client.cache.extract(true)).toEqual({});
  expect(screen.queryByText('A private history')).toBeNull();
  expect(screen.queryByText(text)).toBeNull();
});

it('GOB12-SESSION remote A to B replacement creates a usable subscription in the new epoch', async () => {
  stored.push(item('A-private-before', 'A private history'));
  await mount();
  const first = await acknowledge(0);
  await startSend();
  persist(b);
  await act(async () => {
    storageEvent(`fixture-${a}`, `fixture-${b}`);
    await GraphQLProvider.waitForSessionTermination();
  });
  expect(wire.terminations).toBe(1);
  expect(first.socket.readyState).toBe(3);
  await waitFor(() => expect(screen.getByTestId('identity').textContent).toBe(b));
  await releaseRetry();
  const next = await acknowledge(1, b);
  await resolveHttp(item('A-late-http', text));
  const incoming = item('B-live-frame', 'B live content', peer, b);
  await act(async () => {
    first.deliver(item('A-late-frame', 'A late frame'));
    next.deliver(incoming);
  });
  await screen.findByText('B live content', { selector: 'p' });
  const snapshot = JSON.stringify(client.cache.extract(true));
  expect(snapshot).toContain('B-live-frame');
  expect(snapshot).not.toContain('A-private-before');
  expect(snapshot).not.toContain('A-late');
  expect(snapshot).not.toContain('optimistic-');
  expect(localStorage.getItem('token')).toBe(`fixture-${b}`);
  expect(wire.active.size).toBe(1);
});
