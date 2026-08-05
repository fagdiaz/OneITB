import { describe, expect, it, vi } from 'vitest';
import {
  ACADEMIC_SCOPE_ROOT_FIELDS,
  synchronizeAcademicEnrollmentCache,
} from './academicEnrollmentCache';

describe('synchronizeAcademicEnrollmentCache', () => {
  it('evicts identity-dependent fields and restores authoritative profile data', () => {
    const cache = {
      evict: vi.fn(),
      gc: vi.fn(),
      writeQuery: vi.fn(),
    };
    const profileData = { me: { id: 'student-1', userCareers: [] } };

    synchronizeAcademicEnrollmentCache({ cache }, profileData);

    expect(cache.evict.mock.calls.map(([argument]) => argument.fieldName))
      .toEqual(ACADEMIC_SCOPE_ROOT_FIELDS);
    expect(cache.gc).toHaveBeenCalledTimes(1);
    expect(cache.writeQuery).toHaveBeenCalledWith(expect.objectContaining({
      data: profileData,
    }));
  });

  it('fails explicitly when invoked without an Apollo cache', () => {
    expect(() => synchronizeAcademicEnrollmentCache(null, {}))
      .toThrow('APOLLO_CACHE_NOT_AVAILABLE');
  });

  it('fails closed when no server-confirmed profile is available', () => {
    const cache = { evict: vi.fn(), gc: vi.fn(), writeQuery: vi.fn() };

    expect(() => synchronizeAcademicEnrollmentCache({ cache }, {}))
      .toThrow('AUTHORITATIVE_PROFILE_NOT_AVAILABLE');
    expect(cache.evict).not.toHaveBeenCalled();
  });
});
