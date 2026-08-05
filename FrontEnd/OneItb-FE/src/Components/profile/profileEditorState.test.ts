import { describe, expect, it } from 'vitest';
import {
  buildProfileSessionKey,
  createProfileEditorSnapshot,
  getMatchingProfile,
} from './profileEditorState';

const profile = {
  id: 'user-1',
  biography: 'Perfil completo',
  phone: '1122334455',
  avatarUrl: '/uploads/avatar.jpg',
  isPublicProfile: false,
  userCareers: [
    { career: { id: 2 } },
    { career: { id: 2 } },
    { career: { id: 1 } },
  ],
  cvExperiences: [
    { id: 2, company: 'B', role: 'Dev', sortOrder: 2 },
    { id: 1, company: 'A', role: 'QA', sortOrder: 1 },
  ],
};

describe('profileEditorState', () => {
  it('matches only the complete profile owned by the active session', () => {
    expect(getMatchingProfile('user-1', profile)).toBe(profile);
    expect(getMatchingProfile('user-2', profile)).toBeNull();
    expect(getMatchingProfile('user-1', undefined)).toBeNull();
  });

  it('builds a stable session key without using profile fields', () => {
    expect(buildProfileSessionKey('user-1', 4)).toBe('user-1:4');
    expect(buildProfileSessionKey(undefined, 4)).toBeNull();
  });

  it('normalizes one complete snapshot and preserves the persisted avatar', () => {
    const snapshot = createProfileEditorSnapshot(profile);

    expect(snapshot.profileForm.biography).toBe('Perfil completo');
    expect(snapshot.profileForm.isPublicProfile).toBe(false);
    expect(snapshot.persistedAvatarUrl).toBe('/uploads/avatar.jpg');
    expect(snapshot.careerIds).toEqual([2, 1]);
    expect(snapshot.cvSections.experience.map((item) => item.company)).toEqual(['A', 'B']);
  });

  it('rejects provisional data without a canonical profile id', () => {
    expect(() => createProfileEditorSnapshot({ biography: 'Parcial' })).toThrow(
      'PROFILE_NOT_READY',
    );
  });
});
