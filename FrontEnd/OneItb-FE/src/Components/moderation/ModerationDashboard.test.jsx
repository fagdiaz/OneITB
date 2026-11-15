import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModerationDashboard } from './ModerationDashboard';

let authRole = 'Estudiante';

vi.mock('../../hooks/useAuth', () => ({
  default: () => ({
    auth: { id: 'test-user', role: authRole },
    isAuthenticated: true,
  }),
}));

vi.mock('../admin/ModerationManagement', () => ({
  ModerationManagement: () => <div data-testid="moderation-reports-view">Cola de reportes</div>,
}));

vi.mock('../admin/ModerationAuditManagement', () => ({
  ModerationAuditManagement: () => <div data-testid="moderation-audit-view">Historial de auditoría</div>,
}));

describe('ModerationDashboard Role Protection and Tab Navigation', () => {
  beforeEach(() => {
    authRole = 'Estudiante';
  });

  it('denies access to unauthorized roles with accessible error banner', () => {
    authRole = 'Estudiante';
    render(<ModerationDashboard />);
    expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Panel de Moderación' })).toBeNull();
  });

  it('permits access to Moderador and defaults to community reports tab', () => {
    authRole = 'Moderador';
    render(<ModerationDashboard />);
    expect(screen.getByRole('heading', { name: 'Panel de Moderación' })).toBeInTheDocument();
    expect(screen.getByTestId('moderation-reports-view')).toBeInTheDocument();
  });

  it('permits access to Administrador and allows toggling to audit tab', () => {
    authRole = 'Administrador';
    render(<ModerationDashboard />);
    expect(screen.getByRole('heading', { name: 'Panel de Moderación' })).toBeInTheDocument();

    const auditTabBtn = screen.getByRole('button', { name: /Auditoria de Moderacion/i });
    fireEvent.click(auditTabBtn);

    expect(screen.getByTestId('moderation-audit-view')).toBeInTheDocument();
    expect(screen.queryByTestId('moderation-reports-view')).toBeNull();
  });
});
