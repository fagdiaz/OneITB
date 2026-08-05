import { afterEach, describe, expect, it, vi } from 'vitest';
import { uploadAttachmentDescriptor } from './uploadFile';

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
});
