import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExpandableText } from './ExpandableText';

describe('ExpandableText', () => {
  it('expands and collapses long publication content', () => {
    const content = 'Contenido academico '.repeat(30);
    const { container } = render(<ExpandableText>{content}</ExpandableText>);

    const paragraph = container.querySelector('p');
    expect(paragraph).toHaveClass('line-clamp-4');
    fireEvent.click(screen.getByRole('button', { name: 'Leer mas' }));
    expect(paragraph).not.toHaveClass('line-clamp-4');
    fireEvent.click(screen.getByRole('button', { name: 'Leer menos' }));
    expect(paragraph).toHaveClass('line-clamp-4');
  });
});
