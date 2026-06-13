import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_SUBJECTS } from '../../data/graphql/queries/subjects';
import { ADD_SUBJECT, UPDATE_SUBJECT, TOGGLE_SUBJECT_STATUS } from '../../data/graphql/mutations/subjects';

export const SubjectManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [feedback, setFeedback] = useState(null);

  const { data, loading, error, refetch } = useQuery(GET_SUBJECTS, {
    fetchPolicy: 'cache-and-network'
  });
  
  const [addSubject, { loading: adding }] = useMutation(ADD_SUBJECT, {
    refetchQueries: [{ query: GET_SUBJECTS }],
    awaitRefetchQueries: true
  });
  
  const [updateSubject, { loading: updating }] = useMutation(UPDATE_SUBJECT, {
    refetchQueries: [{ query: GET_SUBJECTS }],
    awaitRefetchQueries: true
  });

  const [toggleStatus, { loading: toggling }] = useMutation(TOGGLE_SUBJECT_STATUS, {
    refetchQueries: [{ query: GET_SUBJECTS }],
    awaitRefetchQueries: true
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
          <p className="text-sm text-slate-500">Catalogo academico disponible para publicaciones.</p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={() => {
              setEditingSubject(null);
              setFormData({ code: '', name: '' });
              setIsModalOpen(true);
            }} 
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Nueva Materia
          </button>
          <button type="button" onClick={() => refetch()} className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100">
            Actualizar
          </button>
        </div>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-800">
              {editingSubject ? 'Editar Materia' : 'Nueva Materia'}
            </h3>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  if (editingSubject) {
                    await updateSubject({ variables: { id: editingSubject.id, code: formData.code, name: formData.name } });
                    setFeedback({ type: 'success', message: 'Materia actualizada.' });
                  } else {
                    await addSubject({ variables: { code: formData.code, name: formData.name } });
                    setFeedback({ type: 'success', message: 'Materia creada.' });
                  }
                  setIsModalOpen(false);
                  setFormData({ code: '', name: '' });
                  setEditingSubject(null);
                } catch (err) {
                  setFeedback({ type: 'error', message: err.message });
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Codigo</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ej. BDD"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Nombre de la Materia</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Base de Datos"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingSubject(null);
                    setFormData({ code: '', name: '' });
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={adding || updating || !formData.code || !formData.name}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingSubject ? 'Guardar Cambios' : 'Crear Materia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Codigo</th>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td className="px-5 py-4">
                    <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600">{subject.code}</span>
                  </td>
                  <td className="px-5 py-4">
                    <p className={`font-semibold ${subject.isActive ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                      {subject.name}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingSubject(subject);
                          setFormData({ code: subject.code, name: subject.name });
                          setIsModalOpen(true);
                        }}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await toggleStatus({ variables: { id: subject.id } });
                          } catch (err) {
                            setFeedback({ type: 'error', message: err.message });
                          }
                        }}
                        disabled={toggling}
                        className={`rounded-lg px-2 py-1 text-xs font-medium disabled:opacity-50 ${
                          subject.isActive
                            ? 'text-red-500 hover:bg-red-50 hover:text-red-700'
                            : 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {subject.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
