import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { MentionText } from './MentionText';

describe('MentionText', () => {
  it('links a mention only when it matches a persisted user identity', () => {
    render(
      <MemoryRouter>
        <MentionText text="@Beto gracias, @desconocido" users={[{ id: 'user-2', firstName: 'Beto', fullName: 'Beto Docente' }]} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: '@Beto' })).toHaveAttribute('href', '/profile/user-2');
    expect(screen.queryByRole('link', { name: '@desconocido' })).not.toBeInTheDocument();
    expect(screen.getByText(/@desconocido/)).toBeInTheDocument();
  });
});
