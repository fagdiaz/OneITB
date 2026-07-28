import { describe, expect, it } from 'vitest';
import { mergeInquiryPages } from './useInquiryPage';

describe('mergeInquiryPages', () => {
  it('appends a bounded page without duplicating normalized entities', () => {
    const previous = {
      inquiriesPage: {
        items: [{ id: '1' }, { id: '2' }],
        totalCount: 3,
        hasNextPage: true,
        nextCursor: 'page-2',
      },
    };
    const incoming = {
      inquiriesPage: {
        items: [{ id: '2' }, { id: '3' }],
        totalCount: 3,
        hasNextPage: false,
        nextCursor: '',
      },
    };

    const merged = mergeInquiryPages(previous, incoming);

    expect(merged.inquiriesPage.items.map((item) => item.id)).toEqual(['1', '2', '3']);
    expect(merged.inquiriesPage.hasNextPage).toBe(false);
    expect(merged.inquiriesPage.nextCursor).toBe('');
  });
});
