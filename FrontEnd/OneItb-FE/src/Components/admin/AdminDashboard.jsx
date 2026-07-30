import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { UserManagement } from './UserManagement';
import { SubjectManagement } from './SubjectManagement';
import { ModerationManagement } from './ModerationManagement';
import { PublicationManagement } from './PublicationManagement';
import { CommentManagement } from './CommentManagement';
import { ModerationAuditManagement } from './ModerationAuditManagement';
import { EmployerRequestManagement } from './EmployerRequestManagement';

const tabs = [
  { id: 'users', label: 'Usuarios', icon: 'fa-users', component: UserManagement },
  { id: 'subjects', label: 'Materias', icon: 'fa-book-open', component: SubjectManagement },
  { id: 'publications', label: 'Publicaciones', icon: 'fa-newspaper', component: PublicationManagement },
  { id: 'comments', label: 'Comentarios', icon: 'fa-comments', component: CommentManagement },
  { id: 'moderation', label: 'Moderacion / Reportes', icon: 'fa-shield-halved', component: ModerationManagement },
  { id: 'audit', label: 'Auditoria', icon: 'fa-clipboard-list', component: ModerationAuditManagement },
  { id: 'employer-requests', label: 'Solicitudes de Empleadores', icon: 'fa-building-circle-check', component: EmployerRequestManagement },
];

export const AdminDashboard = () => {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component ?? UserManagement;

  if (auth.role !== 'Administrador') {
    return (
      <div className="mx-auto max-w-xl p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-lg font-bold text-red-700">Acceso restringido</h1>
          <p className="mt-2 text-sm text-red-600">Esta seccion requiere el rol Administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-slate-900 dark:text-slate-100">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Panel de administracion</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gestion operativa de la comunidad OneITB23.</p>
      </header>

      <nav className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-slate-900/70" aria-label="Secciones administrativas">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100'
            }`}
          >
            <i className={`fa-solid ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </nav>

      <ActiveComponent />
    </div>
  );
};
