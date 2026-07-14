import React, { useEffect } from 'react';
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

  it('promotes both accepted YouTube videos into a crowded grid', () => {
    const mixedItems = [
      { key: 'cover', kind: 'attachment', label: 'Portada' },
      ...Array.from({ length: 5 }, (_, index) => ({ key: `image-${index}`, kind: 'attachment', label: `Imagen ${index}` })),
      { key: 'youtube-1', kind: 'youtube', label: 'Video uno' },
      { key: 'youtube-2', kind: 'youtube', label: 'Video dos' },
    ];

    render(<MediaGrid items={mixedItems} renderItem={renderItem} />);

    expect(screen.getByText('Video uno')).toBeInTheDocument();
    expect(screen.getByText('Video dos')).toBeInTheDocument();
  });

  it('uses a full-width top row after a landscape cover reports its dimensions', () => {
    const LandscapeProbe = ({ reportDimensions }) => {
      useEffect(() => reportDimensions?.(1600, 700), [reportDimensions]);
      return <span>Portada apaisada</span>;
    };
    const landscapeItems = [
      { key: 'cover', kind: 'attachment', label: 'Portada apaisada' },
      { key: 'secondary', kind: 'attachment', label: 'Secundaria' },
    ];
    const renderLandscape = (item, _index, _compact, metadata) => (
      item.key === 'cover'
        ? <LandscapeProbe reportDimensions={metadata.reportDimensions} />
        : <span>{item.label}</span>
    );

    render(<MediaGrid items={landscapeItems} renderItem={renderLandscape} />);

    expect(screen.getByTestId('media-grid')).toHaveAttribute('data-layout', 'landscape-cover');
    expect(screen.getByText('Portada apaisada').closest('[data-testid="media-tile"]')).toHaveClass('col-span-full');
  });
});
