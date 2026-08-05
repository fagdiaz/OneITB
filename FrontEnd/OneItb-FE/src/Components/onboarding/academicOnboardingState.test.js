import { describe, expect, it } from 'vitest';
import {
  DEFAULT_AUTHENTICATED_PATH,
  extractCareerIds,
  getGraphQLErrorMessage,
  isAcademicOnboardingSchemaMismatch,
  normalizeActiveCareers,
  normalizeCareerSelection,
  requiresAcademicOnboarding,
  sanitizeOnboardingDestination,
} from './academicOnboardingState';

const auth = { id: 'user-1', role: 'Estudiante' };

describe('academic onboarding helpers', () => {
  it('requires onboarding only for the current Student without careers', () => {
    expect(requiresAcademicOnboarding(auth, {
      id: 'user-1',
      role: 'Estudiante',
      userCareers: [],
    })).toBe(true);

    expect(requiresAcademicOnboarding(auth, {
      id: 'user-1',
      role: 'Estudiante',
      userCareers: [{ career: { id: 1 } }],
    })).toBe(false);

    expect(requiresAcademicOnboarding(auth, {
      id: 'another-user',
      role: 'Estudiante',
      userCareers: [],
    })).toBe(false);
  });

  it('normalizes active careers and selected IDs without duplicates', () => {
    expect(normalizeActiveCareers([
      { id: '2', name: 'Radiología', isActive: true },
      { id: 1, name: 'Análisis de Sistemas', isActive: true },
      { id: 1, name: 'Duplicada', isActive: true },
      { id: 3, name: 'Inactiva', isActive: false },
    ])).toEqual([
      { id: 1, name: 'Análisis de Sistemas', isActive: true },
      { id: 2, name: 'Radiología', isActive: true },
    ]);

    expect(normalizeCareerSelection(['2', 2, 1, 0, 'invalid'])).toEqual([2, 1]);
    expect(extractCareerIds({
      userCareers: [
        { career: { id: '2' } },
        { career: { id: 2 } },
        { career: { id: 1 } },
      ],
    })).toEqual([2, 1]);
  });

  it('restores only safe internal destinations', () => {
    expect(sanitizeOnboardingDestination('/academic?tab=resources')).toBe(
      '/academic?tab=resources',
    );
    expect(sanitizeOnboardingDestination('https://evil.example')).toBe(
      DEFAULT_AUTHENTICATED_PATH,
    );
    expect(sanitizeOnboardingDestination('//evil.example')).toBe(
      DEFAULT_AUTHENTICATED_PATH,
    );
    expect(sanitizeOnboardingDestination('/onboarding/academic')).toBe(
      DEFAULT_AUTHENTICATED_PATH,
    );
    expect(sanitizeOnboardingDestination('/logout')).toBe(
      DEFAULT_AUTHENTICATED_PATH,
    );
  });

  it('maps an incompatible onboarding schema to a controlled recovery message', () => {
    const error = {
      graphQLErrors: [{
        message: 'The field `confirmStudentCareer` does not exist on the type `Mutation`. The following variables were not used: careerId.',
        extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
      }],
    };

    expect(isAcademicOnboardingSchemaMismatch(error)).toBe(true);
    expect(getGraphQLErrorMessage(error)).toBe(
      'El servicio académico local está desactualizado. Reiniciá la API y reintentá la operación.',
    );
  });

  it('does not hide unrelated business errors', () => {
    const error = {
      graphQLErrors: [{
        message: 'La carrera seleccionada no está activa.',
        extensions: { code: 'STUDENT_CAREER_INACTIVE' },
      }],
    };

    expect(isAcademicOnboardingSchemaMismatch(error)).toBe(false);
    expect(getGraphQLErrorMessage(error)).toBe('La carrera seleccionada no está activa.');
  });
});
