import React, { useEffect, useMemo, useRef, useState } from 'react';
import { gql, useApolloClient, useMutation, useQuery, useSubscription } from '@apollo/client';
import useAuth from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import {
  GET_CONVERSATION,
  GET_MESSAGING_CONTACTS,
  GET_ACTIVE_CONVERSATIONS,
  SEARCH_MY_MESSAGES,
  MARK_CONVERSATION_READ,
  MESSAGE_RECEIVED,
  SEND_MESSAGE,
} from '../../data/graphql/chat';
import { subscribeToGraphQLWsStatus } from '../../data/graphql/GraphqlProvider';

const MESSAGE_FRAGMENT = gql`
  fragment CachedMessage on Message {
    id
    senderId
    receiverId
    content
    sentAt
    isRead
  }
`;

const formatTime = (value) => new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(value));

const appendMessageToConversation = (cache, otherUserId, message, optimisticId) => {
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

const updateContactCache = (cache, otherUserId, message, currentUserId, isSelected) => {
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

const clearConversationUnread = (cache, otherUserId, currentUserId) => {
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

export const PrivateChat = () => {
  const { auth } = useAuth();
  const client = useApolloClient();
  const { form, changed, setForm } = useForm({ content: '' });
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [feedback, setFeedback] = useState('');
  const previousSocketStatus = useRef('disconnected');
  const messageEndRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const searchInput = searchTerm.trim().toLowerCase();

  const {
    data: contactsData,
    loading: contactsLoading,
    error: contactsError,
    fetchMore: fetchMoreContacts,
    refetch: refetchContacts,
  } = useQuery(GET_MESSAGING_CONTACTS, {
    variables: { first: 50 },
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: activeData,
    loading: activeLoading,
    refetch: refetchActive,
  } = useQuery(GET_ACTIVE_CONVERSATIONS, {
    variables: { first: 50 },
    fetchPolicy: 'cache-and-network',
  });

  const { data: searchMessagesData, loading: searchMessagesLoading } = useQuery(SEARCH_MY_MESSAGES, {
    variables: { searchTerm: searchInput, first: 20 },
    skip: searchInput.length < 2,
    fetchPolicy: 'network-only',
  });

  const {
    data: conversationData,
    loading: conversationLoading,
    error: conversationError,
    fetchMore: fetchMoreMessages,
    refetch: refetchConversation,
  } = useQuery(GET_CONVERSATION, {
    variables: { otherUserId: selectedContactId, first: 50 },
    skip: !selectedContactId,
    fetchPolicy: 'cache-and-network',
  });

  const [markConversationRead] = useMutation(MARK_CONVERSATION_READ);
  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);
  
  const allContacts = contactsData?.messagingContacts?.nodes || [];
  const activeUsers = activeData?.activeConversations?.nodes || [];
  
  // Merge unreadCount from GET_MESSAGING_CONTACTS into activeUsers
  const activeContacts = activeUsers.map(dto => {
    const user = dto.contact;
    const contactInfo = allContacts.find(c => c.userId === user.id);
    return {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      unreadCount: contactInfo?.unreadCount || 0,
      lastMessageAt: contactInfo?.lastMessageAt || null,
      lastMessageContent: dto.lastMessage || contactInfo?.lastMessageContent || null,
    };
  });

  const searchedMessages = searchMessagesData?.searchMyMessages?.nodes || [];

  const selectedContact = allContacts.find((contact) => contact.userId === selectedContactId) 
    || activeContacts.find((contact) => contact.userId === selectedContactId);

  const messages = useMemo(
    () => [...(conversationData?.conversation?.nodes || [])].reverse(),
    [conversationData],
  );

  useEffect(() => subscribeToGraphQLWsStatus(setSocketStatus), []);

  useEffect(() => {
    const wasUnavailable = ['disconnected', 'error'].includes(previousSocketStatus.current);
    if (socketStatus === 'connected' && wasUnavailable) {
      refetchContacts();
      refetchActive();
      if (selectedContactId) refetchConversation();
    }
    previousSocketStatus.current = socketStatus;
  }, [socketStatus, selectedContactId, refetchContacts, refetchActive, refetchConversation]);

  useEffect(() => {
    if (!selectedContactId) return;

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
    }).catch(() => setFeedback('No se pudo actualizar el estado de lectura.'));
  }, [selectedContactId, auth.id, markConversationRead]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedContactId]);

  const { error: subscriptionError } = useSubscription(MESSAGE_RECEIVED, {
    onData: ({ data }) => {
      const message = data.data?.messageReceived;
      if (!message) return;

      const otherUserId = message.senderId === auth.id ? message.receiverId : message.senderId;
      const isSelected = selectedContactId === otherUserId;
      appendMessageToConversation(client.cache, otherUserId, message);
      updateContactCache(client.cache, otherUserId, message, auth.id, isSelected);

      const isActive = activeData?.activeConversations?.nodes?.some(u => u.contact.id === otherUserId);
      if (!isActive) {
        refetchActive();
      }

      if (isSelected && message.receiverId === auth.id) {
        markConversationRead({
          variables: { otherUserId },
          update: (cache) => clearConversationUnread(cache, otherUserId, auth.id),
        }).catch(() => setFeedback('El mensaje llegó, pero no se pudo marcar como leído.'));
      }
    },
  });

  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);
    setFeedback('');
    setForm({ content: '' });
    setSearchTerm('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const content = form.content?.trim();
    if (!selectedContactId || !content || sending) return;

    const optimisticId = `optimistic-${crypto.randomUUID()}`;
    const optimisticMessage = {
      __typename: 'Message',
      id: optimisticId,
      senderId: auth.id,
      receiverId: selectedContactId,
      content,
      sentAt: new Date().toISOString(),
      isRead: false,
    };

    setForm({ content: '' });
    setFeedback('');

    try {
      await sendMessage({
        variables: { receiverId: selectedContactId, content },
        optimisticResponse: {
          __typename: 'Mutation',
          sendMessage: optimisticMessage,
        },
        update: (cache, { data }) => {
          const message = data?.sendMessage;
          if (!message) return;
          appendMessageToConversation(
            cache,
            selectedContactId,
            message,
            message.id === optimisticId ? undefined : optimisticId,
          );
          updateContactCache(cache, selectedContactId, message, auth.id, true);
        },
      });

      const isActive = activeData?.activeConversations?.nodes?.some(u => u.contact.id === selectedContactId);
      if (!isActive) {
        refetchActive();
      }
    } catch (error) {
      setForm({ content });
      setFeedback(error.message || 'No se pudo enviar el mensaje.');
    }
  };

  const loadOlderMessages = () => {
    const pageInfo = conversationData?.conversation?.pageInfo;
    if (!pageInfo?.hasNextPage) return;

    fetchMoreMessages({
      variables: { after: pageInfo.endCursor },
      updateQuery: (previous, { fetchMoreResult }) => ({
        conversation: {
          ...fetchMoreResult.conversation,
          nodes: [
            ...(previous.conversation?.nodes || []),
            ...(fetchMoreResult.conversation?.nodes || []),
          ],
        },
      }),
    });
  };

  const loadMoreContacts = () => {
    const pageInfo = contactsData?.messagingContacts?.pageInfo;
    if (!pageInfo?.hasNextPage) return;

    fetchMoreContacts({
      variables: { after: pageInfo.endCursor },
      updateQuery: (previous, { fetchMoreResult }) => ({
        messagingContacts: {
          ...fetchMoreResult.messagingContacts,
          nodes: [
            ...(previous.messagingContacts?.nodes || []),
            ...(fetchMoreResult.messagingContacts?.nodes || []),
          ],
        },
      }),
    });
  };

  // Rendering logic for search
  let displayActive = [];
  let displayNew = [];
  
  if (!searchInput) {
    displayActive = [...activeContacts].sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
  } else {
    displayActive = activeContacts.filter(c => 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchInput) ||
      c.role?.toLowerCase().includes(searchInput)
    ).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
    
    displayNew = allContacts.filter(c => 
      !activeContacts.some(ac => ac.userId === c.userId) &&
      (`${c.firstName} ${c.lastName}`.toLowerCase().includes(searchInput) ||
      c.role?.toLowerCase().includes(searchInput))
    );
  }

  const renderContactItem = (contact, isNew = false) => {
    const active = contact.userId === selectedContactId;
    const preview = !isNew ? contact.lastMessageContent : null;
    return (
      <button
        key={contact.userId}
        type="button"
        onClick={() => handleSelectContact(contact.userId)}
        className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${active ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}
      >
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold ${active ? 'bg-white/20' : 'bg-blue-100 text-blue-700'}`}>
          {contact.firstName?.[0]}{contact.lastName?.[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {contact.firstName} {contact.lastName} {isNew && <span className="ml-1 text-[10px] uppercase tracking-wider text-emerald-500 font-bold">(Nuevo)</span>}
          </p>
          <p className={`truncate text-xs ${active ? 'text-blue-100' : 'text-slate-500'}`}>
            {preview ? `"${preview}"` : contact.role}
          </p>
        </div>
        {contact.unreadCount > 0 && !isNew && (
          <span className={`min-w-6 rounded-full px-2 py-1 text-center text-xs font-bold ${active ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'}`}>
            {contact.unreadCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <section className="h-[calc(100vh-4rem)] bg-slate-100 p-3 sm:p-5">
      <div className="mx-auto flex h-full max-w-7xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <aside className={`${selectedContactId ? 'hidden md:flex' : 'flex'} w-full flex-col border-r border-slate-200 md:w-80`}>
          <div className="border-b border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Módulo 4</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Mensajes</h1>
            <p className="mt-1 text-sm text-slate-500">Conversaciones privadas de la comunidad.</p>
            
            <div className="mt-4 relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Buscar usuarios o mensajes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {(contactsLoading || activeLoading) && displayActive.length === 0 && <p className="p-4 text-sm text-slate-500">Cargando...</p>}
            {(contactsError) && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                Error al cargar.
                <button type="button" onClick={() => { refetchContacts(); refetchActive(); }} className="ml-2 font-semibold underline">Reintentar</button>
              </div>
            )}
            
            {!contactsLoading && !activeLoading && !searchInput && displayActive.length === 0 && (
              <p className="p-4 text-sm text-slate-500">No tenés conversaciones activas. ¡Buscá un usuario para empezar!</p>
            )}

            <div className="space-y-4">
              {/* Prioridad 1: Conversaciones Activas */}
              {displayActive.length > 0 && (
                <div>
                  {searchInput && <h3 className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Conversaciones Activas</h3>}
                  <div className="space-y-1">
                    {displayActive.map(c => renderContactItem(c))}
                  </div>
                </div>
              )}

              {/* Prioridad 2: Nuevos Usuarios */}
              {searchInput && displayNew.length > 0 && (
                <div>
                  <h3 className="px-2 pb-2 pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">Nuevos Usuarios</h3>
                  <div className="space-y-1">
                    {displayNew.map(c => renderContactItem(c, true))}
                  </div>
                </div>
              )}

              {/* Prioridad 3: Mensajes */}
              {searchInput && searchInput.length >= 2 && (
                <div>
                  <h3 className="px-2 pb-2 pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">Mensajes</h3>
                  {searchMessagesLoading ? (
                    <p className="px-2 text-xs text-slate-500">Buscando mensajes...</p>
                  ) : searchedMessages.length > 0 ? (
                    <div className="space-y-2">
                      {searchedMessages.map(msg => {
                        const otherUser = msg.senderId === auth.id ? msg.receiver : msg.sender;
                        return (
                          <button 
                            key={msg.id}
                            onClick={() => handleSelectContact(otherUser.id)}
                            className="w-full rounded-xl bg-white p-3 text-left shadow-sm border border-slate-100 transition hover:border-blue-300"
                          >
                            <p className="text-xs font-bold text-slate-700">{otherUser.firstName} {otherUser.lastName}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">"{msg.content}"</p>
                            <p className="mt-1 text-[10px] text-slate-400">{formatTime(msg.sentAt)}</p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="px-2 text-xs text-slate-500">No se encontraron mensajes.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        <div className={`${selectedContactId ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col`}>
          {!selectedContact ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-700">
                <i className="fa-regular fa-comment-dots" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">Elegí una conversación</h2>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Seleccioná un usuario para consultar el historial y enviar mensajes privados.
              </p>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
                <button type="button" onClick={() => setSelectedContactId(null)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden" aria-label="Volver a contactos">
                  <i className="fa-solid fa-arrow-left" />
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                  {selectedContact.firstName?.[0]}{selectedContact.lastName?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-bold text-slate-900">{selectedContact.firstName} {selectedContact.lastName}</h2>
                  <p className="text-xs text-slate-500">{selectedContact.role}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${socketStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {socketStatus === 'connected' ? 'En línea' : 'Reconectando...'}
                </span>
              </header>

              <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">
                {conversationData?.conversation?.pageInfo?.hasNextPage && (
                  <div className="mb-4 text-center">
                    <button type="button" onClick={loadOlderMessages} className="text-sm font-semibold text-blue-700">Cargar mensajes anteriores</button>
                  </div>
                )}
                {conversationLoading && messages.length === 0 && <p className="text-center text-sm text-slate-500">Cargando conversación...</p>}
                {conversationError && (
                  <div className="mx-auto max-w-lg rounded-xl bg-red-50 p-4 text-center text-sm text-red-700">
                    No se pudo cargar la conversación.
                    <button type="button" onClick={() => refetchConversation()} className="ml-2 font-semibold underline">Reintentar</button>
                  </div>
                )}
                {!conversationLoading && !conversationError && messages.length === 0 && (
                  <p className="mt-10 text-center text-sm text-slate-500">Todavía no hay mensajes. Iniciá la conversación.</p>
                )}

                <div className="space-y-3">
                  {messages.map((message) => {
                    const isOwn = message.senderId === auth.id;
                    const isOptimistic = message.id.startsWith('optimistic-');
                    return (
                      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[70%] ${isOwn ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'} ${isOptimistic ? 'opacity-70' : ''}`}>
                          <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                          <p className={`mt-1 text-right text-[11px] ${isOwn ? 'text-blue-100' : 'text-slate-400'}`}>
                            {formatTime(message.sentAt)}{isOptimistic ? ' · Enviando' : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messageEndRef} />
                </div>
              </div>

              {(feedback || subscriptionError) && (
                <p className="border-t border-red-100 bg-red-50 px-5 py-2 text-sm text-red-700" role="alert">
                  {feedback || 'La conexión en tiempo real tuvo un problema. Se intentará reconectar.'}
                </p>
              )}

              <form onSubmit={handleSubmit} className="flex items-end gap-3 border-t border-slate-200 bg-white p-3 sm:p-4">
                <textarea
                  name="content"
                  value={form.content}
                  onChange={changed}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  maxLength={2000}
                  rows={1}
                  placeholder="Escribí un mensaje..."
                  className="min-h-11 flex-1 resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="submit"
                  disabled={!form.content?.trim() || sending}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Enviar mensaje"
                >
                  <i className="fa-solid fa-paper-plane" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
