import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Login } from './Login';

const state = vi.hoisted(() => ({
  microsoftAvailable: false,
}));

vi.mock('../../auth/microsoftEntra', () => ({
  isMicrosoftIdentityAvailable: () => state.microsoftAvailable,
}));

vi.mock('../auth/MicrosoftInstitutionalLogin', () => ({
  MicrosoftInstitutionalLogin: () => (
    <button type="button">Continuar con Microsoft 365</button>
  ),
}));

vi.mock('../../hooks/useAuth', () => ({
  default: () => ({ login: vi.fn() }),
}));

vi.mock('../../hooks/useForm', () => ({
  useForm: () => ({ form: {}, changed: vi.fn() }),
}));

vi.mock('@apollo/client', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useMutation: () => [vi.fn(), { loading: false, error: undefined }],
  };
});

describe('Login Microsoft visibility', () => {
  beforeEach(() => {
    state.microsoftAvailable = false;
    sessionStorage.clear();
  });

  it('hides Microsoft access when the shared configuration is unavailable', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(
      screen.queryByRole('button', { name: 'Continuar con Microsoft 365' }),
    ).not.toBeInTheDocument();
  });

  it('shows Microsoft access when the shared provider is available', () => {
    state.microsoftAvailable = true;
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(
      screen.getByRole('button', { name: 'Continuar con Microsoft 365' }),
    ).toBeInTheDocument();
  });
});
