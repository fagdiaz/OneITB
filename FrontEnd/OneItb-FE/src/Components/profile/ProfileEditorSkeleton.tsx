import React from 'react';

export const ProfileEditorSkeleton = () => (
  <main
    className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950"
    aria-busy="true"
    aria-label="Cargando perfil institucional"
  >
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
      {[0, 1].map((column) => (
        <section
          key={column}
          className="animate-pulse rounded-3xl border border-slate-200 bg-slate-100/80 p-6 dark:border-white/10 dark:bg-slate-900/70"
        >
          <div className="h-5 w-44 rounded bg-slate-300 dark:bg-slate-700" />
          <div className="mt-6 h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </section>
      ))}
    </div>
    <p className="sr-only" role="status">Cargando tu perfil completo...</p>
  </main>
);
