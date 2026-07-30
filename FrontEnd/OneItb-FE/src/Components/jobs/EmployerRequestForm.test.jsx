import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SUBMIT_EMPLOYER_REQUEST } from '../../data/graphql/employerRequests';
import { EmployerRequestForm } from './EmployerRequestForm';

describe('EmployerRequestForm', () => {
  it('submits normalized data once and renders the generic acceptance state', async () => {
    const input = {
      companyName: 'Empresa Demo',
      contactName: 'Marina López',
      email: 'contacto@empresa.com.ar',
      phone: '+54 9 11 2233 4455',
      taxId: '30123456781',
      comments: 'Buscamos estudiantes.',
      privacyConsent: true,
      website: '',
    };
    const mocks = [{
      request: {
        query: SUBMIT_EMPLOYER_REQUEST,
        variables: { input },
      },
      result: {
        data: {
          submitEmployerRequest: {
            accepted: true,
            referenceCode: 'ABC1234567',
            message: 'Recibimos la solicitud.',
          },
        },
      },
    }];

    render(
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <EmployerRequestForm />
        </MemoryRouter>
      </MockedProvider>,
    );

    fireEvent.change(screen.getByLabelText('Empresa *'), { target: { value: input.companyName } });
    fireEvent.change(screen.getByLabelText('Contacto responsable *'), { target: { value: input.contactName } });
    fireEvent.change(screen.getByLabelText('Correo laboral *'), { target: { value: 'CONTACTO@EMPRESA.COM.AR' } });
    fireEvent.change(screen.getByLabelText('Teléfono *'), { target: { value: input.phone } });
    fireEvent.change(screen.getByLabelText('CUIT *'), { target: { value: '30-12345678-1' } });
    fireEvent.change(screen.getByLabelText('Comentarios'), { target: { value: input.comments } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

    expect(await screen.findByRole('heading', { name: 'Solicitud recibida' })).toBeInTheDocument();
    expect(screen.getByText(/ABC1234567/)).toBeInTheDocument();
  });

  it('prevents submission without privacy consent', () => {
    render(
      <MockedProvider>
        <MemoryRouter>
          <EmployerRequestForm />
        </MemoryRouter>
      </MockedProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

    expect(screen.getByRole('alert')).toHaveTextContent('nombre de la empresa');
  });
});
