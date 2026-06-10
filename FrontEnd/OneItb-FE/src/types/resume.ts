// resume.ts — Canonical CV type definitions
// Aligned with _temp_cv_reference/cv-builder/src/types/resume.ts
// hidden is optional (boolean | undefined) to allow initialData without it.

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  profileImage?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string;
  hidden?: boolean;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string;
  hidden?: boolean;
}

export interface Project {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  url?: string;
  description?: string;
  hidden?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  level?: string;
  hidden?: boolean;
}

export interface Language {
  id: string;
  name: string;
  level?: string;
  hidden?: boolean;
}

export interface CVData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  languages: Language[];
}
