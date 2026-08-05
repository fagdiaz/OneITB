import { describe, expect, it } from 'vitest';
import {
  hasCareerSelectionChanged,
  selectCareerForRole,
  validateCareerSelectionForRole,
} from './profileCareerSelection';

describe('CvEditorProfile career policy', () => {
  it('replaces the current selection for a Student', () => {
    expect(selectCareerForRole('Estudiante', [1], 2)).toEqual([2]);
    expect(selectCareerForRole('Estudiante', [1, 3], 2)).toEqual([2]);
  });

  it('rejects zero or multiple careers for a Student', () => {
    expect(validateCareerSelectionForRole('Estudiante', [])).toContain('exactamente una');
    expect(validateCareerSelectionForRole('Estudiante', [1, 2])).toContain('exactamente una');
    expect(validateCareerSelectionForRole('Estudiante', [2])).toBe('');
  });

  it('preserves multi-selection behavior for non-Student roles', () => {
    expect(selectCareerForRole('Profesor', [1], 2)).toEqual([1, 2]);
    expect(selectCareerForRole('Profesor', [1, 2], 1)).toEqual([2]);
    expect(validateCareerSelectionForRole('Profesor', [1, 2])).toBe('');
  });

  it('detects a career replacement independently from input ordering', () => {
    expect(hasCareerSelectionChanged([1], [2])).toBe(true);
    expect(hasCareerSelectionChanged([2, 1], [1, 2])).toBe(false);
  });
});
