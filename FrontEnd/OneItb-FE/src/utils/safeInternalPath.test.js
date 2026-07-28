import { describe, expect, it } from 'vitest';
import { getSafeInternalPath } from './safeInternalPath';

describe('getSafeInternalPath', () => {
  it('preserves valid application routes', () => {
    expect(getSafeInternalPath('/feed?inquiryId=123#comment-9')).toBe(
      '/feed?inquiryId=123#comment-9',
    );
  });

  it.each([
    'https://attacker.example/path',
    '//attacker.example/path',
    '/\\attacker.example/path',
    '/%5cattacker.example/path',
    'javascript:alert(1)',
  ])('rejects an unsafe navigation target: %s', (target) => {
    expect(getSafeInternalPath(target)).toBeNull();
  });

  it('uses the explicit fallback for missing values', () => {
    expect(getSafeInternalPath(undefined, '/feed')).toBe('/feed');
  });
});
