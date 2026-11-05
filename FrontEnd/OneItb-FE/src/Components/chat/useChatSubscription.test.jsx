import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useChatSubscription } from './useChatSubscription';

let wsStatusCallback = null;
let subscriptionOptions = null;
const mockMarkConversationRead = vi.fn().mockReturnValue(Promise.resolve({}));
const mockCache = {};

vi.mock('../../data/graphql/GraphqlProvider', () => ({
  subscribeToGraphQLWsStatus: vi.fn((callback) => {
    wsStatusCallback = callback;
    return vi.fn();
  }),
}));

vi.mock('@apollo/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useApolloClient: () => ({
      cache: mockCache,
    }),
    useMutation: () => [mockMarkConversationRead],
    useSubscription: (doc, options) => {
      subscriptionOptions = options;
      return { error: null };
    },
  };
});

vi.mock('./chatCache', () => ({
  appendMessageToConversation: vi.fn(),
  clearConversationUnread: vi.fn(),
  updateContactCache: vi.fn(),
}));

import {
  appendMessageToConversation,
  updateContactCache,
} from './chatCache';
import { subscribeToGraphQLWsStatus } from '../../data/graphql/GraphqlProvider';

describe('useChatSubscription custom hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    wsStatusCallback = null;
    subscriptionOptions = null;
  });

  it('initializes with disconnected status and registers WebSocket listener', () => {
    const { result, unmount } = renderHook(() =>
      useChatSubscription({
        auth: { id: 'user-1' },
      })
    );

    expect(result.current.socketStatus).toBe('disconnected');
    expect(subscribeToGraphQLWsStatus).toHaveBeenCalled();

    act(() => {
      wsStatusCallback('connected');
    });

    expect(result.current.socketStatus).toBe('connected');

    unmount();
  });

  it('triggers refetch queries upon reconnection from unavailable state', () => {
    const refetchContacts = vi.fn();
    const refetchActive = vi.fn();
    const refetchConversation = vi.fn();

    renderHook(() =>
      useChatSubscription({
        auth: { id: 'user-1' },
        selectedContactId: 'user-2',
        isOpen: true,
        refetchContacts,
        refetchActive,
        refetchConversation,
      })
    );

    act(() => {
      wsStatusCallback('connected');
    });

    expect(refetchContacts).toHaveBeenCalled();
    expect(refetchActive).toHaveBeenCalled();
    expect(refetchConversation).toHaveBeenCalled();
  });

  it('marks conversation read on selection when open', () => {
    renderHook(() =>
      useChatSubscription({
        auth: { id: 'user-1' },
        selectedContactId: 'user-2',
        isOpen: true,
      })
    );

    expect(mockMarkConversationRead).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { otherUserId: 'user-2' },
      })
    );
  });

  it('handles incoming messages via onData and updates cache', () => {
    const refetchActive = vi.fn().mockReturnValue(Promise.resolve());

    renderHook(() =>
      useChatSubscription({
        auth: { id: 'user-1' },
        selectedContactId: 'user-2',
        isOpen: true,
        activeData: { activeConversations: { nodes: [] } },
        refetchActive,
      })
    );

    expect(subscriptionOptions).toBeTruthy();

    const incomingMessage = {
      id: 'msg-1',
      senderId: 'user-2',
      receiverId: 'user-1',
      content: 'Hola mundo',
    };

    act(() => {
      subscriptionOptions.onData({
        data: {
          messageReceived: incomingMessage,
        },
      });
    });

    expect(appendMessageToConversation).toHaveBeenCalledWith(mockCache, 'user-2', incomingMessage);
    expect(updateContactCache).toHaveBeenCalledWith(mockCache, 'user-2', incomingMessage, 'user-1', true);
    expect(refetchActive).toHaveBeenCalled();
    expect(mockMarkConversationRead).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { otherUserId: 'user-2' },
      })
    );
  });
});
