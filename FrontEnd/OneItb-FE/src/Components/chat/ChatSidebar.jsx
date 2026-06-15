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
    <div className={`${selectedContactId ? 'hidden sm:flex' : 'flex'} w-full sm:w-72 flex-col border-r border-slate-200 bg-white`}>
      <header className="flex items-center justify-between bg-blue-600 p-3 sm:p-4 text-white">
        <div>
          <h3 className="font-bold text-sm sm:text-base">Mensajes</h3>
          <p className="text-[10px] sm:text-xs text-blue-100">
            {socketStatus === 'connected' ? 'En línea' : 'Reconectando...'}
          </p>
        </div>
        <button onClick={toggleWidget} className="sm:hidden rounded-full p-1.5 text-white/80 hover:bg-white/20 transition">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </header>
      
      <div className="border-b border-slate-100 p-2 sm:p-3">
        <div className="relative">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input 
            type="text" 
            placeholder="Buscar usuarios..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100"
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
              {searchTerm && <h4 className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Conversaciones</h4>}
              <div className="space-y-0.5">
                {displayActive.map(c => renderContactItem(c))}
              </div>
            </div>
          )}

          {searchTerm && displayNew.length > 0 && (
            <div>
              <h4 className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Nuevos Usuarios</h4>
              <div className="space-y-0.5">
                {displayNew.map(c => renderContactItem(c, true))}
              </div>
            </div>
          )}

          {searchTerm && searchTerm.length >= 2 && (
            <div>
              <h4 className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Mensajes</h4>
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
                        className={`w-full rounded-xl p-2 text-left transition ${selectedContactId === otherUser.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                      >
                        <p className="text-xs font-semibold text-slate-700">{otherUser.firstName} {otherUser.lastName}</p>
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
