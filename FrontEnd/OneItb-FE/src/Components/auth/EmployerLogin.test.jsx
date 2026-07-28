import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmployerLogin } from './EmployerLogin';
import { LOGIN_WITH_MAGIC_LINK, REQUEST_MAGIC_LINK } from '../../data/graphql/mutations/employer';

const login = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  default: () => ({ login }),
}));

const credential = 'a'.repeat(64);

describe('EmployerLogin', () => {
  afterEach(() => {
    login.mockReset();
    window.history.replaceState({}, '', '/');
  });

  it('shows a generic confirmation without rendering the credential', async () => {
    const mocks = [{
      request: {
        query: REQUEST_MAGIC_LINK,
        variables: {
          email: 'empresa@itbeltran.com.ar',
          cuit: '30712345678',
        },
      },
      result: {
        data: {
          requestMagicLink: {
            accepted: true,
            message: 'Si los datos son validos, recibiras un enlace de acceso.',
          },
        },
      },
    }];

    render(
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <EmployerLogin />
        </MemoryRouter>
      </MockedProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText('Correo corporativo'), {
      target: { value: 'empresa@itbeltran.com.ar' },
    });
    fireEvent.change(screen.getByPlaceholderText(/CUIT/), {
      target: { value: '30712345678' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));

    expect(await screen.findByText(/recibiras un enlace/i)).toBeInTheDocument();
    expect(screen.queryByDisplayValue(credential)).not.toBeInTheDocument();
  });

  it('consumes a fragment credential from memory and removes it from the URL', async () => {
    window.history.replaceState({}, '', `/employer-login#token=${credential}`);
    const accessToken = [
      window.btoa(JSON.stringify({ alg: 'none' })),
      window.btoa(JSON.stringify({ sub: '22222222-2222-2222-2222-222222222222', role: 'Empleador' })),
      'signature',
    ].join('.');
    const mocks = [{
      request: {
        query: LOGIN_WITH_MAGIC_LINK,
        variables: { token: credential },
      },
      result: {
        data: { loginWithMagicLink: accessToken },
      },
    }];

    render(
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <EmployerLogin />
        </MemoryRouter>
      </MockedProvider>,
    );

    await waitFor(() => expect(window.location.hash).toBe(''));
    expect(screen.queryByDisplayValue(credential)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /ingresar al sistema/i }));

    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
  });
});
