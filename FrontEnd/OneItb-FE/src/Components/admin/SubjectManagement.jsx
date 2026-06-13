import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_SUBJECTS } from '../../data/graphql/queries/subjects';

export const SubjectManagement = () => {
  const { data, loading, error, refetch } = useQuery(GET_SUBJECTS, {
    fetchPolicy: 'cache-and-network'
  });
  const subjects = data?.subjects ?? [];

  if (loading && subjects.length === 0) {
    return <p className="p-8 text-center text-sm text-slate-500">Cargando materias...</p>;
  }

  if (error) {
    return <p className="p-8 text-center text-sm text-red-600">Error: {error.message}</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Materias</h2>
          <p className="text-sm text-slate-500">Catálogo académico disponible para publicaciones.</p>
        </div>
        <button type="button" onClick={() => refetch()} className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600">
          Actualizar
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => (
          <article key={subject.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600">{subject.code}</span>
            <h3 className="mt-3 font-semibold text-slate-800">{subject.name}</h3>
          </article>
        ))}
      </div>
    </section>
  );
};
