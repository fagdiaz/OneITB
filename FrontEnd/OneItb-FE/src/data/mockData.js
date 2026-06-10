export const initialData = {
  personalInfo: {
    name: 'Alejandro Silva',
    title: 'Senior Software Engineer',
    email: 'alejandro.silva@email.com',
    phone: '+54 11 9876-5432',
    location: 'Buenos Aires, Argentina',
    linkedin: 'linkedin.com/in/alejandrosilva',
    github: 'github.com/alesilva',
    website: 'alejandrosilva.dev',
    profileImage: 'https://ui-avatars.com/api/?name=Alejandro+Silva&background=0f172a&color=fff&size=128'
  },
  summary: 'Ingeniero de Software con más de 6 años de experiencia especializándose en el desarrollo de aplicaciones web de alto rendimiento. Experto en React, TypeScript, Node.js y arquitectura de frontend moderna. Apasionado por escribir código limpio, mantenible y optimizar la experiencia de usuario y rendimiento a escala.',
  experience: [
    {
      id: 'exp-1',
      company: 'TechFlow Solutions',
      role: 'Lead Frontend Engineer',
      startDate: '2023-03',
      endDate: 'Presente',
      location: 'Buenos Aires (Remoto)',
      description: 'Liderazgo técnico de un equipo de 5 ingenieros. Migración exitosa de la plataforma principal a una arquitectura Next.js y TypeScript, mejorando los tiempos de carga en un 40%. Implementación de una biblioteca interna de componentes UI de alto rendimiento.'
    },
    {
      id: 'exp-2',
      company: 'MercadoLibre',
      role: 'Senior React Developer',
      startDate: '2020-07',
      endDate: '2023-02',
      location: 'Buenos Aires, Argentina',
      description: 'Desarrollo de nuevas funcionalidades clave para el panel de vendedores, impactando a millones de usuarios diarios. Optimización de renderizado React reduciendo el consumo de memoria del cliente en un 25%. Diseño e integración de servicios RESTful robustos.'
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Universidad de Buenos Aires',
      degree: 'Licenciatura en Análisis de Sistemas',
      startDate: '2016-03',
      endDate: '2021-12',
      location: 'Buenos Aires, Argentina',
      description: 'Promedio destacado. Especialización en Ingeniería de Software y Estructuras de Datos.'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'UltraEdit CV',
      role: 'Creador & Mantenedor',
      startDate: '2025-01',
      endDate: '2025-03',
      url: 'github.com/alesilva/ultraedit-cv',
      description: 'Una aplicación reactiva de código abierto para redactar CV profesionales listos para impresión A4 e indexación por sistemas ATS.'
    },
    {
      id: 'proj-2',
      name: 'Reactive State Store',
      role: 'Autor Principal',
      startDate: '2022-10',
      endDate: '2022-12',
      url: 'github.com/alesilva/reactive-state',
      description: 'Micro-biblioteca de gestión de estado global ultra liviana (<1KB gzipped) construida en TypeScript para aplicaciones React.'
    }
  ],
  skills: [
    { id: 'sk-1', name: 'React' },
    { id: 'sk-2', name: 'TypeScript' },
    { id: 'sk-3', name: 'Next.js' },
    { id: 'sk-4', name: 'Node.js' },
    { id: 'sk-5', name: 'Tailwind CSS' },
    { id: 'sk-6', name: 'GraphQL' },
    { id: 'sk-7', name: 'Web Performance' },
    { id: 'sk-8', name: 'Clean Code' }
  ],
  languages: [
    { id: 'lang-1', name: 'Español', level: 'Nativo' },
    { id: 'lang-2', name: 'Inglés', level: 'C1 - Avanzado' }
  ]
};
