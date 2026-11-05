import { useEffect, useRef, useState } from 'react';
import { useApolloClient, useMutation, useSubscription } from '@apollo/client';
import { MARK_CONVERSATION_READ, MESSAGE_RECEIVED } from '../../data/graphql/chat';
import { subscribeToGraphQLWsStatus } from '../../data/graphql/GraphqlProvider';
import {
  appendMessageToConversation,
  clearConversationUnread,
  updateContactCache,
} from './chatCache';

/**
 * Custom hook to encapsulate WebSocket connection tracking,
 * message subscriptions, cache synchronizations, and conversation read states.
 *
 * @param {Object} options
 * @param {Object} options.auth Current authenticated user object containing at least `id`.
 * @param {string|null} [options.selectedContactId=null] ID of the currently selected chat contact.
 * @param {boolean} [options.isOpen=true] Whether the chat view/widget is actively open.
 * @param {Object} [options.activeData] Query data containing activeConversations nodes.
 * @param {Function} [options.refetchContacts] Callback to refetch contacts on reconnect.
 * @param {Function} [options.refetchActive] Callback to refetch active conversations.
 * @param {Function} [options.refetchConversation] Callback to refetch messages in active conversation.
 * @param {Function} [options.onFeedback] Callback to receive feedback/error message strings.
 * @returns {{ socketStatus: string, subscriptionError: any, markConversationRead: Function }}
 */
export const useChatSubscription = ({
  auth,
  selectedContactId = null,
  isOpen = true,
  activeData,
  refetchContacts,
  refetchActive,
  refetchConversation,
  onFeedback,
} = {}) => {
  const client = useApolloClient();
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const previousSocketStatus = useRef('disconnected');
  const mountedRef = useRef(true);

  const [markConversationRead] = useMutation(MARK_CONVERSATION_READ);

  // 1. WebSocket status subscription
  useEffect(() => {
    mountedRef.current = true;
    const unsubscribe = subscribeToGraphQLWsStatus((status) => {
      if (mountedRef.current) {
        setSocketStatus(status);
      }
    });

    return () => {
      mountedRef.current = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // 2. Reconnection refetch handling
  useEffect(() => {
    const wasUnavailable = ['disconnected', 'error'].includes(previousSocketStatus.current);
    if (socketStatus === 'connected' && wasUnavailable) {
      if (typeof refetchContacts === 'function') {
        try { refetchContacts()?.catch?.(() => {}); } catch {}
      }
      if (isOpen) {
        if (typeof refetchActive === 'function') {
          try { refetchActive()?.catch?.(() => {}); } catch {}
        }
        if (selectedContactId && typeof refetchConversation === 'function') {
          try { refetchConversation()?.catch?.(() => {}); } catch {}
        }
      }
    }
    previousSocketStatus.current = socketStatus;
  }, [socketStatus, selectedContactId, refetchContacts, refetchActive, refetchConversation, isOpen]);

  // 3. Mark conversation as read on selection / open
  useEffect(() => {
    if (!selectedContactId || !isOpen || !auth?.id) return;

    markConversationRead({
      variables: { otherUserId: selectedContactId },
      optimisticResponse: {
        __typename: 'Mutation',
        markConversationRead: {
          __typename: 'MarkConversationReadPayload',
          otherUserId: selectedContactId,
          markedCount: 0,
        },
      },
      update: (cache) => clearConversationUnread(cache, selectedContactId, auth.id),
    }).catch(() => {
      if (mountedRef.current && typeof onFeedback === 'function') {
        onFeedback('No se pudo actualizar el estado de lectura.');
      }
    });
  }, [selectedContactId, auth?.id, markConversationRead, isOpen, onFeedback]);

  // 4. GraphQL message subscription
  const { error: subscriptionError } = useSubscription(MESSAGE_RECEIVED, {
    skip: !auth?.id,
    onData: ({ data }) => {
      const message = data?.data?.messageReceived || data?.messageReceived;
      if (!message || !mountedRef.current) return;

      const otherUserId = message.senderId === auth.id ? message.receiverId : message.senderId;
      const isSelected = selectedContactId === otherUserId && isOpen;

      appendMessageToConversation(client.cache, otherUserId, message);
      updateContactCache(client.cache, otherUserId, message, auth.id, isSelected);

      const activeList = activeData?.activeConversations?.nodes || [];
      const isActive = activeList.some((u) => (u.contact?.id || u.userId) === otherUserId);
      if (isOpen && !isActive && typeof refetchActive === 'function') {
        refetchActive().catch(() => {
          if (mountedRef.current && typeof onFeedback === 'function') {
            onFeedback('No se pudo actualizar la lista de conversaciones.');
          }
        });
      }

      if (isSelected && message.receiverId === auth.id) {
        markConversationRead({
          variables: { otherUserId },
          update: (cache) => clearConversationUnread(cache, otherUserId, auth.id),
        }).catch(() => {
          if (mountedRef.current && typeof onFeedback === 'function') {
            onFeedback('El mensaje llegó, pero no se pudo marcar como leído.');
          }
        });
      }
    },
  });

  return {
    socketStatus,
    subscriptionError,
    markConversationRead,
  };
};

export default useChatSubscription;
