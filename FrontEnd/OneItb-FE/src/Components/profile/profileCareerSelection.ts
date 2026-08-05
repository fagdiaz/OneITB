export const STUDENT_ROLE = 'Estudiante';

const normalizedCareerIds = (values: number[]): number[] => (
  [...new Set(values.filter((id) => Number.isInteger(id) && id > 0))]
);

export const selectCareerForRole = (
  role: string | undefined,
  currentValues: number[],
  careerId: number,
): number[] => {
  if (role === STUDENT_ROLE) return [careerId];

  const current = normalizedCareerIds(currentValues);
  return current.includes(careerId)
    ? current.filter((id) => id !== careerId)
    : [...current, careerId];
};

export const validateCareerSelectionForRole = (
  role: string | undefined,
  values: number[],
): string => {
  const careerIds = normalizedCareerIds(values);
  if (role === STUDENT_ROLE && careerIds.length !== 1) {
    return 'Como estudiante debes seleccionar exactamente una carrera.';
  }
  if (careerIds.length === 0) {
    return 'Selecciona al menos una carrera.';
  }
  return '';
};

export const hasCareerSelectionChanged = (
  previousValues: number[],
  nextValues: number[],
): boolean => {
  const previous = normalizedCareerIds(previousValues).sort((left, right) => left - right);
  const next = normalizedCareerIds(nextValues).sort((left, right) => left - right);
  return previous.length !== next.length
    || previous.some((careerId, index) => careerId !== next[index]);
};
