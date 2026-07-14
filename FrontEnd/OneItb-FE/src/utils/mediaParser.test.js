import { describe, expect, it } from 'vitest';
import { parseYouTubeContent } from './mediaParser';

describe('parseYouTubeContent', () => {
  it('returns an empty ordered collection when there are no YouTube links', () => {
    expect(parseYouTubeContent('Material sin videos')).toEqual({
      text: 'Material sin videos',
      videoId: null,
      videoIds: [],
      youtubeLinkCount: 0,
    });
  });

  it('extracts every supported YouTube link in source order', () => {
    const result = parseYouTubeContent(
      'Primero https://youtu.be/dQw4w9WgXcQ y luego https://www.youtube.com/shorts/9bZkp7q19f0.',
    );

    expect(result.videoIds).toEqual(['dQw4w9WgXcQ', '9bZkp7q19f0']);
    expect(result.videoId).toBe('dQw4w9WgXcQ');
    expect(result.youtubeLinkCount).toBe(2);
    expect(result.text).toBe('Primero y luego .');
  });

  it('counts duplicate valid links so the publication limit cannot be bypassed', () => {
    const result = parseYouTubeContent(
      'https://youtu.be/dQw4w9WgXcQ https://youtu.be/dQw4w9WgXcQ https://youtube.com/watch?v=9bZkp7q19f0',
    );

    expect(result.youtubeLinkCount).toBe(3);
    expect(result.videoIds).toEqual(['dQw4w9WgXcQ', 'dQw4w9WgXcQ', '9bZkp7q19f0']);
  });

  it('keeps malformed YouTube URLs as ordinary text', () => {
    const result = parseYouTubeContent('Referencia https://youtube.com/watch?v=invalid');

    expect(result.youtubeLinkCount).toBe(0);
    expect(result.text).toContain('https://youtube.com/watch?v=invalid');
  });
});
