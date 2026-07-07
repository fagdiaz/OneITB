import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CertificateExport } from './CertificateExport';

const approvedProgress = [
  {
    id: 'progress-1',
    score: 9,
    status: 'APPROVED',
    updatedAt: '2026-07-06T12:00:00Z',
    subject: {
      id: 101,
      name: 'Programacion I',
      code: 'PRG1',
      career: {
        id: 10,
        name: 'Analisis de Sistemas',
      },
    },
  },
];

describe('CertificateExport', () => {
  it('renders the loading state with disabled actions', () => {
    render(<CertificateExport progress={[]} loading user={{ username: 'Sofia Alumno' }} />);

    expect(screen.getByText('Exportar progreso academico')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /descargar csv/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /imprimir constancia/i })).toBeDisabled();
  });

  it('keeps export actions disabled when there is no progress', () => {
    render(<CertificateExport progress={[]} loading={false} user={{ username: 'Sofia Alumno' }} />);

    expect(screen.getByRole('button', { name: /descargar csv/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /imprimir constancia/i })).toBeDisabled();
  });

  it('enables export actions when academic progress is available', () => {
    render(<CertificateExport progress={approvedProgress} loading={false} user={{ username: 'Sofia Alumno' }} />);

    expect(screen.getByText(/Descarga CSV para auditoria/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /descargar csv/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /imprimir constancia/i })).toBeEnabled();
  });
});
