import { CVData } from '../../types/resume';

export const completeCvFixture: CVData = {
  personalInfo: {
    name: 'Álex Álvarez',
    title: 'Analista de Sistemas',
    email: 'alex.alvarez@example.test',
    phone: '+54 11 5555 0101',
    location: 'Tecnicatura Superior en Análisis de Sistemas',
    linkedin: 'https://www.linkedin.com/in/alex-alvarez',
    github: 'https://github.com/alex-alvarez',
    website: 'https://portfolio.example.test',
    profileImage: 'https://images.example.test/avatar.jpg',
  },
  summary: 'Profesional orientado a soluciones accesibles, mantenibles y medibles.',
  skills: [
    { id: 'skill-1', name: 'C#', level: 'Avanzado' },
    { id: 'skill-2', name: 'React', level: 'Intermedio' },
    { id: 'skill-hidden', name: 'Habilidad privada', hidden: true },
  ],
  experience: [
    {
      id: 'experience-1',
      company: 'Cooperativa Técnica',
      role: 'Desarrollador Full-Stack',
      startDate: '2024',
      endDate: 'Actualidad',
      location: 'Avellaneda, Buenos Aires',
      description: 'Diseño e implementación de servicios web y experiencias accesibles.',
    },
  ],
  projects: [
    {
      id: 'project-1',
      name: 'Portal académico',
      role: 'Arquitectura e implementación',
      startDate: '2025',
      endDate: '2026',
      url: 'https://project.example.test',
      description: 'Integración de comunidad, trayectoria académica y empleabilidad.',
    },
  ],
  education: [
    {
      id: 'education-1',
      institution: 'Instituto Tecnológico de ejemplo',
      degree: 'Tecnicatura Superior en Análisis de Sistemas',
      startDate: '2023',
      endDate: '2026',
      description: 'Formación técnica con práctica profesionalizante.',
    },
  ],
  languages: [
    { id: 'language-1', name: 'Español', level: 'Nativo' },
    { id: 'language-2', name: 'Inglés', level: 'Intermedio' },
  ],
};

export const emptyCvFixture: CVData = {
  personalInfo: {
    name: 'Usuario OneITB',
    title: '',
    email: '',
  },
  summary: '',
  skills: [],
  experience: [],
  projects: [],
  education: [],
  languages: [],
};

export const longCvFixture: CVData = {
  ...completeCvFixture,
  experience: Array.from({ length: 12 }, (_, index) => ({
    ...completeCvFixture.experience[0],
    id: `experience-${index + 1}`,
    role: `Responsabilidad técnica ${index + 1}`,
    description: `${completeCvFixture.experience[0].description} Resultado verificable número ${index + 1}.`,
  })),
  projects: Array.from({ length: 8 }, (_, index) => ({
    ...completeCvFixture.projects[0],
    id: `project-${index + 1}`,
    name: `Proyecto institucional ${index + 1}`,
  })),
};
