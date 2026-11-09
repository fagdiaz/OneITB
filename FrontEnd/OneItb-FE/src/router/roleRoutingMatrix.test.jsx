import React from 'react';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Routing } from './Routing';
import { clearMicrosoftRedirectFlow } from '../auth/microsoftRedirectFlow';

const matrix = vi.hoisted(() => ({
  session: null, profile: null, profileLoading: false,
  locations: [], queries: [], mutation: vi.fn().mockResolvedValue({ data: {} }),
}));

vi.mock('../hooks/useAuth', () => ({ default: () => matrix.session }));
// Replace session hydration only. The router, onboarding guard, PrivateLayout,
// AdminDashboard, EmployerJobOffers and AcademicDashboard remain production components.
vi.mock('../context/AuthProvider', () => ({ AuthProvider: ({ children }) => children }));
vi.mock('../Components/notifications/NotificationProvider', () => ({
  NotificationProvider: ({ children }) => children,
}));
vi.mock('../Components/auth/MicrosoftRedirectBoundary', () => ({
  MicrosoftRedirectBoundary: ({ children }) => children,
}));
vi.mock('../context/ThemeContext', () => ({
  useThemeOverride: () => {},
  useTheme: () => ({ theme: 'light' }),
}));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  const ReactModule = await import('react');
  const Probe = () => {
    const location = actual.useLocation();
    ReactModule.useEffect(() => {
      matrix.locations.push({ pathname: location.pathname, state: location.state, key: location.key });
    }, [location]);
    return <output data-testid="matrix-path">{location.pathname}</output>;
  };
  return {
    ...actual,
    BrowserRouter: ({ children, ...props }) => <actual.BrowserRouter {...props}>
      <Probe />{children}
    </actual.BrowserRouter>,
  };
});
vi.mock('@apollo/client', async (importOriginal) => {
  const actual = await importOriginal();
  const stableData = {
    careers: [], myCareers: [], subjects: [], academicResources: [],
    academicStudents: { items: [], hasNextPage: false, nextCursor: null },
    myAcademicProgress: [], academicProgressForUser: [], myJobOffers: { nodes: [] },
  };
  const refetch = vi.fn().mockResolvedValue({ data: stableData });
  return {
    ...actual,
    useQuery: (query, options = {}) => {
      const operation = query.definitions.find((definition) => definition.kind === 'OperationDefinition');
      const rootField = operation.selectionSet.selections[0].name.value;
      if (!options.skip) matrix.queries.push(rootField);
      return {
        data: rootField === 'me' ? { me: matrix.profile } : stableData,
        loading: rootField === 'me' && matrix.profileLoading,
        error: undefined, refetch, fetchMore: refetch, networkStatus: 7,
      };
    },
    useMutation: () => [matrix.mutation, { loading: false }],
  };
});

// Peripheral routes and layout content cannot issue operations or install transports.
vi.mock('../Components/layout/public/PublicLayout', async () => {
  const { Outlet } = await import('react-router-dom');
  return { PublicLayout: () => <Outlet /> };
});
vi.mock('../Components/layout/private/Header', () => ({ Header: () => null }));
vi.mock('../Components/layout/private/SideBar', () => ({ SideBar: () => null }));
vi.mock('../Components/layout/Footer', () => ({ Footer: () => null }));
vi.mock('../Components/chat/MiniChatWidget', () => ({ MiniChatWidget: () => null }));
vi.mock('../Components/user/Landing', () => ({ Landing: () => <p>Public landing</p> }));
vi.mock('../Components/user/Login', () => ({ Login: () => <p>Matrix login</p> }));
vi.mock('../Components/user/Register', () => ({ Register: () => <p>Matrix registration</p> }));
vi.mock('../Components/user/Logout', () => ({ Logout: () => <p>Matrix logout</p> }));
vi.mock('../Components/publication/Feed', () => ({ Feed: () => <p>Matrix feed</p> }));
vi.mock('../Components/profile/UserProfile', () => ({ UserProfile: () => null }));
vi.mock('../Components/profile/CvEditorProfile', () => ({ CvEditorProfile: () => null }));
vi.mock('../Components/chat/PrivateChat', () => ({ PrivateChat: () => null }));
vi.mock('../Components/certificates/PublicCertificate', () => ({ PublicCertificate: () => null }));
vi.mock('../Components/jobs/JobBoard', () => ({ JobBoard: () => <p>Matrix job board</p> }));
vi.mock('../Components/jobs/EmployerRequestForm', () => ({ EmployerRequestForm: () => null }));
vi.mock('../Components/auth/EmployerLogin', () => ({ EmployerLogin: () => null }));
vi.mock('../Components/auth/MicrosoftRedirectCallback', () => ({ MicrosoftRedirectCallback: () => null }));
vi.mock('../Components/onboarding/AcademicOnboarding', () => ({
  AcademicOnboarding: () => <p>Matrix academic onboarding</p>,
}));
vi.mock('../Components/layout/NotFound', () => ({ NotFound: () => <p>Matrix missing route</p> }));
vi.mock('../Components/admin/UserManagement', () => ({
  UserManagement: () => <p data-testid="matrix-users">Privileged user management</p>,
}));
vi.mock('../Components/admin/SubjectManagement', () => ({ SubjectManagement: () => null }));
vi.mock('../Components/admin/ModerationManagement', () => ({ ModerationManagement: () => null }));
vi.mock('../Components/admin/PublicationManagement', () => ({ PublicationManagement: () => null }));
vi.mock('../Components/admin/CommentManagement', () => ({ CommentManagement: () => null }));
vi.mock('../Components/admin/ModerationAuditManagement', () => ({ ModerationAuditManagement: () => null }));
vi.mock('../Components/admin/EmployerRequestManagement', () => ({ EmployerRequestManagement: () => null }));

const roles = ['Administrador', 'Moderador', 'Profesor', 'Estudiante', 'Egresado', 'Empleador'];
const paths = ['/admin', '/admin/users', '/empleos/mis-ofertas', '/academic'];
const cases = roles.flatMap((role) => paths.map((path) => [role, path]));
let consoleErrors;

function identify(role, careerCount = 1) {
  const id = `matrix-${role}`;
  matrix.session = {
    auth: { id, role }, isAuthenticated: true, isLoading: false,
    token: 'synthetic-matrix-session', sessionVersion: 1,
  };
  matrix.profile = {
    id, role,
    userCareers: Array.from({ length: careerCount }, (_, index) => ({ career: { id: index + 1 } })),
  };
}
function open(path) {
  window.history.replaceState({}, '', path);
  return render(<Routing />);
}
async function settled(path) {
  await waitFor(() => expect(screen.getByTestId('matrix-path').textContent).toBe(path));
  await act(async () => {});
  expect(matrix.locations.length).toBeLessThanOrEqual(4);
  expect(screen.queryByText('Matrix missing route')).toBeNull();
  expect(consoleErrors).not.toHaveBeenCalled();
}
async function assertPagePolicy(role, requestedPath) {
  if (requestedPath.startsWith('/admin')) {
    await settled('/admin');
    if (role === 'Administrador') {
      expect(screen.getByRole('heading', { name: 'Panel de administracion' })).toBeInTheDocument();
      expect(screen.getByTestId('matrix-users')).toBeInTheDocument();
    } else {
      expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument();
      expect(screen.queryByTestId('matrix-users')).toBeNull();
      expect(screen.queryByRole('navigation', { name: 'Secciones administrativas' })).toBeNull();
    }
    return;
  }
  if (requestedPath === '/empleos/mis-ofertas') {
    if (role === 'Empleador' || role === 'Administrador') {
      await settled(requestedPath);
      expect(screen.getByRole('heading', { name: 'Mis ofertas y postulantes' })).toBeInTheDocument();
      expect(matrix.queries).toContain('myJobOffers');
    } else {
      // A route redirect or an explicit access-denied view may enforce the barrier.
      await waitFor(() => expect(screen.queryByRole('heading', { name: 'Mis ofertas y postulantes' })).toBeNull());
      const path = screen.getByTestId('matrix-path').textContent;
      expect(['/feed', '/empleos', '/login', requestedPath]).toContain(path);
      if (path === requestedPath) expect(screen.getByRole('heading', { name: /Acceso restringido/i })).toBeInTheDocument();
      expect(matrix.queries).not.toContain('myJobOffers');
      expect(consoleErrors).not.toHaveBeenCalled();
      expect(matrix.locations.length).toBeLessThanOrEqual(4);
    }
    return;
  }
  // /academic exposes the academic reading shell to authenticated identities.
  // Grade-writing permissions are tested by the backend matrix.
  await settled('/academic');
  expect(screen.getByRole('heading', { name: 'Recursos, materias y progreso' })).toBeInTheDocument();
}

beforeEach(() => {
  clearMicrosoftRedirectFlow();
  localStorage.clear();
  sessionStorage.clear();
  matrix.locations.length = 0;
  matrix.queries.length = 0;
  matrix.profileLoading = false;
  matrix.mutation.mockClear();
  identify('Estudiante');
  consoleErrors = vi.spyOn(console, 'error'); // Preserve console output while asserting a clean render.
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  clearMicrosoftRedirectFlow();
  window.history.replaceState({}, '', '/');
});

it.each(cases)('GOB13 %s visiting %s enforces the role barrier with a valid profile', async (role, path) => {
  identify(role);
  open(path);
  await assertPagePolicy(role, path);
  expect(matrix.mutation).not.toHaveBeenCalled();
});

it.each(cases)('GOB13 %s visiting %s without a career applies the Student onboarding invariant', async (role, path) => {
  identify(role, 0);
  open(path);
  if (role === 'Estudiante') {
    await settled('/onboarding/academic');
    expect(screen.getByText('Matrix academic onboarding')).toBeInTheDocument();
    expect(matrix.locations.at(-1).state.from).toBe(path);
    expect(matrix.queries).not.toContain('myJobOffers');
    expect(screen.queryByTestId('matrix-users')).toBeNull();
  } else {
    await assertPagePolicy(role, path);
  }
});

it.each(paths)('GOB13 anonymous entry at %s returns to login and preserves the destination', async (path) => {
  matrix.session = { auth: {}, isAuthenticated: false, isLoading: false, token: null, sessionVersion: 0 };
  matrix.profile = null;
  open(path);
  await settled('/login');
  expect(screen.getByText('Matrix login')).toBeInTheDocument();
  expect(matrix.locations.at(-1).state.from).toBe(path);
  expect(matrix.queries).toEqual([]);
});

it.each(roles)('GOB13 %s cannot enter with a profile belonging to another identity', async (role) => {
  identify(role);
  matrix.profile = { ...matrix.profile, id: 'previous-identity' };
  open('/admin');
  await settled('/onboarding/academic');
  expect(matrix.locations.at(-1).state.profileRecoveryRequired).toBe(true);
  expect(screen.queryByTestId('matrix-users')).toBeNull();
  expect(matrix.queries).not.toContain('myJobOffers');
});

it.each(roles)('GOB13 %s waits for session hydration before protected content', async (role) => {
  identify(role);
  matrix.session.isLoading = true;
  open('/admin');
  await settled('/admin');
  expect(screen.getByText('Cargando configuración...')).toBeInTheDocument();
  expect(screen.queryByTestId('matrix-users')).toBeNull();
  expect(screen.queryByRole('heading', { name: 'Acceso restringido' })).toBeNull();
  expect(matrix.queries).toEqual([]);
});

it.each(roles)('GOB13 a live Admin session replaced by %s recalculates the administrative barrier', async (role) => {
  identify('Administrador');
  const view = open('/admin/users');
  await settled('/admin');
  expect(screen.getByTestId('matrix-users')).toBeInTheDocument();
  identify(role);
  matrix.session.sessionVersion = 2;
  view.rerender(<Routing />);
  await assertPagePolicy(role, '/admin');
});
