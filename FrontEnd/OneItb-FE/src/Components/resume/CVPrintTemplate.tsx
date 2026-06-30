import React from 'react';
import { CVData } from '../../types/resume';

type AccentTheme = 'graphite' | 'deepTeal' | 'navyInk' | 'mutedOlive';

interface CVPrintTemplateProps {
  data: CVData;
  activeTheme?: AccentTheme;
}

const THEMES: Record<AccentTheme, { accent: string; title: string; line: string }> = {
  graphite: { accent: 'bg-slate-500', title: 'text-slate-800', line: 'bg-slate-200' },
  deepTeal: { accent: 'bg-teal-700', title: 'text-teal-900', line: 'bg-teal-900/20' },
  navyInk: { accent: 'bg-indigo-900', title: 'text-indigo-900', line: 'bg-indigo-900/20' },
  mutedOlive: { accent: 'bg-emerald-800', title: 'text-emerald-900', line: 'bg-emerald-900/20' },
};

const visible = <T extends { hidden?: boolean }>(items: T[] = []) => items.filter((item) => !item.hidden);

const SectionTitle = ({ children, theme }: { children: React.ReactNode; theme: { title: string; line: string } }) => (
  <div className="mb-2">
    <h2 className={`text-[10px] font-bold uppercase tracking-[0.22em] ${theme.title}`}>{children}</h2>
    <div className={`mt-1 h-px w-full ${theme.line}`} />
  </div>
);

export const CVPrintTemplate = React.forwardRef<HTMLDivElement, CVPrintTemplateProps>(
  ({ data, activeTheme = 'navyInk' }, ref) => {
    const theme = THEMES[activeTheme];
    const contacts = [
      data.personalInfo.email,
      data.personalInfo.phone,
      data.personalInfo.location,
      data.personalInfo.linkedin,
      data.personalInfo.github,
      data.personalInfo.website,
    ].filter(Boolean);
    const experience = visible(data.experience).slice(0, 4);
    const education = visible(data.education).slice(0, 4);
    const projects = visible(data.projects).slice(0, 3);
    const skills = visible(data.skills);
    const languages = visible(data.languages);

    return (
      <div ref={ref} className="cv-print-page relative mx-auto h-[297mm] w-[210mm] overflow-hidden bg-white p-[15mm] text-slate-800 shadow-xl ring-1 ring-slate-200 print:m-0 print:h-[297mm] print:w-[210mm] print:overflow-hidden print:bg-white print:p-[14mm] print:text-black print:shadow-none print:ring-0">
        <span className={`absolute left-[8mm] top-[10mm] bottom-[10mm] w-[3px] ${theme.accent}`} />

        <header className="flex items-start justify-between gap-7 border-b border-slate-100 pb-4 pl-[6mm]">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Curriculum institucional</p>
            <h1 className="mt-1 text-[25px] font-black leading-tight tracking-tight text-slate-950">
              {data.personalInfo.name || 'Usuario OneITB'}
            </h1>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {data.personalInfo.title || 'Perfil academico'}
            </p>
            {contacts.length > 0 && (
              <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
                {contacts.join('  ·  ')}
              </p>
            )}
          </div>
          {data.personalInfo.profileImage && (
            <img
              src={data.personalInfo.profileImage}
              alt="Foto de perfil"
              className="mr-3 h-20 w-20 shrink-0 rounded-full border border-slate-100 object-cover"
            />
          )}
        </header>

        <main className="mt-4 space-y-4 pl-[6mm]">
          {data.summary && (
            <section className="print-avoid-break">
              <SectionTitle theme={theme}>Perfil Profesional</SectionTitle>
              <p className="text-[12px] leading-relaxed text-slate-600 text-justify whitespace-pre-line">
                {data.summary}
              </p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <SectionTitle theme={theme}>Experiencia Laboral</SectionTitle>
              <div className="space-y-2.5">
                {experience.map((item) => (
                  <article key={item.id} className="print-avoid-break">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className={`text-[12px] font-bold ${theme.title}`}>{item.role || 'Rol'}</h3>
                      <span className="text-[10px] font-semibold text-slate-400">{[item.startDate, item.endDate].filter(Boolean).join(' - ')}</span>
                    </div>
                    <p className="text-[12px] font-semibold text-slate-600">{item.company}</p>
                    {item.description && <p className="mt-1 text-[11px] leading-relaxed text-slate-600 whitespace-pre-line">{item.description}</p>}
                  </article>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <SectionTitle theme={theme}>Formacion Academica</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                {education.map((item) => (
                  <article key={item.id} className="print-avoid-break">
                    <h3 className={`text-[12px] font-bold ${theme.title}`}>{item.degree || 'Formacion'}</h3>
                    <p className="text-[11px] font-semibold text-slate-600">{item.institution}</p>
                    <p className="text-[10px] text-slate-400">{[item.startDate, item.endDate].filter(Boolean).join(' - ')}</p>
                    {item.description && <p className="mt-1 text-[10px] leading-relaxed text-slate-600">{item.description}</p>}
                  </article>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section>
              <SectionTitle theme={theme}>Proyectos Destacados</SectionTitle>
              <div className="space-y-2">
                {projects.map((item) => (
                  <article key={item.id} className="print-avoid-break">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className={`text-[12px] font-bold ${theme.title}`}>{item.name}</h3>
                      {item.url && <span className="text-[10px] text-slate-400">{item.url}</span>}
                    </div>
                    {item.role && <p className="text-[11px] font-semibold text-slate-600">{item.role}</p>}
                    {item.description && <p className="mt-1 text-[10px] leading-relaxed text-slate-600">{item.description}</p>}
                  </article>
                ))}
              </div>
            </section>
          )}

          {(skills.length > 0 || languages.length > 0) && (
            <section className="grid grid-cols-2 gap-5 print-avoid-break">
              {skills.length > 0 && (
                <div>
                  <SectionTitle theme={theme}>Habilidades</SectionTitle>
                  <p className="text-[10px] leading-relaxed text-slate-600">
                    {skills.map((skill) => [skill.name, skill.level].filter(Boolean).join(' - ')).join('  ·  ')}
                  </p>
                </div>
              )}
              {languages.length > 0 && (
                <div>
                  <SectionTitle theme={theme}>Idiomas</SectionTitle>
                  <p className="text-[10px] leading-relaxed text-slate-600">
                    {languages.map((language) => [language.name, language.level].filter(Boolean).join(' - ')).join('  ·  ')}
                  </p>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    );
  },
);

CVPrintTemplate.displayName = 'CVPrintTemplate';
