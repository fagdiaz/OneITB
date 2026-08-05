import { describe, expect, it } from 'vitest';
import { calculateVisibleItemCount } from './useProgressiveNavigation';

describe('calculateVisibleItemCount', () => {
  const widths = [92, 104, 88, 118, 72];

  it('shows every item when the complete row fits', () => {
    expect(calculateVisibleItemCount({ availableWidth: 500, itemWidths: widths })).toBe(5);
  });

  it('reserves exactly one overflow control when only a prefix fits', () => {
    expect(calculateVisibleItemCount({
      availableWidth: 340,
      itemWidths: widths,
      gap: 4,
      overflowWidth: 36,
    })).toBe(3);
  });

  it('keeps the overflow control reachable at narrow widths', () => {
    expect(calculateVisibleItemCount({
      availableWidth: 36,
      itemWidths: widths,
      overflowWidth: 36,
    })).toBe(0);
  });

  it('uses a stable all-visible fallback before the browser can measure', () => {
    expect(calculateVisibleItemCount({ availableWidth: 0, itemWidths: widths })).toBe(5);
    expect(calculateVisibleItemCount({ availableWidth: 200, itemWidths: [0, 0] })).toBe(2);
  });
});
