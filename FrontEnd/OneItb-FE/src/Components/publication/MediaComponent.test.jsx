import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MediaComponent from './MediaComponent';

describe('MediaComponent', () => {
  it('renders YouTube and persisted attachments together', () => {
    render(
      <MockedProvider>
        <MediaComponent
          textContext="Mira https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          attachments={[
            {
              id: 'attachment-1',
              fileUrl: '/uploads/hashed-name.pdf',
              originalFileName: 'OneITB.pdf',
              contentType: 'application/pdf',
              size: 1024,
              sortOrder: 0,
            },
          ]}
        />
      </MockedProvider>,
    );

    expect(screen.getByText('Video de YouTube')).toBeInTheDocument();
    expect(screen.getByText('OneITB.pdf')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reproducir video de youtube/i })).toBeInTheDocument();
  });
});
