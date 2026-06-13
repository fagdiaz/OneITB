import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ADMIN_USERS } from '../../data/graphql/queries/admin';
import { UPDATE_USER_ROLE, UPDATE_USER_STATUS } from '../../data/graphql/mutations/admin';

const roles = ['Estudiante', 'Profesor', 'Moderador', 'Administrador', 'Empleador'];

export const UserManagement = () => {
  const [feedback, setFeedback] = useState(null);
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_USERS, {
    fetchPolicy: 'cache-and-network'
  });
  const [updateUserRole, { loading: updatingRole }] = useMutation(UPDATE_USER_ROLE);
  const [updateUserStatus, { loading: updatingStatus }] = useMutation(UPDATE_USER_STATUS);
  const users = data?.users ?? [];

  const changeRole = async (userId, newRole) => {
    try {
      const { data: result } = await updateUserRole({ variables: { userId, newRole } });
      setFeedback({ type: 'success', message: result.updateUserRole.message });
      await refetch();
    } catch (mutationError) {
      setFeedback({ type: 'error', message: mutationError.message });
    }
  };

  const toggleStatus = async (userId, isActive) => {
    try {
      const { data: result } = await updateUserStatus({
        variables: { userId, isActive: !isActive }
      });
      setFeedback({ type: 'success', message: result.updateUserStatus.message });
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
          <p className="text-sm text-slate-500">Roles y acceso de las cuentas registradas.</p>
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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Usuario</th>
                <th className="px-5 py-3">Rol</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-slate-500">{user.account?.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={user.role}
                      disabled={updatingRole}
                      onChange={(event) => changeRole(user.id, event.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                        {user.isActive ? 'Activo' : 'Suspendido'}
                      </span>
                      <button
                        type="button"
                        disabled={updatingStatus}
                        onClick={() => toggleStatus(user.id, user.isActive)}
                        className={`text-xs font-medium hover:underline ${
                          user.isActive ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        {user.isActive ? 'Suspender' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
