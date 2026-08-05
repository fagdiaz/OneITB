import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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
const layoutState = vi.hoisted(() => ({ visibleCount: 3 }));

vi.mock('../../../hooks/useAuth', () => ({ default: () => authState.value }));
vi.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: vi.fn() }),
}));
vi.mock('../../notifications/NotificationBell', () => ({
  NotificationBell: () => <button type="button">Notificaciones</button>,
}));
vi.mock('./useProgressiveNavigation', () => ({
  useProgressiveNavigation: () => ({
    containerRef: { current: null },
    measurementRef: { current: null },
    overflowMeasurementRef: { current: null },
    visibleCount: layoutState.visibleCount,
  }),
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
    layoutState.visibleCount = 3;
  });

  it('shows every Student destination directly when it fits', () => {
    render(<MemoryRouter initialEntries={['/feed']}><Nav /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /Mensajes/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Académico' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Empleos' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /más opciones de navegación/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText('3 mensajes sin leer')).toHaveTextContent('3');
  });

  it('moves only the non-fitting suffix into one accessible overflow menu', () => {
    layoutState.visibleCount = 2;
    render(<MemoryRouter initialEntries={['/feed']}><Nav /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /Mensajes/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Académico' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Empleos' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir más opciones de navegación' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Empleos' })).toHaveAttribute('href', '/empleos');
  });

  it('keeps role-specific destinations in the same descriptor flow', () => {
    authState.value = {
      ...authState.value,
      auth: { ...authState.value.auth, role: 'Administrador' },
    };
    layoutState.visibleCount = 3;
    render(<MemoryRouter initialEntries={['/feed']}><Nav /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir más opciones de navegación' }));
    expect(screen.getByRole('menuitem', { name: 'Postulaciones' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Admin' })).toBeInTheDocument();
  });

  it('closes with Escape and restores focus to the overflow trigger', () => {
    layoutState.visibleCount = 1;
    render(<MemoryRouter initialEntries={['/feed']}><Nav /></MemoryRouter>);

    const trigger = screen.getByRole('button', { name: 'Abrir más opciones de navegación' });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes the overflow menu after an outside click', () => {
    layoutState.visibleCount = 1;
    render(<MemoryRouter initialEntries={['/feed']}><Nav /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: /Abrir .* opciones de navegaci/ }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the overflow menu when a destination is selected', () => {
    layoutState.visibleCount = 1;
    render(<MemoryRouter initialEntries={['/feed']}><Nav /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: /Abrir .* opciones de navegaci/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Acad.mico/ }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('keeps anonymous authentication actions directly available from medium widths', () => {
    authState.value = { auth: {}, isAuthenticated: false, token: null, sessionVersion: 0 };
    render(<MemoryRouter><Nav /></MemoryRouter>);

    const actions = screen.getByTestId('desktop-auth-actions');
    expect(actions).toHaveClass('md:flex');
    expect(actions).toHaveTextContent('Iniciar Sesión');
    expect(actions).toHaveTextContent('Registrarse');
    expect(screen.getByRole('link', { name: 'Soy empresa' })).toHaveAttribute('href', '/empleos/solicitud');
  });

  it('exposes the employer request in the anonymous compact menu', () => {
    authState.value = { auth: {}, isAuthenticated: false, token: null, sessionVersion: 0 };
    render(<MemoryRouter><Nav /></MemoryRouter>);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú de navegación' }));
    expect(screen.getAllByRole('link', { name: 'Soy empresa' })
      .some((link) => link.getAttribute('href') === '/empleos/solicitud')).toBe(true);
  });
});
