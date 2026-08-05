import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Login } from './Login';

const state = vi.hoisted(() => ({
  microsoftAvailable: false,
  session: {
    auth: {},
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    token: null,
  },
}));

vi.mock('../../auth/microsoftEntra', () => ({
  isMicrosoftIdentityAvailable: () => state.microsoftAvailable,
}));

vi.mock('../auth/MicrosoftInstitutionalLogin', () => ({
  MicrosoftInstitutionalLogin: () => (
    <button type="button">Continuar con Microsoft 365</button>
  ),
}));

vi.mock('../../hooks/useAuth', () => ({
  default: () => state.session,
}));

vi.mock('../../hooks/useForm', () => ({
  useForm: () => ({ form: {}, changed: vi.fn() }),
}));

vi.mock('@apollo/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useMutation: () => [vi.fn(), { loading: false, error: undefined }],
  };
});

describe('Login Microsoft visibility', () => {
  beforeEach(() => {
    state.microsoftAvailable = false;
    state.session = {
      auth: {},
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      token: null,
    };
    sessionStorage.clear();
  });

  it('hides Microsoft access when the shared configuration is unavailable', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Login />
      </MemoryRouter>,
    );
    expect(
      screen.queryByRole('button', { name: 'Continuar con Microsoft 365' }),
    ).not.toBeInTheDocument();
  });

  it('shows Microsoft access when the shared provider is available', () => {
    state.microsoftAvailable = true;
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Login />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole('button', { name: 'Continuar con Microsoft 365' }),
    ).toBeInTheDocument();
  });

  it('recovers an already committed session instead of leaving it on Login', async () => {
    state.session = {
      auth: { id: 'user-1', role: 'Estudiante' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      token: 'oneitb-jwt',
    };

    render(
      <MemoryRouter
        initialEntries={['/login']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/feed" element={<div>Muro autenticado</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Muro autenticado')).toBeInTheDocument();
  });

  it('never exposes an actionable Login form while a committed session changes route', () => {
    state.session = {
      auth: { id: 'user-1', role: 'Estudiante' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      token: 'oneitb-jwt',
    };

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Preparando tu sesión institucional...',
    );
    expect(screen.queryByRole('button', { name: 'Ingresar' })).not.toBeInTheDocument();
  });
});
