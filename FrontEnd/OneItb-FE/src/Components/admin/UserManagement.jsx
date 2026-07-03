import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_ADMIN_USERS } from '../../data/graphql/queries/admin';
import { EditUserModal } from './EditUserModal';

const shortId = (id) => `#${String(id ?? '').slice(-6).toUpperCase()}`;

const isAdmin = (user) => user?.role === 'Administrador';

const isMuted = (user) => Boolean(user?.mutedUntil && new Date(user.mutedUntil) > new Date());

const formatMutedUntil = (value) => {
  if (!value) return 'Sin silencio';
  return new Date(value).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const UserManagement = () => {
  const [feedback, setFeedback] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_USERS, {
    fetchPolicy: 'cache-and-network',
  });
  
  const users = data?.users ?? [];

  if (loading && users.length === 0) {
    return <p className="p-8 text-center text-sm text-slate-500">Cargando usuarios...</p>;
  }

  if (error) {
    return <p className="p-8 text-center text-sm text-red-600">Error: {error.message}</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Usuarios</h2>
          <p className="text-sm text-slate-500">Gestión de cuentas y moderación (Solo Lectura).</p>
        </div>
        <button type="button" onClick={() => refetch()} className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/15">
          Actualizar
        </button>
      </div>

      {feedback && (
        <p className={`rounded-lg border px-4 py-3 text-sm ${
          feedback.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {feedback.message}
        </p>
      )}

      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onFeedback={setFeedback} 
          onRefetch={refetch} 
        />
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900/70">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Usuario</th>
                <th className="px-5 py-3">Rol</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Actividad</th>
                <th className="px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {users.map((user) => {
                const protectedAdmin = isAdmin(user);
                const muted = isMuted(user);
                return (
                  <tr key={user.id} className={`transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.04] ${protectedAdmin ? 'bg-blue-50/40 dark:bg-blue-500/10' : ''}`}>
                    <td className="px-5 py-4">
                      <Link to={`/profile/${user.id}`} className={`font-semibold hover:underline ${protectedAdmin ? 'text-blue-800 hover:text-blue-600 dark:text-blue-200' : 'text-slate-800 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-300'}`}>
                        {user.firstName} {user.lastName}
                        {protectedAdmin && <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-600 no-underline">admin</span>}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user.account?.email}</p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-400">{shortId(user.id)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {user.role}
                      </span>
                      {protectedAdmin && <p className="mt-1 text-[11px] font-medium text-blue-600">Cuenta protegida</p>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="grid grid-cols-2 gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <span>{user.totalPosts ?? 0} posts</span>
                        <span>{user.totalComments ?? 0} com.</span>
                        <span>{user.totalLikesReceived ?? 0} likes</span>
                        <span className={(user.totalReportsReceived ?? 0) > 0 ? 'font-semibold text-red-600' : undefined}>
                          {user.totalReportsReceived ?? 0} reportes
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-2">
                        {muted && (
                          <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <i className="fa-solid fa-volume-xmark mr-1" />
                            Hasta {formatMutedUntil(user.mutedUntil)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setEditingUser(user)}
                          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-blue-600 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-blue-300"
                        >
                          <i className="fa-solid fa-pen-to-square" />
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
