import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../../context/ThemeContext';
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
  <ThemeProvider>
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
    </MemoryRouter>
  </ThemeProvider>,
);

describe('AcademicOnboarding', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
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
      screen.getByRole('button', { name: 'Revisar y continuar' }),
    ).toBeDisabled();
  });

  it('keeps the selection and shows a controlled error when persistence fails', async () => {
    state.mutate.mockRejectedValue(new Error('Servicio no disponible'));
    renderOnboarding();

    const career = screen.getByRole('radio', { name: /Análisis de Sistemas/i });
    fireEvent.click(career);
    fireEvent.click(screen.getByRole('button', { name: 'Revisar y continuar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sí, confirmar carrera' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Servicio no disponible',
    );
    expect(career).toBeChecked();
    expect(screen.queryByText('Destino académico')).not.toBeInTheDocument();
  });

  it('does not expose schema internals when the active API is outdated', async () => {
    state.mutate.mockRejectedValue({
      graphQLErrors: [{
        message: 'The field `confirmStudentCareer` does not exist on the type `Mutation`.',
        extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
      }, {
        message: 'The following variables were not used: careerId.',
        extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
      }],
    });
    renderOnboarding();

    fireEvent.click(screen.getByRole('radio', { name: /Análisis de Sistemas/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Revisar y continuar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sí, confirmar carrera' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('servicio académico local está desactualizado');
    expect(alert).not.toHaveTextContent('confirmStudentCareer');
    expect(alert).not.toHaveTextContent('Mutation');
  });

  it('unlocks only after the refetched current profile contains a career', async () => {
    state.mutate.mockResolvedValue({
      data: {
        confirmStudentCareer: {
          id: 1, name: 'Análisis de Sistemas', code: 'TSAS', isActive: true,
        },
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
      screen.getByRole('radio', { name: /Análisis de Sistemas/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Revisar y continuar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sí, confirmar carrera' }));

    await waitFor(() => {
      expect(state.mutate).toHaveBeenCalledWith({
        variables: { careerId: 1 },
      });
      expect(state.profile.refetch).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText('Destino académico')).toBeInTheDocument();
  });

  it('does not unlock if the persisted profile still lacks careers', async () => {
    state.mutate.mockResolvedValue({
      data: {
        confirmStudentCareer: {
          id: 1, name: 'Análisis de Sistemas', code: 'TSAS', isActive: true,
        },
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
      screen.getByRole('radio', { name: /Análisis de Sistemas/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Revisar y continuar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Sí, confirmar carrera' }));

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
      screen.queryByRole('button', { name: 'Revisar y continuar' }),
    ).not.toBeInTheDocument();
  });

  it('allows only one career selection at a time', () => {
    renderOnboarding();

    const systems = screen.getByRole('radio', { name: /Análisis de Sistemas/i });
    const radiology = screen.getByRole('radio', { name: /Radiología/i });
    fireEvent.click(systems);
    expect(systems).toBeChecked();

    fireEvent.click(radiology);
    expect(radiology).toBeChecked();
    expect(systems).not.toBeChecked();
  });

  it('forces a light onboarding surface without overwriting a dark preference', () => {
    localStorage.setItem('token', 'token');
    localStorage.setItem('user', JSON.stringify({ id: 'user-1' }));
    localStorage.setItem('oneitb-theme', 'dark');
    renderOnboarding();

    expect(document.documentElement).not.toHaveClass('dark');
    expect(localStorage.getItem('oneitb-theme')).toBe('dark');
    expect(screen.getByRole('img', { name: 'OneITB' })).toHaveTextContent('neITB');
  });

  it('does not persist when confirmation is canceled', () => {
    renderOnboarding();

    fireEvent.click(screen.getByRole('radio', { name: /Análisis de Sistemas/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Revisar y continuar' }));
    expect(screen.getByRole('dialog')).toHaveTextContent(
      '¿Estás seguro de que esta es la carrera que estás cursando?',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Volver y revisar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(state.mutate).not.toHaveBeenCalled();
  });

  it('keeps an over-scoped Student in reconciliation until one career is confirmed', () => {
    state.profile.data.me.userCareers = [
      { career: { id: 1 } },
      { career: { id: 2 } },
    ];

    renderOnboarding();

    expect(screen.getByRole('heading', { name: 'Confirmá tu carrera actual' })).toBeInTheDocument();
    expect(screen.queryByText('Destino académico')).not.toBeInTheDocument();
  });
});
