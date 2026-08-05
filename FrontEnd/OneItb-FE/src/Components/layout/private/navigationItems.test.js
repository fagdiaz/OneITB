import { describe, expect, it } from 'vitest';
import {
  buildNavigationItems,
  formatNavigationBadge,
  isNavigationItemActive,
} from './navigationItems';

describe('navigationItems', () => {
  it('exposes only the permitted stable sequence for each role', () => {
    expect(buildNavigationItems({ role: 'Estudiante' }).map((item) => item.id))
      .toEqual(['messages', 'academic', 'jobs']);
    expect(buildNavigationItems({ role: 'Empleador' }).map((item) => item.id))
      .toEqual(['messages', 'academic', 'jobs', 'applications']);
    expect(buildNavigationItems({ role: 'Administrador' }).map((item) => item.id))
      .toEqual(['messages', 'academic', 'jobs', 'applications', 'admin']);
  });

  it('does not mark the jobs root active while managing applications', () => {
    const jobs = buildNavigationItems({ role: 'Empleador' }).find((item) => item.id === 'jobs');
    const applications = buildNavigationItems({ role: 'Empleador' }).find((item) => item.id === 'applications');
    expect(isNavigationItemActive(jobs, '/empleos/mis-ofertas')).toBe(false);
    expect(isNavigationItemActive(applications, '/empleos/mis-ofertas/1')).toBe(true);
  });

  it('bounds visible badge labels', () => {
    expect(formatNavigationBadge(0)).toBeNull();
    expect(formatNavigationBadge(3)).toBe('3');
    expect(formatNavigationBadge(14)).toBe('9+');
  });
});
