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
    <div className={`${selectedContactId ? 'flex' : 'hidden sm:flex'} relative flex-1 flex-col bg-slate-50/70 dark:bg-slate-900/50`}>
      {!selectedContact ? (
        <div className="flex h-full flex-col items-center justify-center p-4 text-center">
          <button onClick={toggleWidget} className="absolute right-3 top-3 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white">
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-300/20 bg-blue-500/10 text-blue-200">
            <i className="fa-regular fa-comments text-xl"></i>
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Tus Mensajes</p>
          <p className="text-xs text-slate-400 mt-1">Selecciona una conversación para empezar a chatear.</p>
        </div>
      ) : (
        <>
          <header className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white/80 p-2.5 dark:border-white/10 dark:bg-white/[0.03]">
            <button type="button" onClick={handleBackToContacts} className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white sm:hidden">
              <i className="fa-solid fa-arrow-left text-sm" />
            </button>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-sm font-bold text-blue-100 ring-1 ring-blue-300/20">
              {selectedContact.firstName?.[0]}{selectedContact.lastName?.[0]}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold leading-tight text-slate-950 dark:text-white">{selectedContact.firstName} {selectedContact.lastName}</h3>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{selectedContact.role}</p>
            </div>
            <button onClick={toggleWidget} className="hidden rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white sm:block">
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </header>

          <div className="flex flex-1 flex-col overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_34%),linear-gradient(180deg,rgba(248,250,252,0.92),rgba(241,245,249,0.98))] p-2.5 dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_36%),linear-gradient(180deg,rgba(15,23,42,0.55),rgba(15,23,42,0.92))]">
            {conversationData?.conversation?.pageInfo?.hasNextPage && (
              <div className="mb-3 text-center shrink-0">
                <button type="button" onClick={loadOlderMessages} className="rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-200 hover:bg-blue-500/15">
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
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-lg ${isOwn ? 'rounded-br-sm bg-blue-600 text-white shadow-blue-950/20' : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100'} ${isOptimistic ? 'opacity-70' : ''}`}>
                      <p className="whitespace-pre-wrap break-words text-[13px] leading-snug">{message.content}</p>
                      <p className={`mt-0.5 text-right text-[9px] ${isOwn ? 'text-blue-200' : 'text-slate-500'}`}>
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
            <div className="shrink-0 border-t border-red-400/20 bg-red-500/10 p-2 text-center text-[10px] text-red-200">
              {feedback || 'Error de conexión'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex shrink-0 items-end gap-2 border-t border-slate-200 bg-white/90 p-2 dark:border-white/10 dark:bg-slate-950/80">
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
              className="max-h-24 min-h-9 flex-1 resize-y rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-1 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-300/30 dark:focus:ring-blue-500/20"
            />
            <button
              type="submit"
              disabled={!form.content?.trim() || sending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:opacity-50"
            >
              <i className="fa-solid fa-paper-plane text-xs" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
