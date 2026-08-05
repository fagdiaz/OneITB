import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CvEditorProfile } from './CvEditorProfile';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  updateProfile: vi.fn(),
  togglePrivacy: vi.fn(),
  refetchProfile: vi.fn(),
  refetchCareers: vi.fn(),
  uploadDescriptor: vi.fn(),
  profileResult: null,
  careersResult: null,
  cache: {
    evict: vi.fn(),
    gc: vi.fn(),
    writeQuery: vi.fn(),
  },
}));

const currentProfile = (overrides = {}) => ({
  id: 'user-1',
  firstName: 'Diaz',
  lastName: 'Francisco Agustin',
  fullName: 'Diaz Francisco Agustin',
  email: '38079238@itbeltran.com.ar',
  role: 'Estudiante',
  biography: 'Perfil completo',
  phone: '1122334455',
  linkedIn: '',
  facebook: '',
  instagram: '',
  avatarUrl: '/uploads/persisted.jpg',
  isPublicProfile: true,
  userCareers: [{ career: { id: 1, name: 'Analisis de Sistemas', code: 'TSAS' } }],
  cvExperiences: [],
  cvEducations: [],
  cvProjects: [],
  cvSkills: [],
  cvLanguages: [],
  ...overrides,
});

const operationName = (document) => document?.definitions?.find(
  (definition) => definition.kind === 'OperationDefinition',
)?.name?.value;

vi.mock('../../hooks/useAuth', () => ({
  default: () => ({
    auth: { id: 'user-1', role: 'Estudiante', fullName: 'Diaz' },
    token: 'jwt-token',
    sessionVersion: 7,
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
}));

vi.mock('@apollo/client', async (importOriginal) => ({
  ...(await importOriginal()),
  useQuery: (document) => (
    operationName(document) === 'GetUserProfile'
      ? mocks.profileResult
      : mocks.careersResult
  ),
  useMutation: (document) => (
    operationName(document) === 'UpdateProfile'
      ? [mocks.updateProfile, { loading: false }]
      : [mocks.togglePrivacy, { loading: false }]
  ),
  useApolloClient: () => ({ cache: mocks.cache }),
}));

vi.mock('../../utils/uploadFile', () => ({
  apiBaseUrl: 'http://localhost:44397',
  UploadRequestError: class UploadRequestError extends Error {
    constructor(message, details = {}) {
      super(message);
      Object.assign(this, details);
    }
  },
  uploadAttachmentDescriptor: (...args) => mocks.uploadDescriptor(...args),
}));

vi.mock('../editor/ExperienceForm', () => ({ ExperienceForm: () => null }));
vi.mock('../editor/EducationForm', () => ({ EducationForm: () => null }));
vi.mock('../editor/ProjectsForm', () => ({ ProjectsForm: () => null }));
vi.mock('../editor/SkillsLanguagesForm', () => ({ SkillsLanguagesForm: () => null }));
vi.mock('../resume/CVATSPrintTemplate', () => ({
  CVATSPrintTemplate: React.forwardRef(() => null),
}));
vi.mock('../../hooks/useCvAtsPrint', () => ({
  useCvAtsPrint: () => ({
    printCv: vi.fn(),
    isPrinting: false,
    printError: '',
  }),
}));
vi.mock('./AvatarEditorModal', () => ({
  AvatarEditorModal: ({ isOpen, onSave }) => (
    isOpen
      ? <button type="button" onClick={() => onSave(new File(['edited'], 'edited.jpg', { type: 'image/jpeg' }))}>Confirmar recorte</button>
      : null
  ),
}));

describe('CvEditorProfile lifecycle', () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.updateProfile.mockReset();
    mocks.updateProfile.mockResolvedValue({
      data: { updateProfile: { id: 'user-1', success: true } },
    });
    mocks.togglePrivacy.mockReset();
    mocks.togglePrivacy.mockResolvedValue({
      data: { toggleProfilePrivacy: { id: 'user-1', success: true } },
    });
    mocks.refetchProfile.mockReset();
    mocks.refetchProfile.mockResolvedValue({ data: { me: currentProfile() } });
    mocks.refetchCareers.mockReset();
    mocks.refetchCareers.mockResolvedValue({ data: { careers: [] } });
    mocks.uploadDescriptor.mockReset();
    mocks.uploadDescriptor.mockResolvedValue({
      fileUrl: '/uploads/candidate.jpg',
      storageMode: 'Local',
    });
    mocks.cache.evict.mockReset();
    mocks.cache.gc.mockReset();
    mocks.cache.writeQuery.mockReset();
    mocks.profileResult = {
      data: undefined,
      loading: true,
      error: undefined,
      refetch: mocks.refetchProfile,
    };
    mocks.careersResult = {
      data: {
        careers: [
          { id: 1, name: 'Analisis de Sistemas', code: 'TSAS', isActive: true },
          { id: 2, name: 'Administracion Contable', code: 'TAC', isActive: true },
        ],
      },
      loading: false,
      error: undefined,
      refetch: mocks.refetchCareers,
    };
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  it('shows a full skeleton and never renders provisional auth values', () => {
    render(<CvEditorProfile />);

    expect(screen.getByLabelText('Cargando perfil institucional')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Diaz')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar perfil y CV' })).not.toBeInTheDocument();
  });

  it('keeps the full skeleton while the careers snapshot is still loading', async () => {
    mocks.profileResult = {
      data: { me: currentProfile() },
      loading: false,
      error: undefined,
      refetch: mocks.refetchProfile,
    };
    mocks.careersResult = {
      data: undefined,
      loading: true,
      error: undefined,
      refetch: mocks.refetchCareers,
    };

    render(<CvEditorProfile />);

    expect(screen.getByLabelText('Cargando perfil institucional')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Perfil completo')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar perfil y CV' })).not.toBeInTheDocument();
  });

  it('shows a recoverable boundary when careers finish without a catalog snapshot', async () => {
    mocks.profileResult = {
      data: { me: currentProfile() },
      loading: false,
      error: undefined,
      refetch: mocks.refetchProfile,
    };
    mocks.careersResult = {
      data: undefined,
      loading: false,
      error: undefined,
      refetch: mocks.refetchCareers,
    };

    render(<CvEditorProfile />);

    expect(await screen.findByText('No pudimos cargar una edicion segura')).toBeInTheDocument();
    expect(screen.getByText(/perfil y sus carreras/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guardar perfil y CV' })).not.toBeInTheDocument();
  });

  it('blocks a profile returned for another session identity', async () => {
    mocks.profileResult = {
      data: { me: currentProfile({ id: 'user-2' }) },
      loading: false,
      error: undefined,
      refetch: mocks.refetchProfile,
    };

    render(<CvEditorProfile />);

    expect(await screen.findByText('No pudimos cargar una edicion segura')).toBeInTheDocument();
    expect(screen.getByText(/no corresponde a la sesion actual/i)).toBeInTheDocument();
  });

  it('hydrates once and a later profile result does not overwrite a dirty field', async () => {
    mocks.profileResult = {
      data: { me: currentProfile() },
      loading: false,
      error: undefined,
      refetch: mocks.refetchProfile,
    };
    const view = render(<CvEditorProfile />);

    const biography = await screen.findByDisplayValue('Perfil completo');
    fireEvent.change(biography, { target: { name: 'biography', value: 'Borrador local' } });

    mocks.profileResult = {
      ...mocks.profileResult,
      data: { me: currentProfile({ biography: 'Respuesta tardia' }) },
    };
    view.rerender(<CvEditorProfile />);

    expect(screen.getByDisplayValue('Borrador local')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Respuesta tardia')).not.toBeInTheDocument();
  });

  it('retains the persisted avatar when saving other fields', async () => {
    mocks.profileResult = {
      data: { me: currentProfile() },
      loading: false,
      error: undefined,
      refetch: mocks.refetchProfile,
    };
    render(<CvEditorProfile />);

    await screen.findByDisplayValue('Perfil completo');
    fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil y CV' }));

    await waitFor(() => expect(mocks.updateProfile).toHaveBeenCalled());
    expect(mocks.updateProfile.mock.calls[0][0].variables.input.avatarUrl).toBe(
      '/uploads/persisted.jpg',
    );
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith(
      '/profile',
      { replace: true },
    ));
    expect(mocks.cache.evict).toHaveBeenCalledWith({
      id: 'ROOT_QUERY',
      fieldName: 'inquiriesPage',
      broadcast: false,
    });
  });

  it('requires explicit confirmation before replacing a Student career', async () => {
    mocks.profileResult = {
      data: { me: currentProfile() },
      loading: false,
      error: undefined,
      refetch: mocks.refetchProfile,
    };
    mocks.refetchProfile.mockResolvedValue({
      data: {
        me: currentProfile({
          userCareers: [{ career: { id: 2, name: 'Administracion Contable', code: 'TAC' } }],
        }),
      },
    });
    render(<CvEditorProfile />);

    await screen.findByDisplayValue('Perfil completo');
    fireEvent.click(screen.getByRole('radio', { name: /Administracion Contable/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil y CV' }));

    expect(screen.getByRole('dialog')).toHaveTextContent(
      '¿Estás seguro de que esta es la carrera que estás cursando?',
    );
    expect(mocks.updateProfile).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Sí, actualizar carrera' }));
    await waitFor(() => expect(mocks.updateProfile).toHaveBeenCalledTimes(1));
    expect(mocks.updateProfile.mock.calls[0][0].variables.input.careerIds).toEqual([2]);
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith(
      '/profile',
      { replace: true },
    ));
  });

  it('stages a successful upload until profile save', async () => {
    mocks.profileResult = {
      data: { me: currentProfile() },
      loading: false,
      error: undefined,
      refetch: mocks.refetchProfile,
    };
    mocks.refetchProfile.mockResolvedValue({
      data: { me: currentProfile({ avatarUrl: '/uploads/candidate.jpg' }) },
    });
    const view = render(<CvEditorProfile />);
    await screen.findByDisplayValue('Perfil completo');

    const fileInput = view.container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Confirmar recorte' }));

    expect(await screen.findByText(/Imagen almacenada en modo local; falta guardar/i)).toBeInTheDocument();
    expect(mocks.updateProfile).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Guardar perfil y CV' }));
    await waitFor(() => expect(mocks.updateProfile).toHaveBeenCalled());
    expect(mocks.updateProfile.mock.calls[0][0].variables.input.avatarUrl).toBe(
      '/uploads/candidate.jpg',
    );
  });

  it('preserves the previous avatar when upload fails', async () => {
    mocks.profileResult = {
      data: { me: currentProfile() },
      loading: false,
      error: undefined,
      refetch: mocks.refetchProfile,
    };
    mocks.uploadDescriptor.mockRejectedValue(new Error('network'));
    const view = render(<CvEditorProfile />);
    await screen.findByDisplayValue('Perfil completo');

    const fileInput = view.container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, {
      target: { files: [new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' })] },
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Confirmar recorte' }));

    expect(await screen.findByText(/avatar guardado no fue reemplazado/i)).toBeInTheDocument();
    expect(screen.getByAltText('Vista previa del avatar')).toHaveAttribute(
      'src',
      'http://localhost:44397/uploads/persisted.jpg',
    );
  });
});
