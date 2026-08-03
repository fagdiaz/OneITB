import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AcademicOnboarding } from './AcademicOnboarding';

const state = vi.hoisted(() => ({
  auth: {
    auth: { id: 'user-1', role: 'Estudiante' },
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
    sessionVersion: 1,
    token: 'token',
  },
  profile: {
    data: {
      me: {
        id: 'user-1',
        role: 'Estudiante',
        userCareers: [],
      },
    },
    loading: false,
    error: undefined,
    refetch: vi.fn(),
  },
  careers: {
    data: {
      careers: [
        { id: 1, name: 'Análisis de Sistemas', code: 'TSAS', isActive: true },
        { id: 2, name: 'Radiología', code: 'TERA', isActive: true },
      ],
    },
    loading: false,
    error: undefined,
    refetch: vi.fn(),
  },
  mutate: vi.fn(),
  mutationLoading: false,
}));

vi.mock('../../hooks/useAuth', () => ({
  default: () => state.auth,
}));

vi.mock('@apollo/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useQuery: (query) => {
      const operationName = query?.definitions?.[0]?.name?.value;
      return operationName === 'GetUserProfile'
        ? state.profile
        : state.careers;
    },
    useMutation: () => [
      state.mutate,
      { loading: state.mutationLoading },
    ],
  };
});

const renderOnboarding = () => render(
  <MemoryRouter
    initialEntries={[{
      pathname: '/onboarding/academic',
      state: { from: '/academic?tab=resources' },
    }]}
  >
    <Routes>
      <Route path="/onboarding/academic" element={<AcademicOnboarding />} />
      <Route path="/academic" element={<div>Destino académico</div>} />
      <Route path="/feed" element={<div>Feed</div>} />
      <Route path="/login" element={<div>Login</div>} />
    </Routes>
  </MemoryRouter>,
);

describe('AcademicOnboarding', () => {
  beforeEach(() => {
    state.auth = {
      auth: { id: 'user-1', role: 'Estudiante' },
      isAuthenticated: true,
      isLoading: false,
      logout: vi.fn().mockResolvedValue(undefined),
      sessionVersion: 1,
      token: 'token',
    };
    state.profile = {
      data: {
        me: {
          id: 'user-1',
          role: 'Estudiante',
          userCareers: [],
        },
      },
      loading: false,
      error: undefined,
      refetch: vi.fn(),
    };
    state.careers = {
      data: {
        careers: [
          { id: 1, name: 'Análisis de Sistemas', code: 'TSAS', isActive: true },
          { id: 2, name: 'Radiología', code: 'TERA', isActive: true },
        ],
      },
      loading: false,
      error: undefined,
      refetch: vi.fn().mockResolvedValue(undefined),
    };
    state.mutate = vi.fn();
    state.mutationLoading = false;
  });

  it('requires a selection before allowing save', () => {
    renderOnboarding();
    expect(
      screen.getByRole('button', { name: 'Guardar y continuar' }),
    ).toBeDisabled();
  });

  it('keeps the selection and shows a controlled error when persistence fails', async () => {
    state.mutate.mockRejectedValue(new Error('Servicio no disponible'));
    renderOnboarding();

    const career = screen.getByRole('checkbox', { name: /Análisis de Sistemas/i });
    fireEvent.click(career);
    fireEvent.click(screen.getByRole('button', { name: 'Guardar y continuar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Servicio no disponible',
    );
    expect(career).toBeChecked();
    expect(screen.queryByText('Destino académico')).not.toBeInTheDocument();
  });

  it('unlocks only after the refetched current profile contains a career', async () => {
    state.mutate.mockResolvedValue({
      data: {
        linkUserToCareers: [
          { id: 1, name: 'Análisis de Sistemas', code: 'TSAS', isActive: true },
        ],
      },
    });
    state.profile.refetch.mockResolvedValue({
      data: {
        me: {
          id: 'user-1',
          role: 'Estudiante',
          userCareers: [{ career: { id: 1 } }],
        },
      },
    });
    renderOnboarding();

    fireEvent.click(
      screen.getByRole('checkbox', { name: /Análisis de Sistemas/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Guardar y continuar' }));

    await waitFor(() => {
      expect(state.mutate).toHaveBeenCalledWith({
        variables: { careerIds: [1] },
      });
      expect(state.profile.refetch).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('Destino académico')).toBeInTheDocument();
  });

  it('does not unlock if the persisted profile still lacks careers', async () => {
    state.mutate.mockResolvedValue({
      data: {
        linkUserToCareers: [
          { id: 1, name: 'Análisis de Sistemas', code: 'TSAS', isActive: true },
        ],
      },
    });
    state.profile.refetch.mockResolvedValue({
      data: {
        me: {
          id: 'user-1',
          role: 'Estudiante',
          userCareers: [],
        },
      },
    });
    renderOnboarding();

    fireEvent.click(
      screen.getByRole('checkbox', { name: /Análisis de Sistemas/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Guardar y continuar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'todavía no confirmó',
    );
    expect(screen.queryByText('Destino académico')).not.toBeInTheDocument();
  });

  it('offers retry and logout when profile validation fails', async () => {
    state.profile = {
      data: undefined,
      loading: false,
      error: new Error('Perfil no disponible'),
      refetch: vi.fn().mockResolvedValue(undefined),
    };
    renderOnboarding();

    expect(screen.getByRole('alert')).toHaveTextContent('Perfil no disponible');
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    await waitFor(() => expect(state.auth.logout).toHaveBeenCalledTimes(1));
  });

  it('keeps recovery controlled when retry fails', async () => {
    state.profile = {
      data: undefined,
      loading: false,
      error: new Error('Perfil no disponible'),
      refetch: vi.fn().mockRejectedValue(new Error('Red no disponible')),
    };
    renderOnboarding();

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Red no disponible',
    );
  });

  it('does not allow setup when the active career catalog is empty', () => {
    state.careers.data.careers = [];
    renderOnboarding();

    expect(screen.getByRole('heading', {
      name: 'No hay carreras disponibles',
    })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Guardar y continuar' }),
    ).not.toBeInTheDocument();
  });
});
