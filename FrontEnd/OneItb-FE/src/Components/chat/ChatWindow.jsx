import React from 'react';

const formatTime = (value) => new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(value));

export const ChatWindow = ({
  selectedContact,
  selectedContactId,
  toggleWidget,
  handleBackToContacts,
  conversationData,
  conversationLoading,
  messages,
  loadOlderMessages,
  messageEndRef,
  feedback,
  subscriptionError,
  handleSubmit,
  form,
  changed,
  sending,
  auth
}) => {
  return (
    <div className={`${selectedContactId ? 'flex' : 'hidden sm:flex'} flex-1 flex-col bg-slate-50 relative`}>
      {!selectedContact ? (
        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
          <button onClick={toggleWidget} className="absolute top-3 right-3 rounded-full p-2 text-slate-400 hover:bg-slate-200 transition">
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-3">
            <i className="fa-regular fa-comments text-xl"></i>
          </div>
          <p className="text-sm font-semibold text-slate-600">Tus Mensajes</p>
          <p className="text-xs text-slate-400 mt-1">Selecciona una conversación para empezar a chatear.</p>
        </div>
      ) : (
        <>
          <header className="flex items-center gap-3 bg-white border-b border-slate-200 p-3 shadow-sm shrink-0">
            <button type="button" onClick={handleBackToContacts} className="sm:hidden rounded-full p-1.5 text-slate-500 hover:bg-slate-100 transition">
              <i className="fa-solid fa-arrow-left text-sm" />
            </button>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 text-sm">
              {selectedContact.firstName?.[0]}{selectedContact.lastName?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold text-slate-800 leading-tight">{selectedContact.firstName} {selectedContact.lastName}</h3>
              <p className="truncate text-[10px] text-slate-500">{selectedContact.role}</p>
            </div>
            <button onClick={toggleWidget} className="hidden sm:block rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition">
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col">
            {conversationData?.conversation?.pageInfo?.hasNextPage && (
              <div className="mb-3 text-center shrink-0">
                <button type="button" onClick={loadOlderMessages} className="text-[11px] font-semibold text-blue-600 hover:underline">
                  Cargar anteriores
                </button>
              </div>
            )}
            {conversationLoading && messages.length === 0 && <p className="text-center text-xs text-slate-500 mt-auto mb-auto">Cargando...</p>}
            
            <div className="space-y-2 mt-auto">
              {messages.map((message) => {
                const isOwn = message.senderId === auth.id;
                const isOptimistic = message.id.startsWith('optimistic-');
                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${isOwn ? 'rounded-br-sm bg-blue-600 text-white' : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'} ${isOptimistic ? 'opacity-70' : ''}`}>
                      <p className="whitespace-pre-wrap break-words text-[13px] leading-snug">{message.content}</p>
                      <p className={`mt-0.5 text-right text-[9px] ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>
                        {formatTime(message.sentAt)}{isOptimistic ? ' ·' : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>
          </div>

          {(feedback || subscriptionError) && (
            <div className="bg-red-50 p-2 text-center text-[10px] text-red-600 border-t border-red-100 shrink-0">
              {feedback || 'Error de conexión'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-slate-200 bg-white p-2 shrink-0">
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
              className="min-h-9 max-h-24 flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition focus:border-blue-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!form.content?.trim() || sending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              <i className="fa-solid fa-paper-plane text-xs" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
