import { gql } from '@apollo/client';

export const MESSAGE_FRAGMENT = gql`
  fragment CachedMessage on Message {
    id
    senderId
    receiverId
    content
    sentAt
    isRead
    attachments {
      id
      name
      contentType
      size
    }
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
  let isNewMessage = true;
  const messageReference = cache.writeFragment({
    fragment: MESSAGE_FRAGMENT,
    data: {
      __typename: 'Message',
      attachments: [],
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

        if (alreadyPresent) {
          isNewMessage = false;
          return {
            ...existingConnection,
            nodes: withoutOptimistic,
          };
        }

        return {
          ...existingConnection,
          nodes: [messageReference, ...withoutOptimistic],
        };
      },
    },
  });

  return isNewMessage;
};

export const updateContactCache = (
  cache,
  otherUserId,
  message,
  currentUserId,
  isSelected,
  isNewMessage = true,
) => {
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
            const currentLastAt = readField('lastMessageAt', contact);
            const isNewer = !currentLastAt
              || new Date(message.sentAt).getTime() >= new Date(currentLastAt).getTime();

            return {
              ...contact,
              lastMessageAt: isNewer ? message.sentAt : currentLastAt,
              unreadCount: incoming && !isSelected && isNewMessage
                ? currentUnread + 1
                : currentUnread,
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

        const nodes = existingConnection.nodes || [];
        nodes.forEach((reference) => {
          if (
            readField('senderId', reference) === otherUserId
            && readField('receiverId', reference) === currentUserId
          ) {
            const id = readField('id', reference);
            if (id) {
              cache.modify({
                id: cache.identify({ __typename: 'Message', id }),
                fields: {
                  isRead() {
                    return true;
                  },
                },
              });
            }
          }
        });

        return {
          ...existingConnection,
          nodes: nodes.map((message) => (
            readField('senderId', message) === otherUserId
            && readField('receiverId', message) === currentUserId
              ? { ...message, isRead: true }
              : message
          )),
        };
      },
    },
  });
};
