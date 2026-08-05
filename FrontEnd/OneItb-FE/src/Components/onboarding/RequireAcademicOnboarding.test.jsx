import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequireAcademicOnboarding } from './RequireAcademicOnboarding';
import {
  beginMicrosoftRedirectFlow,
  clearMicrosoftRedirectFlow,
} from '../../auth/microsoftRedirectFlow';

const testState = vi.hoisted(() => ({
  auth: {
    auth: { id: 'user-1', role: 'Estudiante' },
    isAuthenticated: true,
    isLoading: false,
    token: 'token',
    sessionVersion: 1,
  },
  profileResult: {
    data: {
      me: {
        id: 'user-1',
        role: 'Estudiante',
        userCareers: [],
      },
    },
    loading: false,
    error: undefined,
  },
}));

vi.mock('../../hooks/useAuth', () => ({
  default: () => testState.auth,
}));

vi.mock('@apollo/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useQuery: () => testState.profileResult,
  };
});

const renderGuard = () => render(
  <MemoryRouter
    initialEntries={['/academic?tab=resources']}
    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
  >
    <Routes>
      <Route element={<RequireAcademicOnboarding />}>
        <Route path="/academic" element={<div>Área privada</div>} />
      </Route>
      <Route
        path="/onboarding/academic"
        element={<div>Configuración académica</div>}
      />
      <Route path="/login" element={<div>Inicio de sesión</div>} />
      <Route
        path="/auth/microsoft/callback"
        element={<div>Retorno institucional</div>}
      />
    </Routes>
  </MemoryRouter>,
);

describe('RequireAcademicOnboarding', () => {
  beforeEach(() => {
    clearMicrosoftRedirectFlow();
    testState.auth = {
      auth: { id: 'user-1', role: 'Estudiante' },
      isAuthenticated: true,
      isLoading: false,
      token: 'token',
      sessionVersion: 1,
    };
    testState.profileResult = {
      data: {
        me: {
          id: 'user-1',
          role: 'Estudiante',
          userCareers: [],
        },
      },
      loading: false,
      error: undefined,
    };
  });

  it('redirects a careerless Student to mandatory setup', () => {
    renderGuard();
    expect(screen.getByText('Configuración académica')).toBeInTheDocument();
  });

  it('allows a Student whose persisted profile has a career', () => {
    testState.profileResult.data.me.userCareers = [{ career: { id: 1 } }];
    renderGuard();
    expect(screen.getByText('Área privada')).toBeInTheDocument();
  });

  it('redirects an over-scoped Student to explicit reconciliation', () => {
    testState.profileResult.data.me.userCareers = [
      { career: { id: 1 } },
      { career: { id: 2 } },
    ];
    renderGuard();
    expect(screen.getByText('Configuración académica')).toBeInTheDocument();
  });

  it.each([
    'Administrador',
    'Moderador',
    'Profesor',
    'Egresado',
    'Empleador',
  ])('does not apply the Student gate to role %s', (role) => {
    testState.auth.auth.role = role;
    testState.profileResult.data.me.role = role;
    renderGuard();
    expect(screen.getByText('Área privada')).toBeInTheDocument();
  });

  it('never trusts a profile belonging to another session', () => {
    testState.profileResult.data.me.id = 'previous-user';
    renderGuard();
    expect(screen.getByText('Configuración académica')).toBeInTheDocument();
  });

  it('redirects anonymous visitors to Login', () => {
    testState.auth = {
      auth: {},
      isAuthenticated: false,
      isLoading: false,
      token: null,
      sessionVersion: 0,
    };
    testState.profileResult = { data: undefined, loading: false, error: undefined };
    renderGuard();
    expect(screen.getByText('Inicio de sesión')).toBeInTheDocument();
  });

  it('preserves an in-flight Microsoft redirect instead of returning to Login', () => {
    beginMicrosoftRedirectFlow('/academic?tab=resources');
    testState.auth = {
      auth: {},
      isAuthenticated: false,
      isLoading: false,
      token: null,
      sessionVersion: 0,
    };
    testState.profileResult = { data: undefined, loading: false, error: undefined };

    renderGuard();

    expect(screen.getByText('Retorno institucional')).toBeInTheDocument();
    expect(screen.queryByText('Inicio de sesión')).not.toBeInTheDocument();
  });
});
