import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET_CAREERS, GET_MY_CAREERS } from '../../data/graphql/queries/careers';
import { GET_SUBJECTS } from '../../data/graphql/queries/subjects';
import { GET_MY_FOLLOWED_USER_IDS } from '../../data/graphql/social';
import { ADD_COMMENT, CREATE_INQUIRY } from '../../data/graphql/mutations/inquiries';

const {
  useInquiryPageMock,
  uploadAttachmentsMock,
  createInquiryMock,
  addCommentMock,
} = vi.hoisted(() => ({
  useInquiryPageMock: vi.fn(),
  uploadAttachmentsMock: vi.fn(),
  createInquiryMock: vi.fn(),
  addCommentMock: vi.fn(),
}));

vi.mock('../../hooks/useAuth', () => ({
  default: () => ({
    auth: {
      id: 'user-1',
      role: 'Estudiante',
      firstName: 'Estu',
      lastName: 'Uno',
    },
    token: 'jwt-test-token',
  }),
}));

vi.mock('../../hooks/useInquiryPage', () => ({
  useInquiryPage: (...args) => useInquiryPageMock(...args),
}));

vi.mock('../../utils/uploadFile', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    uploadAttachments: (...args) => uploadAttachmentsMock(...args),
  };
});

vi.mock('@apollo/client', async (importOriginal) => {
  const actual = await importOriginal();
  const careersResult = {
    careers: [{ id: 1, name: 'ADS', code: 'ADS', isActive: true }],
  };
  const myCareersResult = {
    myCareers: [{ id: 1, name: 'ADS', code: 'ADS', isActive: true }],
  };
  const subjectsResult = {
    subjects: [{
      id: 10,
      name: 'Algoritmos',
      code: 'ALG-1',
      year: 1,
      isActive: true,
      career: { id: 1, name: 'ADS', code: 'ADS', isActive: true },
      prerequisites: [],
    }],
  };

  return {
    ...actual,
    useQuery: (doc) => {
      if (doc === GET_CAREERS) return { data: careersResult, loading: false };
      if (doc === GET_MY_CAREERS) return { data: myCareersResult, loading: false };
      if (doc === GET_SUBJECTS) return { data: subjectsResult, loading: false };
      if (doc === GET_MY_FOLLOWED_USER_IDS) return { data: { myFollowedUserIds: [] }, loading: false };
      return { data: undefined, loading: false };
    },
    useMutation: (doc) => {
      if (doc === CREATE_INQUIRY) return [createInquiryMock, { loading: false }];
      if (doc === ADD_COMMENT) return [addCommentMock, { loading: false }];
      return [vi.fn().mockResolvedValue({ data: {} }), { loading: false }];
    },
  };
});

import { Feed } from './Feed';

const makePost = (overrides = {}) => ({
  id: 'post-1',
  title: 'Consulta de prueba',
  content: 'Contenido de prueba',
  createdAt: '2026-11-10T10:00:00Z',
  isActive: true,
  isPinned: false,
  isHidden: false,
  moderationStatus: null,
  moderationReason: null,
  user: {
    id: 'user-other',
    firstName: 'Ana',
    lastName: 'Alumna',
    role: 'Estudiante',
    avatarUrl: null,
    totalPosts: 1,
    totalComments: 1,
    totalLikesReceived: 1,
  },
  subject: {
    id: 10,
    name: 'Algoritmos',
    code: 'ALG-1',
    year: 1,
    career: { id: 1, name: 'ADS', code: 'ADS' },
  },
  attachments: [],
  reactions: [],
  comments: [],
  ...overrides,
});

const renderFeed = () => render(
  <MockedProvider mocks={[]}>
    <MemoryRouter>
      <Feed />
    </MemoryRouter>
  </MockedProvider>,
);

describe('Feed attachment & comment interaction regressions', () => {
  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
    if (!globalThis.URL.createObjectURL) {
      globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview');
    }
    if (!globalThis.URL.revokeObjectURL) {
      globalThis.URL.revokeObjectURL = vi.fn();
    }
  });

  beforeEach(() => {
    uploadAttachmentsMock.mockReset();
    createInquiryMock.mockReset();
    addCommentMock.mockReset();

    uploadAttachmentsMock.mockResolvedValue([{
      fileUrl: '/uploads/evidencia.png',
      originalFileName: 'evidencia.png',
      contentType: 'image/png',
      size: 2048,
      storageMode: 'Local',
    }]);
    createInquiryMock.mockResolvedValue({ data: { createInquiry: { id: 'post-new' } } });
    addCommentMock.mockResolvedValue({ data: { addComment: { id: 'comment-new' } } });

    useInquiryPageMock.mockReturnValue({
      items: [],
      totalCount: 0,
      hasNextPage: false,
      loading: false,
      loadingMore: false,
      error: null,
      loadMoreError: null,
      loadMoreStatus: 'idle',
      lastAppendedCount: 0,
      refetch: vi.fn().mockResolvedValue({}),
      loadMore: vi.fn(),
    });
  });

  it('strips storageMode from SocialAttachmentInput when creating an inquiry with attachments', async () => {
    renderFeed();

    fireEvent.change(screen.getByPlaceholderText('Titulo de tu consulta'), {
      target: { value: 'Duda con adjunto' },
    });
    fireEvent.change(screen.getByPlaceholderText('Que queres compartir con la comunidad?'), {
      target: { value: 'Adjunto captura del error.' },
    });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '10' } });

    const fileInput = screen.getByLabelText(/Adjuntar archivos/i, { selector: 'input' });
    const pngFile = new File(['png-bytes'], 'evidencia.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [pngFile] } });

    fireEvent.click(screen.getByRole('button', { name: 'Publicar' }));

    await waitFor(() => expect(createInquiryMock).toHaveBeenCalledTimes(1));
    const [{ variables }] = createInquiryMock.mock.calls[0];
    expect(variables.attachments).toHaveLength(1);
    expect(variables.attachments[0]).toEqual({
      fileUrl: '/uploads/evidencia.png',
      originalFileName: 'evidencia.png',
      contentType: 'image/png',
      size: 2048,
      sortOrder: 0,
    });
    expect(variables.attachments[0]).not.toHaveProperty('storageMode');
  });

  it('strips storageMode from SocialAttachmentInput when adding a comment with attachments', async () => {
    useInquiryPageMock.mockReturnValue({
      items: [makePost()],
      totalCount: 1,
      hasNextPage: false,
      loading: false,
      loadingMore: false,
      error: null,
      loadMoreError: null,
      loadMoreStatus: 'idle',
      lastAppendedCount: 0,
      refetch: vi.fn().mockResolvedValue({}),
      loadMore: vi.fn(),
    });

    const { container } = renderFeed();

    fireEvent.click(screen.getByRole('button', { name: /comentarios/i }));
    const commentForm = container.querySelector('article form');
    expect(commentForm).not.toBeNull();

    const commentFileInput = screen.getByLabelText(/^Adjuntar$/i, { selector: 'input' });
    const pdfFile = new File(['pdf-bytes'], 'evidencia.pdf', { type: 'application/pdf' });
    fireEvent.change(commentFileInput, { target: { files: [pdfFile] } });

    const commentTextbox = commentForm.querySelector('textarea, input:not([type="file"]):not([type="hidden"])');
    expect(commentTextbox).not.toBeNull();
    fireEvent.change(commentTextbox, { target: { value: 'Sumo el apunte en adjunto' } });

    const submitCommentButton = commentForm.querySelector('button[type="submit"]');
    expect(submitCommentButton).not.toBeNull();
    fireEvent.click(submitCommentButton);

    await waitFor(() => expect(addCommentMock).toHaveBeenCalledTimes(1));
    const [{ variables }] = addCommentMock.mock.calls[0];
    expect(variables.attachments).toHaveLength(1);
    expect(variables.attachments[0]).toEqual({
      fileUrl: '/uploads/evidencia.png',
      originalFileName: 'evidencia.png',
      contentType: 'image/png',
      size: 2048,
      sortOrder: 0,
    });
    expect(variables.attachments[0]).not.toHaveProperty('storageMode');
  });

  it('highlights comentarios in blue after user participates (even nested) and toggles collapsed state on click', () => {
    useInquiryPageMock.mockReturnValue({
      items: [
        makePost({
          comments: [
            {
              id: 'c-root',
              inquiryId: 'post-1',
              userId: 'user-other',
              parentCommentId: null,
              content: 'Comentario inicial',
              createdAt: '2026-11-10T10:01:00Z',
              attachments: [],
              reactions: [],
              user: { id: 'user-other', firstName: 'Ana', lastName: 'Alumna', role: 'Estudiante' },
            },
            {
              id: 'c-nested',
              inquiryId: 'post-1',
              userId: 'user-1',
              parentCommentId: 'c-root',
              content: 'Mi respuesta anidada',
              createdAt: '2026-11-10T10:02:00Z',
              attachments: [],
              reactions: [],
              user: { id: 'user-1', firstName: 'Estu', lastName: 'Uno', role: 'Estudiante' },
            },
          ],
        }),
      ],
      totalCount: 1,
      hasNextPage: false,
      loading: false,
      loadingMore: false,
      error: null,
      loadMoreError: null,
      loadMoreStatus: 'idle',
      lastAppendedCount: 0,
      refetch: vi.fn().mockResolvedValue({}),
      loadMore: vi.fn(),
    });

    renderFeed();

    const toggleButton = screen.getByRole('button', { name: /2 comentarios/i });
    expect(toggleButton).toHaveClass('border-blue-200', 'text-blue-700');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows miniature of first liked comment when collapsed and prompts to expand when multiple comments are liked', () => {
    useInquiryPageMock.mockReturnValue({
      items: [
        makePost({
          comments: [
            {
              id: 'c-late',
              inquiryId: 'post-1',
              userId: 'user-other',
              parentCommentId: null,
              content: 'Segundo comentario con like',
              createdAt: '2026-11-10T10:05:00Z',
              attachments: [],
              reactions: [{ id: 'r-2', userId: 'user-1' }],
              user: { id: 'user-other', firstName: 'Beto', lastName: 'Docente', role: 'Profesor' },
            },
            {
              id: 'c-early',
              inquiryId: 'post-1',
              userId: 'user-other-2',
              parentCommentId: null,
              content: 'Primer comentario cronologico con like',
              createdAt: '2026-11-10T10:01:00Z',
              attachments: [],
              reactions: [{ id: 'r-1', userId: 'user-1' }],
              user: { id: 'user-other-2', firstName: 'Ana', lastName: 'Alumna', role: 'Estudiante' },
            },
          ],
        }),
      ],
      totalCount: 1,
      hasNextPage: false,
      loading: false,
      loadingMore: false,
      error: null,
      loadMoreError: null,
      loadMoreStatus: 'idle',
      lastAppendedCount: 0,
      refetch: vi.fn().mockResolvedValue({}),
      loadMore: vi.fn(),
    });

    renderFeed();

    expect(screen.getByText('Primer comentario cronologico con like')).toBeInTheDocument();
    expect(screen.queryByText('Segundo comentario con like')).not.toBeInTheDocument();

    const expandLikedButton = screen.getByRole('button', { name: /\+1 más · Expandir comentarios/i });
    fireEvent.click(expandLikedButton);

    const toggleButton = screen.getByRole('button', { name: /2 comentarios/i });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });
});
