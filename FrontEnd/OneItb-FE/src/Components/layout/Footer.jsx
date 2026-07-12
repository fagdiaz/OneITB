import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer className="print:hidden mt-4 border-t border-slate-200 px-2 py-8 dark:border-white/10">
    <div className="flex flex-col gap-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
      <div>
        <p className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">OneITB</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Red social academica del Instituto Tecnologico Beltran.
        </p>
      </div>
      <nav aria-label="Enlaces del pie de pagina" className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500 sm:justify-end dark:text-slate-400">
        <Link to="/feed" className="transition hover:text-blue-600 dark:hover:text-blue-300">Muro</Link>
        <Link to="/academic" className="transition hover:text-blue-600 dark:hover:text-blue-300">Academico</Link>
        <Link to="/empleos" className="transition hover:text-blue-600 dark:hover:text-blue-300">Empleos</Link>
        <Link to="/profile" className="transition hover:text-blue-600 dark:hover:text-blue-300">Mi perfil</Link>
      </nav>
    </div>
    <p className="mt-5 text-center text-[11px] text-slate-400 sm:text-left">
      © {new Date().getFullYear()} OneITB23 · Practica Profesionalizante III · Uso academico institucional.
    </p>
  </footer>
);
