import React from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../branding/BrandLogo';
import { BrandLockup } from '../branding/BrandLockup';
import { RevealOnScroll } from '../common/RevealOnScroll';
import { usePointerSpotlight } from '../../hooks/usePointerSpotlight';
import { EMPLOYER_REQUEST_NAVIGATION } from '../jobs/employerNavigation';

const PRODUCT_AREAS = [
  {
    icon: 'fa-solid fa-users',
    title: 'Comunidad académica',
    description: 'Compartí consultas, recursos y experiencias con estudiantes, docentes y egresados de tu carrera.',
  },
  {
    icon: 'fa-solid fa-graduation-cap',
    title: 'Trayectoria conectada',
    description: 'Organizá materias, progreso y perfil profesional en un espacio institucional pensado para acompañarte.',
  },
  {
    icon: 'fa-solid fa-briefcase',
    title: 'Oportunidades reales',
    description: 'Descubrí propuestas laborales y presentá tu perfil académico desde la misma red en la que participás.',
  },
];

const ROLE_PATHS = [
  { label: 'Estudiantes', detail: 'Aprender, participar y construir una identidad profesional.' },
  { label: 'Docentes', detail: 'Acompañar cursadas y compartir conocimiento con contexto.' },
  { label: 'Egresados', detail: 'Mantener vínculos y acercar experiencia a la comunidad.' },
  { label: 'Empleadores', detail: 'Conectar oportunidades con talento académico verificable.' },
];

const focusClasses = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-cyan-300 dark:focus-visible:ring-offset-slate-900';

export const Landing = () => {
  const { containerRef, spotlightHandlers } = usePointerSpotlight();

  return (
    <main
      ref={containerRef}
      {...spotlightHandlers}
      className="relative isolate min-h-screen overflow-hidden bg-slate-50/92 text-slate-800 transition-colors duration-300 dark:bg-slate-800/92 dark:text-slate-200"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-80 motion-reduce:hidden dark:opacity-0"
        style={{
          background: 'radial-gradient(860px circle at var(--spotlight-x) var(--spotlight-y), rgba(56,189,248,0.24), rgba(254,215,170,0.12) 46%, transparent 76%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 hidden opacity-90 dark:block motion-reduce:hidden"
        style={{
          background: 'radial-gradient(920px circle at var(--spotlight-x) var(--spotlight-y), rgba(59,130,246,0.25), rgba(139,92,246,0.14) 44%, transparent 76%)',
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[42rem] bg-[radial-gradient(circle_at_75%_20%,rgba(56,189,248,0.15),transparent_34%),radial-gradient(circle_at_15%_35%,rgba(129,140,248,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_75%_20%,rgba(37,99,235,0.16),transparent_34%),radial-gradient(circle_at_15%_35%,rgba(91,33,182,0.13),transparent_30%)]" />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-20">
        <div className="max-w-3xl">
          <BrandLockup
            variant="full"
            label="OneITB, red académica del Instituto Tecnológico Beltrán"
            fetchpriority="high"
          />
          <p className="mt-10 inline-flex items-center gap-2 rounded-full border border-cyan-700/15 bg-cyan-50/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan-800 shadow-sm backdrop-blur-md dark:border-cyan-300/15 dark:bg-cyan-300/5 dark:text-cyan-200">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.7)]" />
            Red académica institucional
          </p>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.04] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-slate-100">
            Tu recorrido académico,
            <span className="block bg-gradient-to-r from-cyan-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-300 dark:to-indigo-300"> conectado con tu futuro.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-300">
            Un espacio para aprender en comunidad, compartir conocimiento, mostrar tu trayectoria y descubrir nuevas oportunidades dentro del ecosistema Beltrán.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className={`group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-slate-100 shadow-lg shadow-slate-900/15 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-cyan-900/20 dark:bg-cyan-400 dark:text-slate-950 dark:hover:bg-cyan-300 ${focusClasses}`}
            >
              Iniciar sesión
              <i className="fa-solid fa-arrow-right text-xs transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              to="/register"
              className={`inline-flex items-center justify-center rounded-xl border border-slate-300/80 bg-slate-100/70 px-5 py-3 text-sm font-bold text-slate-800 shadow-sm backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-800/55 dark:text-slate-100 dark:hover:border-cyan-300/30 dark:hover:bg-slate-800 ${focusClasses}`}
            >
              Crear cuenta institucional
            </Link>
            <Link
              to={EMPLOYER_REQUEST_NAVIGATION.path}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300/80 bg-blue-50/80 px-5 py-3 text-sm font-bold text-blue-800 shadow-sm backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-cyan-500/50 hover:bg-cyan-50 dark:border-blue-300/20 dark:bg-blue-400/10 dark:text-blue-200 dark:hover:border-cyan-300/30 dark:hover:bg-cyan-400/10 ${focusClasses}`}
            >
              <i className="fa-solid fa-building" aria-hidden="true" />
              {EMPLOYER_REQUEST_NAVIGATION.fullLabel}
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2"><i className="fa-solid fa-shield-halved text-cyan-600 dark:text-cyan-300" aria-hidden="true" />Identidad institucional</span>
            <span className="inline-flex items-center gap-2"><i className="fa-solid fa-bolt text-blue-600 dark:text-blue-300" aria-hidden="true" />Interacción en tiempo real</span>
            <span className="inline-flex items-center gap-2"><i className="fa-solid fa-layer-group text-indigo-600 dark:text-indigo-300" aria-hidden="true" />Experiencia integrada</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div aria-hidden="true" className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-cyan-400/18 via-blue-500/12 to-indigo-500/18 blur-3xl dark:from-cyan-400/12 dark:via-blue-600/15 dark:to-violet-600/15" />
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-300/70 bg-slate-100/65 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.16)] backdrop-blur-2xl sm:p-5 dark:border-white/10 dark:bg-slate-800/45 dark:shadow-[0_34px_90px_rgba(2,6,23,0.45)]">
            <div className="rounded-[1.55rem] border border-slate-300/60 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-900/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BrandLogo variant="symbol" alt="OneITB" className="h-11 w-11 object-contain" loading="lazy" />
                  <div>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Comunidad OneITB</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Actividad académica en un solo lugar</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">Integrado</span>
              </div>
              <div className="mt-6 space-y-3">
                {['Recursos de Base de Datos', 'Consulta sobre Programación III', 'Nueva oportunidad para estudiantes'].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-100/75 p-3.5 dark:border-white/5 dark:bg-slate-800/65">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${index === 0 ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300' : index === 1 ? 'bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-300'}`}>
                      <i className={index === 0 ? 'fa-solid fa-file-lines' : index === 1 ? 'fa-solid fa-comments' : 'fa-solid fa-briefcase'} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{item}</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className={`h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 ${index === 0 ? 'w-4/5' : index === 1 ? 'w-3/5' : 'w-2/3'}`} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <RevealOnScroll as="section" className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10" aria-labelledby="platform-title">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">Una plataforma, todo tu recorrido</p>
          <h2 id="platform-title" className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">Tecnología con propósito académico</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">Cada módulo conecta personas, conocimiento y oportunidades sin perder el contexto institucional.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PRODUCT_AREAS.map((area, index) => (
            <RevealOnScroll key={area.title} as="article" delay={index * 90} className="group rounded-2xl border border-slate-300/65 bg-slate-100/70 p-6 shadow-sm backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-cyan-500/35 hover:shadow-xl hover:shadow-cyan-900/5 dark:border-white/10 dark:bg-slate-800/45 dark:hover:border-cyan-300/20 dark:hover:shadow-cyan-950/20">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-600/10 bg-cyan-100 text-cyan-700 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-cyan-300/10 dark:bg-cyan-300/10 dark:text-cyan-300"><i className={area.icon} aria-hidden="true" /></span>
              <h3 className="mt-5 text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{area.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{area.description}</p>
            </RevealOnScroll>
          ))}
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="relative z-10 border-y border-slate-300/60 bg-stone-100/65 py-20 dark:border-white/10 dark:bg-slate-950/35">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">Construida para toda la comunidad</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">Un punto de encuentro que evoluciona con vos</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">OneITB acompaña distintas etapas y responsabilidades con herramientas específicas, una identidad consistente y datos vinculados a tu experiencia académica.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLE_PATHS.map(({ label, detail }, index) => (
              <div key={label} className="rounded-2xl border border-slate-300/65 bg-slate-50/70 p-4 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-slate-800/45">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-xs font-black text-slate-700 dark:bg-slate-700 dark:text-slate-200">0{index + 1}</span>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100">{label}</h3>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-300">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="grid overflow-hidden rounded-[2rem] border border-slate-300/70 bg-slate-100/75 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:grid-cols-[0.9fr_1.1fr] dark:border-white/10 dark:bg-slate-800/45 dark:shadow-[0_24px_70px_rgba(2,6,23,0.35)]">
          <div className="flex flex-col justify-center p-7 sm:p-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-300">Identidad OneITB</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">Tecnología, institución y comunidad en una misma experiencia.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">Una plataforma concebida para que cada aporte tenga contexto y cada trayectoria tenga visibilidad.</p>
          </div>
          <div className="relative flex min-h-72 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_70%_25%,rgba(34,211,238,0.28),transparent_30%),linear-gradient(135deg,#e2e8f0,#dbeafe_48%,#e0e7ff)] p-10 dark:bg-[radial-gradient(circle_at_70%_25%,rgba(34,211,238,0.17),transparent_30%),linear-gradient(135deg,#0f172a,#172554_48%,#1e1b4b)]">
            <div aria-hidden="true" className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(71,85,105,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(71,85,105,0.12)_1px,transparent_1px)] [background-size:32px_32px] dark:opacity-25" />
            <BrandLockup variant="full" label="Identidad visual de OneITB" className="relative z-10" loading="lazy" />
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className="relative z-10 px-5 pb-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-cyan-700/15 bg-gradient-to-br from-cyan-100/70 via-slate-100/80 to-indigo-100/70 p-8 text-center shadow-xl shadow-cyan-950/5 sm:p-12 dark:border-cyan-300/10 dark:from-cyan-950/35 dark:via-slate-800/70 dark:to-indigo-950/35 dark:shadow-cyan-950/20">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Tu comunidad ya tiene un lugar.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">Ingresá con tu identidad institucional y empezá a construir una experiencia académica más conectada.</p>
          <Link to="/register" className={`mt-7 inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-slate-100 shadow-lg shadow-blue-900/15 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-600 dark:bg-blue-500 dark:hover:bg-blue-400 ${focusClasses}`}>Sumarme a OneITB</Link>
        </div>
      </RevealOnScroll>

      <footer className="relative z-10 border-t border-slate-300/60 bg-slate-100/70 px-5 py-9 backdrop-blur-lg dark:border-white/10 dark:bg-slate-950/45">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
          <BrandLockup label="OneITB" loading="lazy" />
          <p className="text-center text-xs leading-5 text-slate-500 sm:text-right dark:text-slate-400">Instituto Tecnológico Beltrán<br />Red académica institucional · 2026</p>
        </div>
      </footer>
    </main>
  );
};
