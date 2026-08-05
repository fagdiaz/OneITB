import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Register } from './Register';

const mocks = vi.hoisted(() => ({
  addUser: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('../../hooks/useForm', () => ({
  useForm: () => ({
    form: {
      name: 'Ana',
      surname: 'Perez',
      email: 'ana.perez@itbeltran.com.ar',
      password: 'Test1234!',
      confirmPassword: 'Test1234!',
      role: 'Estudiante',
    },
    changed: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mocks.navigate,
}));

vi.mock('@apollo/client', async (importOriginal) => ({
  ...(await importOriginal()),
  useMutation: () => [mocks.addUser, { loading: false }],
  useQuery: () => ({
    data: {
      careers: [
        { id: 1, name: 'Analisis de Sistemas', code: 'TSAS', isActive: true },
        { id: 2, name: 'Radiologia', code: 'TERA', isActive: true },
      ],
    },
    loading: false,
    error: undefined,
  }),
}));

describe('Register academic career selection', () => {
  beforeEach(() => {
    mocks.addUser.mockReset();
    mocks.addUser.mockResolvedValue({ data: { registerUserAsync: { success: true } } });
    mocks.navigate.mockReset();
  });

  it('allows exactly one career and submits only the latest selection', async () => {
    render(<Register />);

    const systems = screen.getByRole('radio', { name: /TSAS - Analisis de Sistemas/i });
    const radiology = screen.getByRole('radio', { name: /TERA - Radiologia/i });
    fireEvent.click(systems);
    expect(systems).toBeChecked();

    fireEvent.click(radiology);
    expect(radiology).toBeChecked();
    expect(systems).not.toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

    await waitFor(() => expect(mocks.addUser).toHaveBeenCalledWith({
      variables: {
        input: {
          firstName: 'Ana',
          lastName: 'Perez',
          email: 'ana.perez@itbeltran.com.ar',
          password: 'Test1234!',
          role: 'Estudiante',
          careerIds: [2],
        },
      },
    }));
  });
});
