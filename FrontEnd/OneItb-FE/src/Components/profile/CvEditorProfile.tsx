import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import useAuth from '../../hooks/useAuth';
import { UPDATE_PROFILE } from '../../data/graphql/mutations/updateProfile';
import { GET_USER_PROFILE } from '../../data/graphql/queries/getUserProfile';
import { CVData } from '../../types/resume';
import { Button } from '../ui/Button';
import { ExperienceForm } from '../editor/ExperienceForm';
import { EducationForm } from '../editor/EducationForm';
import { ProjectsForm } from '../editor/ProjectsForm';
import { SkillsLanguagesForm } from '../editor/SkillsLanguagesForm';
import { ResumePreview } from '../resume/ResumePreview';

type AccentTheme = 'graphite' | 'deepTeal' | 'navyInk' | 'mutedOlive';

type ProfileFormState = {
  biography: string;
  phone: string;
  linkedIn: string;
  facebook: string;
  instagram: string;
};

type CvSections = Pick<CVData, 'experience' | 'education' | 'projects' | 'skills' | 'languages'>;

const emptyProfileForm: ProfileFormState = {
  biography: '',
  phone: '',
  linkedIn: '',
  facebook: '',
  instagram: '',
};

const emptyCvSections: CvSections = {
  experience: [],
  education: [],
  projects: [],
  skills: [],
  languages: [],
};

const sortByOrder = <T extends { sortOrder?: number },>(items?: T[] | null): T[] =>
  [...(Array.isArray(items) ? items : [])].sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0));

const normalizeText = (value?: string | null): string => value || '';

const normalizeCvSections = (profile?: any): CvSections => ({
  experience: sortByOrder(profile?.cvExperiences).map((item) => ({
    id: item.id,
    company: normalizeText(item.company),
    role: normalizeText(item.role),
    startDate: normalizeText(item.startDate),
    endDate: normalizeText(item.endDate),
    location: normalizeText(item.location),
    description: normalizeText(item.description),
    hidden: Boolean(item.hidden),
  })),
  education: sortByOrder(profile?.cvEducations).map((item) => ({
    id: item.id,
    institution: normalizeText(item.institution),
    degree: normalizeText(item.degree),
    startDate: normalizeText(item.startDate),
    endDate: normalizeText(item.endDate),
    location: normalizeText(item.location),
    description: normalizeText(item.description),
    hidden: Boolean(item.hidden),
  })),
  projects: sortByOrder(profile?.cvProjects).map((item) => ({
    id: item.id,
    name: normalizeText(item.name),
    role: normalizeText(item.role),
    startDate: normalizeText(item.startDate),
    endDate: normalizeText(item.endDate),
    url: normalizeText(item.url),
    description: normalizeText(item.description),
    hidden: Boolean(item.hidden),
  })),
  skills: sortByOrder(profile?.cvSkills).map((item) => ({
    id: item.id,
    name: normalizeText(item.name),
    level: normalizeText(item.level),
    hidden: Boolean(item.hidden),
  })),
  languages: sortByOrder(profile?.cvLanguages).map((item) => ({
    id: item.id,
    name: normalizeText(item.name),
    level: normalizeText(item.level),
    hidden: Boolean(item.hidden),
  })),
});

const hasAnyValue = (values: Array<string | undefined>): boolean =>
  values.some((value) => Boolean(value?.trim()));

const buildCvInput = (sections: CvSections) => ({
  cvExperiences: sections.experience
    .filter((item) => hasAnyValue([item.company, item.role, item.startDate, item.endDate, item.location, item.description]))
    .map((item) => ({
      company: item.company,
      role: item.role,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      description: item.description,
      hidden: Boolean(item.hidden),
    })),
  cvEducations: sections.education
    .filter((item) => hasAnyValue([item.institution, item.degree, item.startDate, item.endDate, item.location, item.description]))
    .map((item) => ({
      institution: item.institution,
      degree: item.degree,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      description: item.description,
      hidden: Boolean(item.hidden),
    })),
  cvProjects: sections.projects
    .filter((item) => hasAnyValue([item.name, item.role, item.startDate, item.endDate, item.url, item.description]))
    .map((item) => ({
      name: item.name,
      role: item.role,
      startDate: item.startDate,
      endDate: item.endDate,
      url: item.url,
      description: item.description,
      hidden: Boolean(item.hidden),
    })),
  cvSkills: sections.skills
    .filter((item) => hasAnyValue([item.name, item.level]))
    .map((item) => ({
      name: item.name,
      level: item.level,
      hidden: Boolean(item.hidden),
    })),
  cvLanguages: sections.languages
    .filter((item) => hasAnyValue([item.name, item.level]))
    .map((item) => ({
      name: item.name,
      level: item.level,
      hidden: Boolean(item.hidden),
    })),
});

export const CvEditorProfile = () => {
  const { auth } = useAuth();
  const [cvSections, setCvSections] = useState<CvSections>(emptyCvSections);
  const [activeTheme, setActiveTheme] = useState<AccentTheme>('graphite');
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  const { data: gqlData, loading: profileLoading } = useQuery(GET_USER_PROFILE, {
    fetchPolicy: 'network-only',
    skip: !auth?.id,
  });
  const [updateProfile, { loading: savingProfile }] = useMutation(UPDATE_PROFILE);

  useEffect(() => {
    const activeUser = gqlData?.me || auth;
    if (!activeUser) return;

    setProfileForm({
      biography: activeUser.biography || '',
      phone: activeUser.phone || '',
      linkedIn: activeUser.linkedIn || '',
      facebook: activeUser.facebook || '',
      instagram: activeUser.instagram || '',
    });
    setCvSections(normalizeCvSections(activeUser));
  }, [auth, gqlData]);

  const handleProfileChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setSaveStatus('idle');
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    const userId = gqlData?.me?.id || auth?.id;
    if (!userId) {
      setSaveStatus('error');
      return;
    }

    try {
      const response = await updateProfile({
        variables: {
          input: {
            id: userId,
            biography: profileForm.biography,
            phone: profileForm.phone,
            linkedIn: profileForm.linkedIn,
            facebook: profileForm.facebook,
            instagram: profileForm.instagram,
            ...buildCvInput(cvSections),
          },
        },
        refetchQueries: [{ query: GET_USER_PROFILE }],
      });

      setSaveStatus(response.data?.updateProfile?.success ? 'saved' : 'error');
    } catch {
      setSaveStatus('error');
    }
  };

  const displayName = gqlData?.me?.fullName || auth?.fullName || auth?.username || 'Usuario OneITB';
  const displayRole = gqlData?.me?.role || auth?.role || 'Perfil academico';
  const displayEmail = gqlData?.me?.email || auth?.email || 'usuario@itbeltran.com.ar';

  const previewData: CVData = {
    personalInfo: {
      name: displayName,
      title: displayRole,
      email: displayEmail,
      phone: profileForm.phone,
      location: 'Buenos Aires, Argentina',
      linkedin: profileForm.linkedIn,
      github: '',
      website: '',
      profileImage: avatarPreview || undefined,
    },
    summary: profileForm.biography,
    ...cvSections,
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <main className="grid h-[calc(100vh-56px)] flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
        <section className="no-print space-y-6 overflow-y-auto p-4 md:p-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h1 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Edicion del Curriculum
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Perfil y CV extendido guardados como una unica estructura institucional.
              </p>
            </div>
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

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-900 text-white shadow-sm">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Vista previa del avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900">{displayName}</p>
                  <p className="text-sm text-slate-500">{displayRole}</p>
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-700">
                    <i className="fa-solid fa-camera" />
                    Vista previa de avatar
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                  <p className="mt-1 text-[11px] text-slate-400">
                    La imagen es solo vista previa local hasta incorporar persistencia de avatar.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleSaveProfile}
                disabled={savingProfile || profileLoading}
                className="!bg-blue-700 !text-white hover:!bg-blue-800 disabled:!cursor-not-allowed disabled:!opacity-60"
              >
                {savingProfile ? 'Guardando...' : 'Guardar perfil y CV'}
              </Button>
            </div>

            {saveStatus === 'saved' && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                Perfil y CV actualizados correctamente.
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                No se pudo guardar el perfil. Revisa tu sesion e intentalo nuevamente.
              </div>
            )}

            <div className="mt-5 grid gap-4">
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Biografia profesional
                </span>
                <textarea
                  name="biography"
                  value={profileForm.biography}
                  onChange={handleProfileChange}
                  rows={4}
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Describe tu perfil academico, experiencia y objetivos."
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Telefono</span>
                  <input
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="+54 9 11 1234-5678"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">LinkedIn</span>
                  <input
                    name="linkedIn"
                    value={profileForm.linkedIn}
                    onChange={handleProfileChange}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="https://linkedin.com/in/usuario"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Instagram</span>
                  <input
                    name="instagram"
                    value={profileForm.instagram}
                    onChange={handleProfileChange}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="https://instagram.com/usuario"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Facebook</span>
                  <input
                    name="facebook"
                    value={profileForm.facebook}
                    onChange={handleProfileChange}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="https://facebook.com/usuario"
                  />
                </label>
              </div>
            </div>
          </section>

          <ExperienceForm
            experience={cvSections.experience}
            onChangeExperience={(experience) => setCvSections((current) => ({ ...current, experience }))}
          />
          <EducationForm
            education={cvSections.education}
            onChangeEducation={(education) => setCvSections((current) => ({ ...current, education }))}
          />
          <ProjectsForm
            projects={cvSections.projects}
            onChangeProjects={(projects) => setCvSections((current) => ({ ...current, projects }))}
          />
          <SkillsLanguagesForm
            skills={cvSections.skills}
            onChangeSkills={(skills) => setCvSections((current) => ({ ...current, skills }))}
            languages={cvSections.languages}
            onChangeLanguages={(languages) => setCvSections((current) => ({ ...current, languages }))}
          />
        </section>

        <section className="overflow-y-auto border-t border-slate-200 bg-slate-200/50 lg:border-l lg:border-t-0">
          <ResumePreview ref={resumeRef} data={previewData} activeTheme={activeTheme} />
        </section>
      </main>
    </div>
  );
};
