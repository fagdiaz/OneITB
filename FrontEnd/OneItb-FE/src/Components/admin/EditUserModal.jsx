import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SILENCE_USER, UPDATE_USER_ROLE, UPDATE_USER_STATUS } from '../../data/graphql/mutations/admin';

const roles = ['Estudiante', 'Profesor', 'Egresado', 'Moderador', 'Administrador', 'Empleador'];
const silenceOptions = [
  { label: '24 hs', hours: 24 },
  { label: '3 dias', hours: 72 },
  { label: '1 semana', hours: 168 },
];

const isAdmin = (user) => user?.role === 'Administrador';

export const EditUserModal = ({ user, onClose, onFeedback, onRefetch }) => {
  const [updateUserRole, { loading: updatingRole }] = useMutation(UPDATE_USER_ROLE);
  const [updateUserStatus, { loading: updatingStatus }] = useMutation(UPDATE_USER_STATUS);
  const [silenceUser, { loading: silencingUser }] = useMutation(SILENCE_USER);

  const [selectedRole, setSelectedRole] = useState(user.role);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [promotionError, setPromotionError] = useState('');

  const handleRoleChange = async () => {
    if (selectedRole === user.role) return;
    
    if (selectedRole === 'Administrador' && !adminPasswordInput.trim()) {
      setPromotionError('Ingresa tu contraseña de administrador para confirmar esta promoción.');
      return;
    }

    try {
      const { data: result } = await updateUserRole({
        variables: { 
          userId: user.id, 
          newRole: selectedRole, 
          adminPassword: selectedRole === 'Administrador' ? adminPasswordInput : null 
        },
      });
      onFeedback({
        type: result.updateUserRole?.success ? 'success' : 'error',
        message: result.updateUserRole?.message ?? 'Rol actualizado.',
      });
      await onRefetch();
      if (selectedRole === 'Administrador') {
        onClose(); // Auto-close on dangerous promotions
      }
    } catch (error) {
      setPromotionError(error.message);
    }
  };

  const handleStatusToggle = async () => {
    try {
      const { data: result } = await updateUserStatus({
        variables: { userId: user.id, isActive: !user.isActive },
      });
      onFeedback({
        type: result.updateUserStatus?.success ? 'success' : 'error',
        message: result.updateUserStatus?.message ?? 'Estado actualizado.',
      });
      await onRefetch();
    } catch (error) {
      onFeedback({ type: 'error', message: error.message });
    }
  };

  const handleSilence = async (hours) => {
    try {
      const { data: result } = await silenceUser({ variables: { userId: user.id, hours } });
      onFeedback({
        type: result.silenceUser?.success ? 'success' : 'error',
        message: result.silenceUser?.message ?? 'Silencio aplicado.',
      });
      await onRefetch();
    } catch (error) {
      onFeedback({ type: 'error', message: error.message });
    }
  };

  const protectedAdmin = isAdmin(user);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">
            Editar Usuario: {user.firstName} {user.lastName}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {protectedAdmin ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 mb-6">
            <i className="fa-solid fa-shield-halved mr-2" />
            Este usuario es un <strong>Administrador protegido</strong>. No se puede modificar su rol, estado ni silenciarlo.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Rol */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">Cambiar Rol</h4>
              <div className="flex items-start gap-3">
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setPromotionError('');
                  }}
                  disabled={updatingRole}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm flex-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
                <button
                  onClick={handleRoleChange}
                  disabled={updatingRole || selectedRole === user.role}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {updatingRole ? 'Guardando...' : 'Aplicar Rol'}
                </button>
              </div>

              {selectedRole === 'Administrador' && selectedRole !== user.role && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 mt-2">
                  <p className="text-sm font-bold text-red-700 mb-2">
                    <i className="fa-solid fa-triangle-exclamation mr-2" />
                    Requiere confirmación
                  </p>
                  <p className="text-xs text-red-600 mb-3">
                    Estás a punto de otorgar privilegios máximos. Esta cuenta quedará protegida y no podrá degradarse.
                  </p>
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      setPromotionError('');
                    }}
                    placeholder="Tu contraseña de administrador"
                    className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                  />
                  {promotionError && (
                    <p className="mt-2 text-xs font-semibold text-red-700">{promotionError}</p>
                  )}
                </div>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Estado */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">Estado de la cuenta</h4>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {user.isActive ? 'Cuenta Activa' : 'Cuenta Suspendida'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user.isActive 
                      ? 'El usuario puede iniciar sesión y participar.' 
                      : 'El usuario no puede acceder al sistema.'}
                  </p>
                </div>
                <button
                  onClick={handleStatusToggle}
                  disabled={updatingStatus}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                    user.isActive 
                      ? 'border border-red-200 bg-white text-red-600 hover:bg-red-50' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {updatingStatus ? 'Procesando...' : (user.isActive ? 'Suspender' : 'Activar')}
                </button>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Silenciar */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">Moderar interacciones (Silenciar)</h4>
              <p className="text-xs text-slate-500">
                Evita que el usuario publique, comente o reaccione durante un período.
              </p>
              <div className="flex flex-wrap gap-2">
                {silenceOptions.map((option) => (
                  <button
                    key={option.hours}
                    onClick={() => handleSilence(option.hours)}
                    disabled={silencingUser}
                    className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-200 disabled:opacity-50 transition-colors"
                  >
                    Silenciar {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Cerrar panel
          </button>
        </div>
      </div>
    </div>
  );
};
