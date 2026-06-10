import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

/**
 * UserManagement - Admin Dashboard Component
 * Connected to GraphQL backend.
 */

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      firstName
      lastName
      role
      isActive
      account {
        email
      }
    }
  }
`;

const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($userId: UUID!, $newRole: String!) {
    updateUserRole(userId: $userId, newRole: $newRole) {
      status
      message
    }
  }
`;

const UPDATE_USER_STATUS = gql`
  mutation UpdateUserStatus($userId: UUID!, $isActive: Boolean!) {
    updateUserStatus(userId: $userId, isActive: $isActive) {
      status
      message
    }
  }
`;

export const UserManagement = () => {
  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    fetchPolicy: 'network-only' // Ensure we get fresh data
  });

  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);
  const [updateUserStatus] = useMutation(UPDATE_USER_STATUS);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await updateUserStatus({
        variables: { userId: id, isActive: !currentStatus }
      });
      refetch();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error al actualizar estado");
    }
  };

  const changeRole = async (id, newRole) => {
    try {
      await updateUserRole({
        variables: { userId: id, newRole: newRole }
      });
      refetch();
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Error al actualizar rol");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando usuarios...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error al cargar usuarios: {error.message}</div>;

  const users = data?.users || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-slate-500 mt-1 ml-4.5">Administración de roles y derecho de admisión.</p>
        </div>
        <button className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Actualizar Lista
        </button>
      </div>

      {/* Data Grid Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado (Acceso)</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => {
                const fullName = `${user.firstName} ${user.lastName}`;
                const email = user.account?.email || 'Sin correo';

                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* User Profile Cell */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=f1f5f9&color=64748b&size=80`}
                          alt={fullName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{fullName}</div>
                          <div className="text-slate-500 text-xs">{email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Select Cell */}
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => changeRole(user.id, e.target.value)}
                        className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 transition-shadow outline-none cursor-pointer hover:border-slate-300"
                      >
                        <option value="Estudiante">Estudiante</option>
                        <option value="Profesor">Profesor</option>
                        <option value="Moderador">Moderador</option>
                        <option value="Administrador">Administrador</option>
                        {/* Fallback option in case existing DB data has old roles */}
                        {!['Estudiante','Profesor','Moderador','Administrador'].includes(user.role) && (
                           <option value={user.role}>{user.role}</option>
                        )}
                      </select>
                    </td>

                    {/* Status Toggle Cell */}
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(user.id, user.isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          user.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span className="sr-only">Toggle status</span>
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            user.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`ml-3 text-xs font-medium ${user.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {user.isActive ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>

                    {/* Actions Cell */}
                    <td className="px-6 py-4 text-right">
                       <button className="text-slate-400 hover:text-blue-600 p-2 transition-colors" title="Ver Detalles">
                          <i className="fa-solid fa-eye" />
                       </button>
                       <button className="text-slate-400 hover:text-red-500 p-2 transition-colors ml-1" title="Eliminar Permanente">
                          <i className="fa-solid fa-trash-can" />
                       </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    No hay usuarios registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Mostrando <span className="font-semibold text-slate-700">{users.length > 0 ? 1 : 0}</span> a <span className="font-semibold text-slate-700">{users.length}</span> de <span className="font-semibold text-slate-700">{users.length}</span> resultados
          </span>
          <div className="flex items-center gap-2">
            <button disabled className="px-3 py-1 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed">Anterior</button>
            <button disabled className="px-3 py-1 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
};
