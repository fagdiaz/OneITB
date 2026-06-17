import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import useAuth from '../../hooks/useAuth';
import { GET_USER_PROFILE } from '../../data/graphql/queries/getUserProfile';
import { CVData } from '../../types/resume';
import { Button } from '../ui/Button';
import { PersonalForm } from '../editor/PersonalForm';
import { ExperienceForm } from '../editor/ExperienceForm';
import { EducationForm } from '../editor/EducationForm';
import { ProjectsForm } from '../editor/ProjectsForm';
import { SkillsLanguagesForm } from '../editor/SkillsLanguagesForm';
import { ResumePreview } from '../resume/ResumePreview';

type AccentTheme = 'graphite' | 'deepTeal' | 'navyInk' | 'mutedOlive';

const initialData: CVData = {
  personalInfo: {
    name: 'Usuario OneITB',
    title: 'Perfil academico y profesional',
    email: 'usuario@itbeltran.com.ar',
    phone: '',
    location: 'Buenos Aires, Argentina',
    linkedin: '',
    github: '',
    website: '',
  },
  summary: 'Completa tu resumen profesional y academico.',
  experience: [],
  education: [],
  projects: [],
  skills: [],
  languages: [],
};

export const CvEditorProfile = () => {
  const { auth } = useAuth();
  const [cvData, setCvData] = useState<CVData>(initialData);
  const [activeTheme, setActiveTheme] = useState<AccentTheme>('graphite');
  const resumeRef = useRef<HTMLDivElement>(null);

  const { data: gqlData } = useQuery(GET_USER_PROFILE, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const activeUser = gqlData?.users?.find((user: any) => user.id === auth.id) || auth;
    if (!activeUser) return;

    setCvData((current) => ({
      ...current,
      personalInfo: {
        ...current.personalInfo,
        name: activeUser.fullName || auth.fullName || auth.username || current.personalInfo.name,
        email: activeUser.email || current.personalInfo.email,
        phone: activeUser.phone || current.personalInfo.phone,
        linkedin: activeUser.linkedIn || current.personalInfo.linkedin,
      },
      summary: activeUser.biography || current.summary,
    }));
  }, [auth, gqlData]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <main className="grid h-[calc(100vh-56px)] flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
        <section className="no-print space-y-6 overflow-y-auto p-4 md:p-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h1 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Edicion del Curriculum
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded border border-slate-200/80 bg-white px-1.5 py-0.5 shadow-sm">
                {[
                  ['graphite', 'bg-slate-500'],
                  ['deepTeal', 'bg-teal-800'],
                  ['navyInk', 'bg-indigo-950'],
                  ['mutedOlive', 'bg-emerald-800'],
                ].map(([theme, color]) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setActiveTheme(theme as AccentTheme)}
                    className={`h-3 w-3 rounded-full ${color} transition hover:scale-110 ${
                      activeTheme === theme ? 'scale-105 ring-1 ring-slate-800 ring-offset-2' : 'opacity-85'
                    }`}
                    aria-label={`Tema ${theme}`}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => window.print()}
                className="!border-slate-700 !bg-slate-800 !text-white hover:!bg-slate-700"
              >
                Imprimir / PDF
              </Button>
            </div>
          </div>

          <PersonalForm
            personalInfo={cvData.personalInfo}
            summary={cvData.summary}
            onChangePersonalInfo={(personalInfo) => setCvData({ ...cvData, personalInfo })}
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

        <section className="overflow-y-auto border-t border-slate-200 bg-slate-200/50 lg:border-l lg:border-t-0">
          <ResumePreview ref={resumeRef} data={cvData} activeTheme={activeTheme} />
        </section>
      </main>
    </div>
  );
};
