import React from 'react';

const VARIANTS = {
  card: 'group flex h-full flex-col rounded-2xl border border-slate-300/65 bg-slate-100/75 p-5 shadow-sm backdrop-blur-xl transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-lg dark:border-white/10 dark:bg-slate-800/55 dark:hover:border-cyan-300/25',
  compact: 'inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-slate-600 transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:text-slate-300 dark:hover:text-cyan-300',
};

export const ExternalInstitutionalLink = ({ service, variant = 'card' }) => {
  const accessibleName = `${service.name}, sitio externo, se abre en una pestaña nueva`;

  if (variant === 'compact') {
    return (
      <a href={service.href} target="_blank" rel="noopener noreferrer" aria-label={accessibleName} className={VARIANTS.compact}>
        {service.name}
        <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" aria-hidden="true" />
      </a>
    );
  }

  return (
    <a href={service.href} target="_blank" rel="noopener noreferrer" aria-label={accessibleName} className={VARIANTS.card}>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-300/10 dark:text-cyan-300">
        <i className={service.icon} aria-hidden="true" />
      </span>
      <span className="mt-4 flex items-center gap-2 text-base font-extrabold text-slate-900 dark:text-slate-100">
        {service.name}
        <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-slate-400" aria-hidden="true" />
      </span>
      <span className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{service.description}</span>
    </a>
  );
};
