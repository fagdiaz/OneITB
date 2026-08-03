import React from 'react';
import { BrandLogo } from '../branding/BrandLogo';

export const AcademicOnboardingFrame = ({
  children,
  title,
  description,
}) => (
  <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(59,130,246,0.13),transparent_36%)] dark:bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.10),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(59,130,246,0.14),transparent_36%)]"
    />
    <section
      aria-labelledby="academic-onboarding-title"
      className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-slate-100/90 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-9 dark:border-white/10 dark:bg-slate-800/92 dark:shadow-[0_32px_90px_rgba(2,6,23,0.48)]"
    >
      <BrandLogo
        variant="full"
        alt="OneITB"
        className="h-auto w-36 object-contain"
      />
      <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
        Configuración inicial
      </p>
      <h1
        id="academic-onboarding-title"
        className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50"
      >
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
        {description}
      </p>
      <div className="mt-7">{children}</div>
    </section>
  </main>
);

export const AcademicOnboardingLoading = () => (
  <AcademicOnboardingFrame
    title="Preparando tu espacio académico"
    description="Estamos validando tu identidad y tus carreras antes de abrir la plataforma."
  >
    <div
      role="status"
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-900/55 dark:text-slate-300"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      Cargando configuración...
    </div>
  </AcademicOnboardingFrame>
);
