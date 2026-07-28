import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AcademicStudentSelector } from './AcademicStudentSelector';

const students = [
  { id: '1', firstName: 'Ana', lastName: 'Alumna' },
  { id: '2', firstName: 'Berta', lastName: 'Alumna' },
];

const renderSelector = (overrides = {}) => {
  const props = {
    value: '',
    onChange: vi.fn(),
    students: [],
    totalCount: 0,
    subjectSelected: true,
    loading: false,
    loadingMore: false,
    hasNextPage: false,
    error: null,
    onLoadMore: vi.fn(),
    ...overrides,
  };
  render(<AcademicStudentSelector {...props} />);
  return props;
};

describe('AcademicStudentSelector', () => {
  it('renders loading and empty states without exposing an unbounded list', () => {
    const { rerender } = render(
      <AcademicStudentSelector
        value=""
        onChange={vi.fn()}
        students={[]}
        totalCount={0}
        subjectSelected
        loading
        loadingMore={false}
        hasNextPage={false}
        error={null}
        onLoadMore={vi.fn()}
      />,
    );

    expect(screen.getByRole('option', { name: 'Cargando estudiantes...' })).toBeInTheDocument();
    rerender(
      <AcademicStudentSelector
        value=""
        onChange={vi.fn()}
        students={[]}
        totalCount={0}
        subjectSelected
        loading={false}
        loadingMore={false}
        hasNextPage={false}
        error={null}
        onLoadMore={vi.fn()}
      />,
    );
    expect(screen.getByText('No hay estudiantes elegibles en esta carrera.')).toBeInTheDocument();
  });

  it('renders a bounded page and requests the next page explicitly', () => {
    const props = renderSelector({
      students,
      totalCount: 12,
      hasNextPage: true,
    });

    expect(screen.getByText('2 de 12 estudiantes')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cargar mas' }));
    expect(props.onLoadMore).toHaveBeenCalledTimes(1);
  });

  it('shows a controlled error state', () => {
    renderSelector({ error: new Error('network') });
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar');
  });
});
