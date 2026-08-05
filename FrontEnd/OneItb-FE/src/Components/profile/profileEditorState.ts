import { CVData } from '../../types/resume';

export type ProfileFormState = {
  biography: string;
  phone: string;
  linkedIn: string;
  facebook: string;
  instagram: string;
  avatarUrl: string;
  isPublicProfile: boolean;
};

export type CvSections = Pick<
  CVData,
  'experience' | 'education' | 'projects' | 'skills' | 'languages'
>;

export type ProfileEditorSnapshot = {
  profileForm: ProfileFormState;
  cvSections: CvSections;
  careerIds: number[];
  persistedAvatarUrl: string;
};

export type ProfileEditorPhase =
  | 'loading'
  | 'ready'
  | 'dirty'
  | 'uploading-avatar'
  | 'saving-profile'
  | 'saved'
  | 'error';

export const emptyProfileForm: ProfileFormState = {
  biography: '',
  phone: '',
  linkedIn: '',
  facebook: '',
  instagram: '',
  avatarUrl: '',
  isPublicProfile: true,
};

export const emptyCvSections: CvSections = {
  experience: [],
  education: [],
  projects: [],
  skills: [],
  languages: [],
};

const normalizeText = (value?: string | null): string => value || '';

const sortByOrder = <T extends { sortOrder?: number },>(items?: T[] | null): T[] =>
  [...(Array.isArray(items) ? items : [])].sort(
    (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0),
  );

export const buildProfileSessionKey = (
  userId?: string | null,
  sessionVersion?: number | string | null,
): string | null => {
  if (!userId) return null;
  return `${String(userId)}:${String(sessionVersion ?? 0)}`;
};

export const getMatchingProfile = <T extends { id?: string | null }>(
  activeUserId: string | null | undefined,
  profile: T | null | undefined,
): T | null => (
  activeUserId
  && profile?.id
  && String(activeUserId) === String(profile.id)
    ? profile
    : null
);

export const createProfileEditorSnapshot = (profile: any): ProfileEditorSnapshot => {
  if (!profile?.id) {
    throw new Error('PROFILE_NOT_READY');
  }

  const careerIds = [...new Set(
    (Array.isArray(profile.userCareers) ? profile.userCareers : [])
      .map((link: any) => Number(link?.career?.id))
      .filter((id: number) => Number.isInteger(id) && id > 0),
  )];

  const avatarUrl = normalizeText(profile.avatarUrl);

  return {
    profileForm: {
      biography: normalizeText(profile.biography),
      phone: normalizeText(profile.phone),
      linkedIn: normalizeText(profile.linkedIn),
      facebook: normalizeText(profile.facebook),
      instagram: normalizeText(profile.instagram),
      avatarUrl,
      isPublicProfile: profile.isPublicProfile !== false,
    },
    careerIds,
    persistedAvatarUrl: avatarUrl,
    cvSections: {
      experience: sortByOrder(profile.cvExperiences).map((item: any) => ({
        id: item.id,
        company: normalizeText(item.company),
        role: normalizeText(item.role),
        startDate: normalizeText(item.startDate),
        endDate: normalizeText(item.endDate),
        location: normalizeText(item.location),
        description: normalizeText(item.description),
        hidden: Boolean(item.hidden),
      })),
      education: sortByOrder(profile.cvEducations).map((item: any) => ({
        id: item.id,
        institution: normalizeText(item.institution),
        degree: normalizeText(item.degree),
        startDate: normalizeText(item.startDate),
        endDate: normalizeText(item.endDate),
        location: normalizeText(item.location),
        description: normalizeText(item.description),
        hidden: Boolean(item.hidden),
      })),
      projects: sortByOrder(profile.cvProjects).map((item: any) => ({
        id: item.id,
        name: normalizeText(item.name),
        role: normalizeText(item.role),
        startDate: normalizeText(item.startDate),
        endDate: normalizeText(item.endDate),
        url: normalizeText(item.url),
        description: normalizeText(item.description),
        hidden: Boolean(item.hidden),
      })),
      skills: sortByOrder(profile.cvSkills).map((item: any) => ({
        id: item.id,
        name: normalizeText(item.name),
        level: normalizeText(item.level),
        hidden: Boolean(item.hidden),
      })),
      languages: sortByOrder(profile.cvLanguages).map((item: any) => ({
        id: item.id,
        name: normalizeText(item.name),
        level: normalizeText(item.level),
        hidden: Boolean(item.hidden),
      })),
    },
  };
};
