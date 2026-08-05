import { GET_USER_PROFILE } from '../../data/graphql/queries/getUserProfile';

export const ACADEMIC_SCOPE_ROOT_FIELDS = Object.freeze([
  'me',
  'myCareers',
  'subjects',
  'inquiriesPage',
  'academicResources',
  'resourcesBySubject',
  'myAcademicProgress',
  'academicProgressForUser',
  'academicStudents',
]);

export const synchronizeAcademicEnrollmentCache = (apolloClient, profileData) => {
  if (!apolloClient?.cache) {
    throw new Error('APOLLO_CACHE_NOT_AVAILABLE');
  }
  if (!profileData?.me) {
    throw new Error('AUTHORITATIVE_PROFILE_NOT_AVAILABLE');
  }

  ACADEMIC_SCOPE_ROOT_FIELDS.forEach((fieldName) => {
    apolloClient.cache.evict({
      id: 'ROOT_QUERY',
      fieldName,
      broadcast: false,
    });
  });
  apolloClient.cache.gc();
  apolloClient.cache.writeQuery({
    query: GET_USER_PROFILE,
    data: profileData,
  });
};
