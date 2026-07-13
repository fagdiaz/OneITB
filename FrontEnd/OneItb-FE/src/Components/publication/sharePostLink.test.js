import { describe, expect, it, vi } from 'vitest';
import { buildPostShareUrl, copyPostShareUrl } from './sharePostLink';

describe('sharePostLink', () => {
  it('builds a stable feed deep link', () => {
    const url = buildPostShareUrl('abc-123', { origin: 'http://localhost:5173' });

    expect(url).toBe('http://localhost:5173/feed?inquiryId=abc-123');
  });

  it('copies the generated link through the clipboard', async () => {
    const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };

    const url = await copyPostShareUrl('post-1', {
      clipboard,
      locationLike: { origin: 'https://oneitb.test' },
    });

    expect(url).toBe('https://oneitb.test/feed?inquiryId=post-1');
    expect(clipboard.writeText).toHaveBeenCalledWith(url);
  });

  it('fails with a controlled error when clipboard is unavailable', async () => {
    await expect(copyPostShareUrl('post-1', {
      clipboard: null,
      locationLike: { origin: 'https://oneitb.test' },
    })).rejects.toThrow('portapapeles');
  });
});
