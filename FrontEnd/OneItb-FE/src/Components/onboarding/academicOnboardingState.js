export const ACADEMIC_ONBOARDING_PATH = '/onboarding/academic';
export const DEFAULT_AUTHENTICATED_PATH = '/feed';
export const STUDENT_ROLE = 'Estudiante';

export const extractCareerIds = (profile) => {
  const links = Array.isArray(profile?.userCareers)
    ? profile.userCareers
    : [];

  return [...new Set(
    links
      .map((link) => Number(link?.career?.id))
      .filter((id) => Number.isInteger(id) && id > 0),
  )];
};

export const normalizeCareerSelection = (values) => (
  [...new Set(
    (Array.isArray(values) ? values : [])
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0),
  )]
);

export const normalizeActiveCareers = (values) => {
  const seen = new Set();
  return (Array.isArray(values) ? values : [])
    .filter((career) => career?.isActive)
    .map((career) => ({ ...career, id: Number(career.id) }))
    .filter((career) => {
      if (!Number.isInteger(career.id) || career.id <= 0 || seen.has(career.id)) {
        return false;
      }
      seen.add(career.id);
      return true;
    })
    .sort((left, right) => (
      String(left.name || '').localeCompare(String(right.name || ''), 'es')
    ));
};

export const isCurrentSessionProfile = (auth, profile) => Boolean(
  auth?.id
  && profile?.id
  && String(auth.id) === String(profile.id),
);

export const requiresAcademicOnboarding = (auth, profile) => (
  isCurrentSessionProfile(auth, profile)
  && profile.role === STUDENT_ROLE
  && extractCareerIds(profile).length === 0
);

export const sanitizeOnboardingDestination = (value) => {
  if (
    typeof value !== 'string'
    || !value.startsWith('/')
    || value.startsWith('//')
    || value.startsWith('/\\')
  ) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  const normalizedPath = value.toLowerCase().split(/[?#]/, 1)[0];
  if (
    normalizedPath === ACADEMIC_ONBOARDING_PATH
    || normalizedPath === '/login'
    || normalizedPath === '/register'
    || normalizedPath === '/logout'
  ) {
    return DEFAULT_AUTHENTICATED_PATH;
  }

  return value;
};

export const getGraphQLErrorMessage = (
  error,
  fallback = 'No se pudo completar la operación.',
) => (
  error?.graphQLErrors?.map((item) => item.message).filter(Boolean).join(' ')
  || error?.networkError?.result?.errors
    ?.map((item) => item.message)
    .filter(Boolean)
    .join(' ')
  || error?.message
  || fallback
);
