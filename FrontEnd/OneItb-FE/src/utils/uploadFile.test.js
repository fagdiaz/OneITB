import { afterEach, describe, expect, it, vi } from 'vitest';
import { UploadRequestError, uploadAttachmentDescriptor } from './uploadFile';

const createImage = () => new File(['avatar'], 'avatar.jpg', {
  type: 'image/jpeg',
  lastModified: 1,
});

describe('uploadAttachmentDescriptor', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requires an authenticated session before issuing the request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(uploadAttachmentDescriptor(createImage(), '')).rejects.toThrow(
      'sesion no esta disponible',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('forwards cancellation and returns the explicit storage mode', async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        fileUrl: '/uploads/avatar.jpg',
        originalFileName: 'avatar.jpg',
        contentType: 'image/jpeg',
        size: 6,
        storageMode: 'Local',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const descriptor = await uploadAttachmentDescriptor(
      createImage(),
      'jwt-token',
      { signal: controller.signal },
    );

    expect(descriptor).toMatchObject({
      fileUrl: '/uploads/avatar.jpg',
      storageMode: 'Local',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/upload'),
      expect.objectContaining({
        signal: controller.signal,
        headers: { Authorization: 'Bearer jwt-token' },
      }),
    );
  });

  it('maps a storage outage to a recoverable sanitized error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      headers: { get: vi.fn().mockReturnValue(null) },
      json: async () => ({
        message: 'El almacenamiento de archivos no esta disponible.',
        code: 'UPLOAD_STORAGE_UNAVAILABLE',
        correlationId: 'corr-215',
        storageMode: 'Cloudinary',
        retryable: true,
      }),
    }));

    const failure = await uploadAttachmentDescriptor(createImage(), 'jwt-token')
      .catch((error) => error);

    expect(failure).toBeInstanceOf(UploadRequestError);
    expect(failure).toMatchObject({
      code: 'UPLOAD_STORAGE_UNAVAILABLE',
      correlationId: 'corr-215',
      storageMode: 'Cloudinary',
      retryable: true,
      status: 503,
    });
    expect(failure.message).not.toContain('cloudinary://');
  });
});
