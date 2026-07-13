import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MediaGrid } from './MediaGrid';

const items = Array.from({ length: 6 }, (_, index) => ({ key: `item-${index}`, label: `Archivo ${index + 1}` }));
const renderItem = (item) => <span>{item.label}</span>;

describe('MediaGrid', () => {
  it('limits post tiles to five and exposes all items in the gallery', () => {
    render(<MediaGrid items={items} renderItem={renderItem} />);
    expect(screen.getAllByTestId('media-tile')).toHaveLength(5);
    fireEvent.click(screen.getByRole('button', { name: /ver 1 archivo adjunto mas/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Archivo 6')).toBeInTheDocument();
  });

  it('limits compact comment tiles to three', () => {
    render(<MediaGrid items={items} renderItem={renderItem} compact />);
    expect(screen.getAllByTestId('media-tile')).toHaveLength(3);
  });

  it('promotes YouTube into the visible set without displacing the cover', () => {
    const mixedItems = [
      { key: 'cover', kind: 'attachment', label: 'Portada' },
      { key: 'image-1', kind: 'attachment', label: 'Imagen 1' },
      { key: 'image-2', kind: 'attachment', label: 'Imagen 2' },
      { key: 'image-3', kind: 'attachment', label: 'Imagen 3' },
      { key: 'image-4', kind: 'attachment', label: 'Imagen 4' },
      { key: 'youtube', kind: 'youtube', label: 'Video YouTube' },
    ];
    render(<MediaGrid items={mixedItems} renderItem={renderItem} />);
    const tiles = screen.getAllByTestId('media-tile');
    expect(tiles[0]).toHaveTextContent('Portada');
    expect(screen.getByText('Video YouTube')).toBeInTheDocument();
  });
});
