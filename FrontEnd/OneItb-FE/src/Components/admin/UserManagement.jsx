import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ADMIN_USERS } from '../../data/graphql/queries/admin';
import { SILENCE_USER, UPDATE_USER_ROLE, UPDATE_USER_STATUS } from '../../data/graphql/mutations/admin';

const roles = ['Estudiante', 'Profesor', 'Egresado', 'Moderador', 'Administrador', 'Empleador'];
const silenceOptions = [
  { label: '24 hs', hours: 24 },
  { label: '3 dias', hours: 72 },
  { label: '1 semana', hours: 168 },
];

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
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [promotionError, setPromotionError] = useState('');
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_USERS, {
    fetchPolicy: 'cache-and-network',
  });
  const [updateUserRole, { loading: updatingRole }] = useMutation(UPDATE_USER_ROLE);
  const [updateUserStatus, { loading: updatingStatus }] = useMutation(UPDATE_USER_STATUS);
  const [silenceUser, { loading: silencingUser }] = useMutation(SILENCE_USER);
  const users = data?.users ?? [];

  const showPayloadFeedback = (payload) => {
    setFeedback({
      type: payload?.success ? 'success' : 'error',
      message: payload?.message ?? 'Operacion procesada.',
    });
  };

  const executeRoleChange = async (userId, newRole, adminPassword = null) => {
    try {
      const { data: result } = await updateUserRole({
        variables: { userId, newRole, adminPassword },
      });
      showPayloadFeedback(result.updateUserRole);
      await refetch();
      return true;
    } catch (mutationError) {
      setFeedback({ type: 'error', message: mutationError.message });
      return false;
    }
  };

  const changeRole = async (user, newRole) => {
    if (isAdmin(user)) return;
    if (newRole === 'Administrador') {
      setPendingPromotion({
        userId: user.id,
        fullName: user.firstName + ' ' + user.lastName,
      });
      setAdminPasswordInput('');
      setPromotionError('');
      setShowAdminModal(true);
      return;
    }

    await executeRoleChange(user.id, newRole);
  };

  const closeAdminModal = () => {
    setShowAdminModal(false);
    setPendingPromotion(null);
    setAdminPasswordInput('');
    setPromotionError('');
  };

  const confirmAdminPromotion = async (event) => {
    event.preventDefault();
    if (!pendingPromotion || !adminPasswordInput.trim()) {
      setPromotionError('Ingresa tu contraseña de administrador.');
      return;
    }

    try {
      const { data: result } = await updateUserRole({
        variables: {
          userId: pendingPromotion.userId,
          newRole: 'Administrador',
          adminPassword: adminPasswordInput,
        },
      });
      showPayloadFeedback(result.updateUserRole);
      await refetch();
      closeAdminModal();
    } catch (mutationError) {
      setPromotionError(mutationError.message);
      setAdminPasswordInput('');
    }
  };

  const toggleStatus = async (user) => {
    if (isAdmin(user)) return;
    try {
      const { data: result } = await updateUserStatus({
        variables: { userId: user.id, isActive: !user.isActive },
      });
      showPayloadFeedback(result.updateUserStatus);
      await refetch();
    } catch (mutationError) {
      setFeedback({ type: 'error', message: mutationError.message });
    }
  };

  const silence = async (user, hours) => {
    if (isAdmin(user)) return;
    try {
      const { data: result } = await silenceUser({ variables: { userId: user.id, hours } });
      showPayloadFeedback(result.silenceUser);
      await refetch();
    } catch (mutationError) {
      setFeedback({ type: 'error', message: mutationError.message });
    }
  };

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
          <h2 className="text-lg font-bold text-slate-800">Usuarios</h2>
          <p className="text-sm text-slate-500">Roles, actividad y herramientas de moderacion.</p>
        </div>
        <button type="button" onClick={() => refetch()} className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600">
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

      {showAdminModal && pendingPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-promotion-title"
            className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <i className="fa-solid fa-triangle-exclamation" />
              </span>
              <div>
                <h3 id="admin-promotion-title" className="text-lg font-bold text-slate-900">
                  Atención: Estás a punto de otorgar privilegios máximos
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Usuario objetivo: {pendingPromotion.fullName}
                </p>
              </div>
            </div>

            <form onSubmit={confirmAdminPromotion} className="space-y-4">
              <label className="block space-y-1 text-sm font-semibold text-slate-700">
                Contraseña del administrador actual
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(event) => {
                    setAdminPasswordInput(event.target.value);
                    setPromotionError('');
                  }}
                  autoComplete="current-password"
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 font-normal focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                  placeholder="Ingresa tu contraseña"
                />
              </label>

              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                ¿Estás seguro? Esta cuenta quedará protegida y no podrá degradarse ni desactivarse desde el sistema.
              </div>

              {promotionError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {promotionError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAdminModal}
                  disabled={updatingRole}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatingRole || !adminPasswordInput.trim()}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {updatingRole ? 'Verificando...' : 'Confirmar y Asignar Rol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Usuario</th>
                <th className="px-5 py-3">Rol</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Actividad</th>
                <th className="px-5 py-3">Moderacion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const protectedAdmin = isAdmin(user);
                const muted = isMuted(user);
                return (
                  <tr key={user.id} className={protectedAdmin ? 'bg-blue-50/40' : undefined}>
                    <td className="px-5 py-4">
                      <p className={`font-semibold ${protectedAdmin ? 'text-blue-800' : 'text-slate-800'}`}>
                        {user.firstName} {user.lastName}
                        {protectedAdmin && <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-600">admin</span>}
                      </p>
                      <p className="text-xs text-slate-500">{user.account?.email}</p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-400">{shortId(user.id)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        disabled={updatingRole || protectedAdmin}
                        onChange={(event) => changeRole(user, event.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                      {protectedAdmin && <p className="mt-1 text-[11px] text-blue-600">Cuenta protegida</p>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {user.isActive ? 'Activo' : 'Suspendido'}
                        </span>
                        <button
                          type="button"
                          disabled={updatingStatus || protectedAdmin}
                          onClick={() => toggleStatus(user)}
                          className={`text-xs font-medium hover:underline disabled:text-slate-300 disabled:no-underline ${
                            user.isActive ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {user.isActive ? 'Suspender' : 'Activar'}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
                        <span>{user.totalPosts ?? 0} posts</span>
                        <span>{user.totalComments ?? 0} comentarios</span>
                        <span>{user.totalLikesReceived ?? 0} likes</span>
                        <span className={(user.totalReportsReceived ?? 0) > 0 ? 'font-semibold text-red-600' : undefined}>
                          {user.totalReportsReceived ?? 0} reportes
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className={`mb-2 text-xs font-medium ${muted ? 'text-amber-700' : 'text-slate-400'}`}>
                        {muted ? `Silenciado hasta ${formatMutedUntil(user.mutedUntil)}` : 'Sin silencio activo'}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {silenceOptions.map((option) => (
                          <button
                            key={option.hours}
                            type="button"
                            disabled={silencingUser || protectedAdmin}
                            onClick={() => silence(user, option.hours)}
                            className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 disabled:bg-slate-100 disabled:text-slate-300"
                          >
                            {option.label}
                          </button>
                        ))}
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
