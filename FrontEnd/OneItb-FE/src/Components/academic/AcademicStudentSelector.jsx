import React from 'react';

export const AcademicStudentSelector = ({
  value,
  onChange,
  students,
  totalCount,
  subjectSelected,
  loading,
  loadingMore,
  hasNextPage,
  error,
  onLoadMore,
}) => (
  <div>
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Estudiante</span>
      <select
        value={value}
        onChange={onChange}
        disabled={!subjectSelected || (loading && students.length === 0)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-200"
      >
        <option value="">
          {loading && students.length === 0
            ? 'Cargando estudiantes...'
            : 'Selecciona un estudiante'}
        </option>
        {students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.lastName}, {student.firstName}
          </option>
        ))}
      </select>
    </label>

    {subjectSelected && !loading && !error && students.length === 0 && (
      <p className="mt-2 text-xs font-semibold text-slate-500">No hay estudiantes elegibles en esta carrera.</p>
    )}
    {error && (
      <p role="alert" className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
        No se pudo cargar el listado de estudiantes.
      </p>
    )}
    {students.length > 0 && (
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-400">
          {students.length} de {totalCount} estudiantes
        </span>
        {hasNextPage && (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-200"
          >
            {loadingMore ? 'Cargando...' : 'Cargar mas'}
          </button>
        )}
      </div>
    )}
  </div>
);
