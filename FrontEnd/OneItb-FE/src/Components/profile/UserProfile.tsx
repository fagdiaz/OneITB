import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USER_PROFILE } from '../../data/graphql/queries/getUserProfile';
import { UPDATE_PROFILE } from '../../data/graphql/mutations/updateProfile';
import useAuth from '../../hooks/useAuth';

// CV Types
import { CVData } from '../../types/resume';

// UI Components (from transplanted cv-builder)
import { Button } from '../ui/Button';

// Editor Forms (from transplanted cv-builder)
import { PersonalForm } from '../editor/PersonalForm';
import { ExperienceForm } from '../editor/ExperienceForm';
import { EducationForm } from '../editor/EducationForm';
import { ProjectsForm } from '../editor/ProjectsForm';
import { SkillsLanguagesForm } from '../editor/SkillsLanguagesForm';

// Resume Preview (from transplanted cv-builder)
import { ResumePreview } from '../resume/ResumePreview';

// ─────────────────────────────────────────────
// Exact initialData from _temp_cv_reference/data/initialData.ts
// ─────────────────────────────────────────────
const initialData: CVData = {
  personalInfo: {
    name: 'Alejandro Silva',
    title: 'Senior Software Engineer',
    email: 'alejandro.silva@email.com',
    phone: '+54 11 9876-5432',
    location: 'Buenos Aires, Argentina',
    linkedin: 'linkedin.com/in/alejandrosilva',
    github: 'github.com/alesilva',
    website: 'alejandrosilva.dev'
  },
  summary: 'Ingeniero de Software con más de 6 años de experiencia especializándose en el desarrollo de aplicaciones web de alto rendimiento. Experto en React, TypeScript, Node.js y arquitectura de frontend moderna. Apasionado por escribir código limpio, mantenible y optimizar la experiencia de usuario y rendimiento a escala.',
  experience: [
    {
      id: 'exp-1',
      company: 'TechFlow Solutions',
      role: 'Lead Frontend Engineer',
      startDate: '2023-03',
      endDate: 'Presente',
      location: 'Buenos Aires (Remoto)',
      description: 'Liderazgo técnico de un equipo de 5 ingenieros. Migración exitosa de la plataforma principal a una arquitectura Next.js y TypeScript, mejorando los tiempos de carga en un 40%. Implementación de una biblioteca interna de componentes UI de alto rendimiento.'
    },
    {
      id: 'exp-2',
      company: 'MercadoLibre',
      role: 'Senior React Developer',
      startDate: '2020-07',
      endDate: '2023-02',
      location: 'Buenos Aires, Argentina',
      description: 'Desarrollo de nuevas funcionalidades clave para el panel de vendedores, impactando a millones de usuarios diarios. Optimización de renderizado React reduciendo el consumo de memoria del cliente en un 25%. Diseño e integración de servicios RESTful robustos.'
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Universidad de Buenos Aires',
      degree: 'Licenciatura en Análisis de Sistemas',
      startDate: '2016-03',
      endDate: '2021-12',
      location: 'Buenos Aires, Argentina',
      description: 'Promedio destacado. Especialización en Ingeniería de Software y Estructuras de Datos.'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'UltraEdit CV',
      role: 'Creador & Mantenedor',
      startDate: '2025-01',
      endDate: '2025-03',
      url: 'github.com/alesilva/ultraedit-cv',
      description: 'Una aplicación reactiva de código abierto para redactar CV profesionales listos para impresión A4 e indexación por sistemas ATS.'
    },
    {
      id: 'proj-2',
      name: 'Reactive State Store',
      role: 'Autor Principal',
      startDate: '2022-10',
      endDate: '2022-12',
      url: 'github.com/alesilva/reactive-state',
      description: 'Micro-biblioteca de gestión de estado global ultra liviana (<1KB gzipped) construida en TypeScript para aplicaciones React.'
    }
  ],
  skills: [
    { id: 'sk-1', name: 'React' },
    { id: 'sk-2', name: 'TypeScript' },
    { id: 'sk-3', name: 'Next.js' },
    { id: 'sk-4', name: 'Node.js' },
    { id: 'sk-5', name: 'Tailwind CSS' },
    { id: 'sk-6', name: 'GraphQL' },
    { id: 'sk-7', name: 'Web Performance' },
    { id: 'sk-8', name: 'Clean Code' }
  ],
  languages: [
    { id: 'lang-1', name: 'Español', level: 'Nativo' },
    { id: 'lang-2', name: 'Inglés', level: 'C1 - Avanzado' }
  ]
};

// ─────────────────────────────────────────────
// Accent theme type (identical to reference)
// ─────────────────────────────────────────────
type AccentTheme = 'graphite' | 'deepTeal' | 'navyInk' | 'mutedOlive';

// ─────────────────────────────────────────────
// UserProfile — 035 Literal CV Transplant
// JSX structure is a direct copy of _temp_cv_reference/App.tsx
// Differences:
//   - No <header> bar (PrivateLayout already provides the navbar)
//   - h-[calc(100vh-56px)] instead of 64px (PrivateLayout navbar is h-14 = 56px)
//   - window.print() instead of react-to-print
//   - GraphQL hooks kept but only used for backend sync (cvData is local state)
// ─────────────────────────────────────────────
export const UserProfile = () => {
  const { auth } = useAuth();

  // Local CV state — initialized from exact initialData mock
  const [cvData, setCvData] = useState<CVData>(initialData);
  const [activeTheme, setActiveTheme] = useState<AccentTheme>('graphite');

  // Resume ref for printing
  const resumeRef = useRef<HTMLDivElement>(null);

  // GraphQL (kept for future backend sync — does NOT drive cvData state)
  const { data: gqlData, refetch } = useQuery(GET_USER_PROFILE, {
    fetchPolicy: 'network-only'
  });
  const [updateProfile] = useMutation(UPDATE_PROFILE);

  // Seed name/email from GraphQL session if available
  useEffect(() => {
    const activeUser = gqlData?.users?.find((u: any) => u.id === auth.id) || auth;
    if (activeUser?.fullName) {
      setCvData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          name: activeUser.fullName || prev.personalInfo.name,
          email: activeUser.email || prev.personalInfo.email,
        }
      }));
    }
  }, [gqlData]);

  // Print handler — window.print() fallback (no react-to-print needed)
  const handlePrint = () => {
    window.print();
  };

  // ─────────────────────────────────────────────
  // JSX — EXACT copy of _temp_cv_reference/App.tsx return()
  // Root wrapper and main split structure are identical.
  // The only omitted element is the <header> toolbar since
  // PrivateLayout already renders the top navigation bar.
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* Main Split Layout Workspace
          h offset = 56px = h-14 height of PrivateLayout sticky Header */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden h-[calc(100vh-56px)]">

        {/* Left Side: Editor Form Panel */}
        <section className="no-print p-4 md:p-6 overflow-y-auto custom-scrollbar space-y-6">

          {/* Top row: section label + theme swatches + print button */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 select-none">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Información del Currículum
            </h2>

            <div className="flex items-center gap-3">
              {/* Theme swatches */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Estilo:
                </span>
                <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-1.5 py-0.5 rounded shadow-sm">
                  <button
                    type="button"
                    onClick={() => setActiveTheme('graphite')}
                    className={`w-3 h-3 rounded-full bg-slate-500 cursor-pointer transition-all hover:scale-110 ${activeTheme === 'graphite' ? 'ring-1 ring-offset-2 ring-slate-800 scale-105' : 'opacity-85'}`}
                    title="Gris Grafito"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveTheme('deepTeal')}
                    className={`w-3 h-3 rounded-full bg-teal-800 cursor-pointer transition-all hover:scale-110 ${activeTheme === 'deepTeal' ? 'ring-1 ring-offset-2 ring-slate-800 scale-105' : 'opacity-85'}`}
                    title="Teal Profundo"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveTheme('navyInk')}
                    className={`w-3 h-3 rounded-full bg-indigo-950 cursor-pointer transition-all hover:scale-110 ${activeTheme === 'navyInk' ? 'ring-1 ring-offset-2 ring-slate-800 scale-105' : 'opacity-85'}`}
                    title="Navy Ink"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveTheme('mutedOlive')}
                    className={`w-3 h-3 rounded-full bg-emerald-800 cursor-pointer transition-all hover:scale-110 ${activeTheme === 'mutedOlive' ? 'ring-1 ring-offset-2 ring-slate-800 scale-105' : 'opacity-85'}`}
                    title="Verde Sage"
                  />
                </div>
              </div>

              {/* Print button */}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handlePrint}
                className="!bg-slate-800 !text-white !border-slate-700 hover:!bg-slate-700 font-bold"
              >
                Imprimir / PDF
              </Button>
            </div>
          </div>

          {/* Editor Forms — exact same order and prop names as reference App.tsx */}
          <PersonalForm
            personalInfo={cvData.personalInfo}
            summary={cvData.summary}
            onChangePersonalInfo={(info) => setCvData({ ...cvData, personalInfo: info })}
            onChangeSummary={(summary) => setCvData({ ...cvData, summary })}
          />

          <ExperienceForm
            experience={cvData.experience}
            onChangeExperience={(experience) => setCvData({ ...cvData, experience })}
          />

          <EducationForm
            education={cvData.education}
            onChangeEducation={(education) => setCvData({ ...cvData, education })}
          />

          <ProjectsForm
            projects={cvData.projects}
            onChangeProjects={(projects) => setCvData({ ...cvData, projects })}
          />

          <SkillsLanguagesForm
            skills={cvData.skills}
            onChangeSkills={(skills) => setCvData({ ...cvData, skills })}
            languages={cvData.languages}
            onChangeLanguages={(languages) => setCvData({ ...cvData, languages })}
          />

        </section>

        {/* Right Side: Live A4 Document Preview Panel */}
        <section className="bg-slate-200/50 border-t lg:border-t-0 lg:border-l border-slate-200 overflow-y-auto">
          <ResumePreview ref={resumeRef} data={cvData} activeTheme={activeTheme} />
        </section>

      </main>
    </div>
  );
};
