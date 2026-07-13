import { describe, expect, it } from 'vitest';
import { calculatePdfScale } from './PdfFirstPageThumbnail';

describe('calculatePdfScale', () => {
  it('fits the PDF page to the tile width and caps oversized scaling', () => {
    expect(calculatePdfScale(600, 300)).toBe(0.5);
    expect(calculatePdfScale(100, 1000)).toBe(2);
    expect(calculatePdfScale(0, 300)).toBe(1);
  });
});
