import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Nav } from './Nav';

const authState = vi.hoisted(() => ({
  value: {
    auth: { id: 'user-1', fullName: 'Usuario Demo', role: 'Estudiante' },
    isAuthenticated: true,
    token: 'test-token',
    sessionVersion: 1,
  },
}));

vi.mock('../../../hooks/useAuth', () => ({
  default: () => authState.value,
}));

vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}));

vi.mock('../../notifications/NotificationBell', () => ({
  NotificationBell: () => <button type="button">Notificaciones</button>,
}));

vi.mock('@apollo/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useQuery: vi.fn((query) => {
      const operationName = query?.definitions?.[0]?.name?.value;
      if (operationName === 'GetUserProfile') {
        return { data: { me: { id: 'user-1', fullName: 'Usuario Demo', avatarUrl: null } } };
      }

      if (operationName === 'MessagingContacts') {
        return {
          data: {
            messagingContacts: {
              nodes: [
                { id: 'contact-1', unreadCount: 2 },
                { id: 'contact-2', unreadCount: 1 },
              ],
            },
          },
        };
      }

      return { data: undefined };
    }),
    useSubscription: vi.fn(() => ({ data: undefined })),
  };
});

describe('Nav', () => {
  beforeEach(() => {
    authState.value = {
      auth: { id: 'user-1', fullName: 'Usuario Demo', role: 'Estudiante' },
      isAuthenticated: true,
      token: 'test-token',
      sessionVersion: 1,
    };
  });

  it('surfaces the aggregate unread message count on the mobile menu trigger', () => {
    render(
      <MemoryRouter initialEntries={['/feed']}>
        <Nav />
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: 'Abrir menu de navegacion' })).toBeInTheDocument();
    expect(screen.getByLabelText('3 mensajes sin leer')).toHaveTextContent('3');
    expect(screen.queryByText('Inicio')).not.toBeInTheDocument();
  });

  it('keeps anonymous authentication actions directly available from the medium breakpoint', () => {
    authState.value = { auth: {}, isAuthenticated: false, token: null, sessionVersion: 0 };
    render(<MemoryRouter><Nav /></MemoryRouter>);

    const actions = screen.getByTestId('desktop-auth-actions');
    expect(actions).toHaveClass('md:flex');
    expect(actions).toHaveTextContent('Iniciar Sesi');
    expect(actions).toHaveTextContent('Registrarse');
  });
});
