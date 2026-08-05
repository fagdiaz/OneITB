import React from 'react';
import { CVData } from '../../types/resume';

export type CvAccentTheme = 'graphite' | 'deepTeal' | 'navyInk' | 'mutedOlive';

interface CVATSPrintTemplateProps {
  data: CVData;
  activeTheme?: CvAccentTheme;
  className?: string;
}

const THEME_CLASSES: Record<CvAccentTheme, { heading: string; rule: string }> = {
  graphite: { heading: 'text-slate-800', rule: 'border-slate-400' },
  deepTeal: { heading: 'text-teal-900', rule: 'border-teal-700' },
  navyInk: { heading: 'text-blue-950', rule: 'border-blue-900' },
  mutedOlive: { heading: 'text-emerald-950', rule: 'border-emerald-800' },
};

const text = (value?: string | null): string => value?.trim() ?? '';

const visible = <T extends { hidden?: boolean }>(items: T[] = []): T[] =>
  items.filter((item) => !item.hidden);

const hasAnyText = (values: Array<string | undefined | null>): boolean =>
  values.some((value) => Boolean(text(value)));

const normalizeWebUrl = (value?: string | null): string | null => {
  const raw = text(value);
  if (!raw) return null;

  try {
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, '')}`;
    const parsed = new URL(candidate);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
};

const dateRange = (start?: string, end?: string): string =>
  [text(start), text(end)].filter(Boolean).join(' - ');

const Section = ({
  id,
  title,
  theme,
  children,
}: {
  id: string;
  title: string;
  theme: { heading: string; rule: string };
  children: React.ReactNode;
}) => (
  <section className="cv-ats-section" data-ats-section={id} aria-labelledby={`cv-ats-${id}`}>
    <h2
      id={`cv-ats-${id}`}
      className={`cv-ats-heading border-b pb-1 text-sm font-bold uppercase tracking-[0.12em] ${theme.heading} ${theme.rule}`}
    >
      {title}
    </h2>
    <div className="mt-2">{children}</div>
  </section>
);

const ContactLink = ({ label, value, href }: { label: string; value: string; href?: string | null }) => (
  <li className="cv-ats-contact-item">
    <strong>{label}:</strong>{' '}
    {href ? (
      <a href={href} className="cv-ats-link underline decoration-slate-400 underline-offset-2">
        {value}
      </a>
    ) : (
      <span>{value}</span>
    )}
  </li>
);

export const CVATSPrintTemplate = React.forwardRef<HTMLElement, CVATSPrintTemplateProps>(
  ({ data, activeTheme = 'graphite', className = '' }, ref) => {
    const theme = THEME_CLASSES[activeTheme];
    const { personalInfo } = data;
    const experience = visible(data.experience).filter((item) =>
      hasAnyText([item.role, item.company, item.description]),
    );
    const projects = visible(data.projects).filter((item) =>
      hasAnyText([item.name, item.role, item.description, item.url]),
    );
    const education = visible(data.education).filter((item) =>
      hasAnyText([item.degree, item.institution, item.description]),
    );
    const skills = visible(data.skills).filter((item) => hasAnyText([item.name, item.level]));
    const languages = visible(data.languages).filter((item) => hasAnyText([item.name, item.level]));
    const email = text(personalInfo.email);
    const emailHref = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : null;
    const phone = text(personalInfo.phone);
    const normalizedPhone = phone.replace(/[^+\d]/g, '');
    const phoneHref = /\d/.test(normalizedPhone) ? `tel:${normalizedPhone}` : null;
    const linkedIn = text(personalInfo.linkedin);
    const github = text(personalInfo.github);
    const website = text(personalInfo.website);
    const career = text(personalInfo.location);
    const hasContact = hasAnyText([email, phone, linkedIn, github, website, career]);

    return (
      <article
        ref={ref}
        role="document"
        lang="es"
        aria-label="Currículum optimizado para ATS"
        data-testid="cv-ats-document"
        data-ats-theme={activeTheme}
        className={`cv-ats-document mx-auto w-full max-w-[210mm] bg-slate-50 px-[10mm] py-[11mm] text-left text-[11pt] leading-[1.45] text-slate-900 shadow-xl ring-1 ring-slate-200 ${className}`.trim()}
      >
        <header className="cv-ats-header border-b-2 border-slate-700 pb-3">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            {text(personalInfo.name) || 'Usuario OneITB'}
          </h1>
          {text(personalInfo.title) && (
            <p className="mt-1 text-base font-semibold text-slate-700">{text(personalInfo.title)}</p>
          )}
        </header>

        <div className="mt-4 space-y-5">
          {hasContact && (
            <Section id="contact" title="Contacto" theme={theme}>
              <ul className="list-none space-y-1 p-0">
                {email && <ContactLink label="Correo electrónico" value={email} href={emailHref} />}
                {phone && <ContactLink label="Teléfono" value={phone} href={phoneHref} />}
                {career && <ContactLink label="Carrera" value={career} />}
                {linkedIn && <ContactLink label="LinkedIn" value={linkedIn} href={normalizeWebUrl(linkedIn)} />}
                {github && <ContactLink label="GitHub" value={github} href={normalizeWebUrl(github)} />}
                {website && <ContactLink label="Sitio web" value={website} href={normalizeWebUrl(website)} />}
              </ul>
            </Section>
          )}

          {text(data.summary) && (
            <Section id="summary" title="Perfil profesional" theme={theme}>
              <p className="whitespace-pre-line">{text(data.summary)}</p>
            </Section>
          )}

          {skills.length > 0 && (
            <Section id="skills" title="Habilidades" theme={theme}>
              <ul className="list-disc space-y-1 pl-5">
                {skills.map((item) => (
                  <li key={item.id} className="cv-ats-entry">
                    <strong>{text(item.name)}</strong>
                    {text(item.level) ? ` - ${text(item.level)}` : ''}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {experience.length > 0 && (
            <Section id="experience" title="Experiencia laboral" theme={theme}>
              <div className="space-y-3">
                {experience.map((item) => (
                  <article key={item.id} className="cv-ats-entry">
                    <h3 className="font-bold text-slate-950">{text(item.role) || 'Rol profesional'}</h3>
                    {text(item.company) && <p className="font-semibold">{text(item.company)}</p>}
                    {dateRange(item.startDate, item.endDate) && <p>{dateRange(item.startDate, item.endDate)}</p>}
                    {text(item.location) && <p>{text(item.location)}</p>}
                    {text(item.description) && <p className="mt-1 whitespace-pre-line">{text(item.description)}</p>}
                  </article>
                ))}
              </div>
            </Section>
          )}

          {projects.length > 0 && (
            <Section id="projects" title="Proyectos" theme={theme}>
              <div className="space-y-3">
                {projects.map((item) => {
                  const projectUrl = normalizeWebUrl(item.url);
                  return (
                    <article key={item.id} className="cv-ats-entry">
                      <h3 className="font-bold text-slate-950">{text(item.name) || 'Proyecto'}</h3>
                      {text(item.role) && <p className="font-semibold">{text(item.role)}</p>}
                      {dateRange(item.startDate, item.endDate) && <p>{dateRange(item.startDate, item.endDate)}</p>}
                      {text(item.description) && <p className="mt-1 whitespace-pre-line">{text(item.description)}</p>}
                      {text(item.url) && (
                        <p className="mt-1">
                          {projectUrl ? <a className="cv-ats-link underline" href={projectUrl}>{text(item.url)}</a> : text(item.url)}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </Section>
          )}

          {education.length > 0 && (
            <Section id="education" title="Formación académica" theme={theme}>
              <div className="space-y-3">
                {education.map((item) => (
                  <article key={item.id} className="cv-ats-entry">
                    <h3 className="font-bold text-slate-950">{text(item.degree) || 'Formación'}</h3>
                    {text(item.institution) && <p className="font-semibold">{text(item.institution)}</p>}
                    {dateRange(item.startDate, item.endDate) && <p>{dateRange(item.startDate, item.endDate)}</p>}
                    {text(item.location) && <p>{text(item.location)}</p>}
                    {text(item.description) && <p className="mt-1 whitespace-pre-line">{text(item.description)}</p>}
                  </article>
                ))}
              </div>
            </Section>
          )}

          {languages.length > 0 && (
            <Section id="languages" title="Idiomas" theme={theme}>
              <ul className="list-disc space-y-1 pl-5">
                {languages.map((item) => (
                  <li key={item.id} className="cv-ats-entry">
                    <strong>{text(item.name)}</strong>
                    {text(item.level) ? ` - ${text(item.level)}` : ''}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </article>
    );
  },
);

CVATSPrintTemplate.displayName = 'CVATSPrintTemplate';
