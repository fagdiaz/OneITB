import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CVATSPrintTemplate } from './CVATSPrintTemplate';
import { completeCvFixture, emptyCvFixture, longCvFixture } from './cvAtsFixtures';

describe('CVATSPrintTemplate', () => {
  it('renders one semantic, linear and machine-readable document', () => {
    const { container } = render(<CVATSPrintTemplate data={completeCvFixture} />);
    const document = screen.getByRole('document', { name: 'Currículum optimizado para ATS' });
    const sectionOrder = Array.from(document.querySelectorAll('[data-ats-section]'))
      .map((section) => section.getAttribute('data-ats-section'));

    expect(sectionOrder).toEqual([
      'contact',
      'summary',
      'skills',
      'experience',
      'projects',
      'education',
      'languages',
    ]);
    expect(container.querySelector('img, canvas, table')).toBeNull();
    expect(document.className).not.toMatch(/grid-cols|overflow-hidden|h-\[297mm\]/);
    expect(screen.getByText('Álex Álvarez', { exact: false })).toBeTruthy();
  });

  it('keeps visible links and excludes hidden values', () => {
    render(<CVATSPrintTemplate data={completeCvFixture} />);

    expect(screen.getByRole('link', { name: completeCvFixture.personalInfo.email })).toHaveAttribute(
      'href',
      `mailto:${completeCvFixture.personalInfo.email}`,
    );
    expect(screen.getByRole('link', { name: completeCvFixture.personalInfo.linkedin })).toHaveAttribute(
      'href',
      expect.stringMatching(/^https:\/\//),
    );
    expect(screen.queryByText('Habilidad privada')).not.toBeInTheDocument();
  });

  it('omits empty sections without inventing placeholder content', () => {
    render(<CVATSPrintTemplate data={emptyCvFixture} />);

    expect(screen.getByText('Usuario OneITB')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('keeps legacy invalid contact text without creating unsafe empty links', () => {
    render(
      <CVATSPrintTemplate
        data={{
          ...emptyCvFixture,
          personalInfo: {
            ...emptyCvFixture.personalInfo,
            email: 'correo-incompleto',
            phone: 'sin número',
          },
        }}
      />,
    );

    expect(screen.getByText('correo-incompleto')).toBeInTheDocument();
    expect(screen.getByText('sin número')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('does not truncate bounded arrays in a long CV', () => {
    render(<CVATSPrintTemplate data={longCvFixture} />);

    expect(screen.getByText('Responsabilidad técnica 12')).toBeInTheDocument();
    expect(screen.getByText('Proyecto institucional 8')).toBeInTheDocument();
  });
});
