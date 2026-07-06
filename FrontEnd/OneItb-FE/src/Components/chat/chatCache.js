import { gql } from '@apollo/client';

export const MESSAGE_FRAGMENT = gql`
  fragment CachedMessage on Message {
    id
    senderId
    receiverId
    content
    sentAt
    isRead
    sender {
      id
      firstName
      lastName
      avatarUrl
    }
    receiver {
      id
      firstName
      lastName
      avatarUrl
    }
  }
`;

export const formatTime = (value) => new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(value));

export const appendMessageToConversation = (cache, otherUserId, message, optimisticId) => {
  const messageReference = cache.writeFragment({
    fragment: MESSAGE_FRAGMENT,
    data: {
      __typename: 'Message',
      ...message,
    },
  });

  cache.modify({
    id: 'ROOT_QUERY',
    fields: {
      conversation(existingConnection, { readField, storeFieldName }) {
        if (!existingConnection || !storeFieldName.includes(otherUserId)) {
          return existingConnection;
        }

        const withoutOptimistic = (existingConnection.nodes || []).filter(
          (reference) => !optimisticId || readField('id', reference) !== optimisticId,
        );
        const alreadyPresent = withoutOptimistic.some(
          (reference) => readField('id', reference) === message.id,
        );

        return {
          ...existingConnection,
          nodes: alreadyPresent
            ? withoutOptimistic
            : [messageReference, ...withoutOptimistic],
        };
      },
    },
  });
};

export const updateContactCache = (cache, otherUserId, message, currentUserId, isSelected) => {
  cache.modify({
    id: 'ROOT_QUERY',
    fields: {
      messagingContacts(existingConnection, { readField }) {
        if (!existingConnection) return existingConnection;

        return {
          ...existingConnection,
          nodes: (existingConnection.nodes || []).map((contact) => {
            if (readField('userId', contact) !== otherUserId) return contact;

            const incoming = message.receiverId === currentUserId;
            const currentUnread = readField('unreadCount', contact) || 0;
            return {
              ...contact,
              lastMessageAt: message.sentAt,
              unreadCount: incoming && !isSelected ? currentUnread + 1 : currentUnread,
            };
          }),
        };
      },
    },
  });
};

export const clearConversationUnread = (cache, otherUserId, currentUserId) => {
  cache.modify({
    id: 'ROOT_QUERY',
    fields: {
      messagingContacts(existingConnection, { readField }) {
        if (!existingConnection) return existingConnection;
        return {
          ...existingConnection,
          nodes: (existingConnection.nodes || []).map((contact) => (
            readField('userId', contact) === otherUserId
              ? { ...contact, unreadCount: 0 }
              : contact
          )),
        };
      },
      conversation(existingConnection, { readField, storeFieldName }) {
        if (!existingConnection || !storeFieldName.includes(otherUserId)) {
          return existingConnection;
        }
        return {
          ...existingConnection,
          nodes: (existingConnection.nodes || []).map((message) => (
            readField('senderId', message) === otherUserId &&
            readField('receiverId', message) === currentUserId
              ? { ...message, isRead: true }
              : message
          )),
        };
      },
    },
  });
};
