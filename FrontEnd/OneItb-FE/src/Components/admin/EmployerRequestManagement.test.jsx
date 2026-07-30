import React from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  APPROVE_EMPLOYER_REQUEST,
  GET_EMPLOYER_REQUESTS,
} from '../../data/graphql/employerRequests';
import { EmployerRequestManagement } from './EmployerRequestManagement';

const requestId = '11111111-1111-1111-1111-111111111111';
const request = {
  __typename: 'EmployerRequest',
  id: requestId,
  companyName: 'Empresa Demo',
  contactName: 'Marina López',
  email: 'contacto@empresa.com.ar',
  phone: '+5491122334455',
  taxId: '30123456781',
  comments: 'Perfiles junior.',
  status: 'PENDING',
  rejectionReason: null,
  createdAt: '2026-07-30T12:00:00Z',
  processedAt: null,
  processedByAdminId: null,
  provisionedUserId: null,
  privacyConsentAt: '2026-07-30T12:00:00Z',
  emailDeliveryStatus: 'NOT_REQUESTED',
  lastEmailAttemptAt: null,
  emailDeliveryAttempts: 0,
};
const pageResult = {
  data: {
    employerRequests: {
      __typename: 'EmployerRequestPage',
      items: [request],
      totalCount: 1,
      hasNextPage: false,
      nextOffset: null,
    },
  },
};

describe('EmployerRequestManagement', () => {
  it('renders a pending request and confirms approval without claiming delivery', async () => {
    const queryMock = {
      request: {
        query: GET_EMPLOYER_REQUESTS,
        variables: { status: null, first: 15, offset: 0 },
      },
      result: pageResult,
    };
    const mocks = [
      queryMock,
      {
        request: {
          query: APPROVE_EMPLOYER_REQUEST,
          variables: { requestId },
        },
        result: {
          data: {
            approveEmployerRequest: {
              __typename: 'EmployerRequestActionPayload',
              accountCreated: true,
              emailDeliveryStatus: 'PENDING',
              message: 'Cuenta creada. Correo pendiente.',
              request: {
                __typename: 'EmployerRequest',
                id: requestId,
                status: 'APPROVED',
                rejectionReason: null,
                processedAt: '2026-07-30T12:05:00Z',
                processedByAdminId: '22222222-2222-2222-2222-222222222222',
                provisionedUserId: '33333333-3333-3333-3333-333333333333',
                emailDeliveryStatus: 'PENDING',
                lastEmailAttemptAt: null,
                emailDeliveryAttempts: 0,
              },
            },
          },
        },
      },
      queryMock,
    ];

    render(
      <MockedProvider mocks={mocks}>
        <EmployerRequestManagement />
      </MockedProvider>,
    );

    expect(await screen.findByText('Empresa Demo')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /aprobar/i }));
    expect(screen.getByRole('dialog')).toHaveTextContent('correo quedará pendiente');
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    expect(await screen.findByText('Empresa Demo')).toBeInTheDocument();
  });
});
