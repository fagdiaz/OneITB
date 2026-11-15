import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { ModerationManagement } from '../admin/ModerationManagement';
import { ModerationAuditManagement } from '../admin/ModerationAuditManagement';

const tabs = [
  { id: 'reports', label: 'Reportes de Comunidad', icon: 'fa-shield-halved', component: ModerationManagement },
  { id: 'audit', label: 'Auditoria de Moderacion', icon: 'fa-clipboard-list', component: ModerationAuditManagement },
];

export const ModerationDashboard = () => {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState('reports');
  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component ?? ModerationManagement;

  const isAuthorized = auth?.role === 'Moderador' || auth?.role === 'Administrador';

  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/20 dark:bg-red-500/10">
          <h1 className="text-lg font-bold text-red-700 dark:text-red-400">Acceso restringido</h1>
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">
            Esta seccion requiere el rol Moderador o Administrador.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-slate-900 dark:text-slate-100">
      <header>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Panel Institucional
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Panel de Moderación
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Supervisión de reportes comunitarios y auditoría forense de resoluciones disciplinarias.
        </p>
      </header>

      <nav
        className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-slate-900/70"
        aria-label="Secciones de moderacion"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white shadow-sm dark:bg-amber-500 dark:text-slate-950 dark:shadow-md'
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
