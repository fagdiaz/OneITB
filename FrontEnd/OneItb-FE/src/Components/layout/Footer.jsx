import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLockup } from '../branding/BrandLockup';

export const Footer = () => (
  <footer className="print:hidden relative z-10 mt-auto border-t border-slate-300/60 bg-slate-100/75 px-5 py-8 backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/80">
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <BrandLockup label="OneITB" loading="lazy" />
        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-300">
          Red social académica del Instituto Tecnológico Beltrán.
        </p>
      </div>
      <nav aria-label="Enlaces del pie de página" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-600 sm:justify-end dark:text-slate-300">
        <Link to="/feed" className="transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:hover:text-cyan-300">Muro</Link>
        <Link to="/academic" className="transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:hover:text-cyan-300">Académico</Link>
        <Link to="/empleos" className="transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:hover:text-cyan-300">Empleos</Link>
        <Link to="/profile" className="transition hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:hover:text-cyan-300">Mi perfil</Link>
      </nav>
    </div>
    <p className="mx-auto mt-6 max-w-7xl text-center text-[11px] text-slate-400 sm:text-left dark:text-slate-400">
      © {new Date().getFullYear()} OneITB23 · Práctica Profesionalizante III · Uso académico institucional.
    </p>
  </footer>
);
