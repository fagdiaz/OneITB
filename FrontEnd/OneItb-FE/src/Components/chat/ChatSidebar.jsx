import React from 'react';
import { GET_CONVERSATION } from '../../data/graphql/chat';

export const ChatSidebar = ({
  socketStatus,
  toggleWidget,
  searchTerm,
  setSearchTerm,
  contactsLoading,
  activeLoading,
  displayActive,
  displayNew,
  searchMessagesLoading,
  searchedMessages,
  handleSelectContact,
  selectedContactId,
  auth,
  client
}) => {

  const renderContactItem = (contact, isNew = false) => {
    const active = contact.userId === selectedContactId;
    const preview = !isNew ? contact.lastMessageContent : null;
    return (
      <button
        key={contact.userId}
        type="button"
        onClick={() => handleSelectContact(contact.userId)}
        className={`group flex w-full items-center gap-2 rounded-xl border p-2 text-left transition-all duration-150 ${active ? 'border-blue-200 bg-blue-50 text-slate-950 shadow-[0_10px_30px_rgba(37,99,235,0.10)] dark:border-blue-300/20 dark:bg-blue-500/15 dark:text-white dark:shadow-[0_10px_30px_rgba(37,99,235,0.16)]' : 'border-transparent text-slate-600 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/[0.05] dark:hover:text-white'}`}
      >
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1 ${active ? 'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-400/20 dark:text-blue-100 dark:ring-blue-300/20' : 'bg-slate-100 text-blue-700 ring-slate-200 group-hover:ring-blue-200 dark:bg-white/5 dark:text-blue-200 dark:ring-white/10 dark:group-hover:ring-blue-300/20'}`}>
          {contact.firstName?.[0]}{contact.lastName?.[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {contact.firstName} {contact.lastName} {isNew && <span className="ml-1 text-[10px] uppercase tracking-wider text-emerald-500 font-bold">(Nuevo)</span>}
          </p>
          <p className={`truncate text-xs ${active ? 'text-blue-700 dark:text-blue-100' : 'text-slate-500 dark:group-hover:text-slate-400'}`}>
            {preview ? `"${preview}"` : contact.role}
          </p>
        </div>
        {contact.unreadCount > 0 && !isNew && (
          <span className={`min-w-6 rounded-full px-2 py-1 text-center text-xs font-bold ${active ? 'bg-blue-100 text-blue-700' : 'bg-blue-500 text-white'}`}>
            {contact.unreadCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={`${selectedContactId ? 'hidden sm:flex' : 'flex'} w-full flex-col border-r border-slate-200 bg-white/80 dark:border-white/10 dark:bg-slate-950/80 sm:w-64`}>
      <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 p-2.5 text-slate-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-white sm:p-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base">Mensajes</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">
            {socketStatus === 'connected' ? 'En línea' : 'Reconectando...'}
          </p>
        </div>
        <button onClick={toggleWidget} className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white sm:hidden">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </header>
      
      <div className="border-b border-slate-200 p-2 dark:border-white/10">
        <div className="relative">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
          <input 
            type="text" 
            placeholder="Buscar usuarios..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-1 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-300/30 dark:focus:bg-slate-900 dark:focus:ring-blue-500/20"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {(contactsLoading || activeLoading) && displayActive.length === 0 && <p className="p-3 text-center text-xs text-slate-500">Cargando...</p>}
        
        {!contactsLoading && !activeLoading && !searchTerm && displayActive.length === 0 && (
          <p className="p-4 text-center text-xs text-slate-500">No hay conversaciones activas.</p>
        )}

        <div className="space-y-3">
          {displayActive.length > 0 && (
            <div>
              {searchTerm && <h4 className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Conversaciones</h4>}
              <div className="space-y-0.5">
                {displayActive.map(c => renderContactItem(c))}
              </div>
            </div>
          )}

          {searchTerm && displayNew.length > 0 && (
            <div>
              <h4 className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Nuevos Usuarios</h4>
              <div className="space-y-0.5">
                {displayNew.map(c => renderContactItem(c, true))}
              </div>
            </div>
          )}

          {searchTerm && searchTerm.length >= 2 && (
            <div>
              <h4 className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Mensajes</h4>
              {searchMessagesLoading ? (
                <p className="px-2 text-[10px] text-slate-500">Buscando...</p>
              ) : searchedMessages.length > 0 ? (
                <div className="space-y-1">
                  {searchedMessages.map(msg => {
                    const otherUser = msg.senderId === auth.id ? msg.receiver : msg.sender;
                    return (
                      <button 
                        key={msg.id}
                        onClick={() => handleSelectContact(otherUser.id)}
                        className={`w-full rounded-2xl border p-2 text-left transition ${selectedContactId === otherUser.id ? 'border-blue-200 bg-blue-50 dark:border-blue-300/20 dark:bg-blue-500/10' : 'border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-white/10 dark:hover:bg-white/[0.05]'}`}
                      >
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{otherUser.firstName} {otherUser.lastName}</p>
                        <p className="line-clamp-2 text-[11px] text-slate-500">"{msg.content}"</p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="px-2 text-[10px] text-slate-500">No hay coincidencias.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
