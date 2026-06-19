import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_CAREERS } from '../../data/graphql/queries/careers';
import { GET_SUBJECTS } from '../../data/graphql/queries/subjects';
import { ADD_SUBJECT, UPDATE_SUBJECT, TOGGLE_SUBJECT_STATUS } from '../../data/graphql/mutations/subjects';

const emptyForm = {
  code: '',
  name: '',
  careerId: '',
  year: '',
  prerequisiteIds: [],
};

export const SubjectManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [feedback, setFeedback] = useState(null);

  const { data, loading, error, refetch } = useQuery(GET_SUBJECTS, {
    variables: { careerId: null },
    fetchPolicy: 'cache-and-network',
  });
  const {
    data: careersData,
    loading: careersLoading,
    error: careersError,
  } = useQuery(GET_CAREERS, { fetchPolicy: 'cache-and-network' });
  const [addSubject, { loading: adding }] = useMutation(ADD_SUBJECT);
  const [updateSubject, { loading: updating }] = useMutation(UPDATE_SUBJECT);
  const [toggleStatus, { loading: toggling }] = useMutation(TOGGLE_SUBJECT_STATUS);

  const subjects = data?.subjects ?? [];
  const careers = (careersData?.careers ?? []).filter((career) => career.isActive);
  const selectedCareerId = formData.careerId ? Number(formData.careerId) : null;
  const prerequisiteOptions = subjects.filter((subject) =>
    subject.isActive &&
    subject.career?.id === selectedCareerId &&
    subject.id !== editingSubject?.id
  );

  const closeForm = () => {
    setEditingSubject(null);
    setFormData(emptyForm);
    setIsModalOpen(false);
  };

  const openCreate = () => {
    setEditingSubject(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      careerId: String(subject.career?.id ?? ''),
      year: subject.year ? String(subject.year) : '',
      prerequisiteIds: (subject.prerequisites ?? []).map((item) => Number(item.id)),
    });
    setIsModalOpen(true);
  };

  const togglePrerequisite = (subjectId) => {
    const id = Number(subjectId);
    setFormData((current) => ({
      ...current,
      prerequisiteIds: current.prerequisiteIds.includes(id)
        ? current.prerequisiteIds.filter((item) => item !== id)
        : [...current.prerequisiteIds, id],
    }));
  };

  const submitSubject = async (event) => {
    event.preventDefault();
    const variables = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      careerId: Number(formData.careerId),
      year: formData.year ? Number(formData.year) : null,
      prerequisiteIds: formData.prerequisiteIds.map(Number),
    };

    try {
      if (editingSubject) {
        await updateSubject({ variables: { id: editingSubject.id, ...variables } });
        setFeedback({ type: 'success', message: 'Materia actualizada con sus reglas academicas.' });
      } else {
        await addSubject({ variables });
        setFeedback({ type: 'success', message: 'Materia creada con sus reglas academicas.' });
      }
      await refetch();
      closeForm();
    } catch (mutationError) {
      setFeedback({ type: 'error', message: mutationError.message });
    }
  };

  if (loading && subjects.length === 0) {
    return <p className="p-8 text-center text-sm text-slate-500">Cargando materias...</p>;
  }

  if (error || careersError) {
    return <p className="p-8 text-center text-sm text-red-600">Error: {(error || careersError).message}</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Materias</h2>
          <p className="text-sm text-slate-500">Catalogo academico, carrera, anio y correlatividades.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={openCreate} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
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
          className={'rounded-lg border px-4 py-3 text-sm ' + (
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          )}
        >
          {feedback.message}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-800">
              {editingSubject ? 'Editar Materia' : 'Nueva Materia'}
            </h3>
            <form onSubmit={submitSubject} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-semibold text-slate-600">
                  Codigo
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={formData.code}
                    onChange={(event) => setFormData((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
                    placeholder="Ej. BDD"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                <label className="space-y-1 text-xs font-semibold text-slate-600">
                  Nombre
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={formData.name}
                    onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Ej. Base de Datos"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-semibold text-slate-600">
                  Carrera
                  <select
                    required
                    disabled={careersLoading}
                    value={formData.careerId}
                    onChange={(event) => setFormData((current) => ({
                      ...current,
                      careerId: event.target.value,
                      prerequisiteIds: [],
                    }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar carrera...</option>
                    {careers.map((career) => (
                      <option key={career.id} value={career.id}>{career.name}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-xs font-semibold text-slate-600">
                  Anio de cursada
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.year}
                    onChange={(event) => setFormData((current) => ({ ...current, year: event.target.value }))}
                    placeholder="1 a 6 (opcional)"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-slate-600">Correlatividades</p>
                {!selectedCareerId ? (
                  <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-400">Selecciona una carrera para listar materias disponibles.</p>
                ) : prerequisiteOptions.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-400">No hay otras materias activas en esta carrera.</p>
                ) : (
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
                    {prerequisiteOptions.map((subject) => (
                      <label key={subject.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={formData.prerequisiteIds.includes(Number(subject.id))}
                          onChange={() => togglePrerequisite(subject.id)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600"
                        />
                        <span className="font-semibold text-blue-700">{subject.code}</span>
                        <span>{subject.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeForm} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={adding || updating || !formData.code.trim() || !formData.name.trim() || !formData.careerId}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {adding || updating ? 'Guardando...' : editingSubject ? 'Guardar Cambios' : 'Crear Materia'}
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
                <th className="px-5 py-3">Carrera</th>
                <th className="px-5 py-3">Anio</th>
                <th className="px-5 py-3">Correlativas</th>
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
                    <p className={'font-semibold ' + (subject.isActive ? 'text-slate-800' : 'text-slate-400 line-through')}>{subject.name}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{subject.career?.name ?? '-'}</td>
                  <td className="px-5 py-4 text-slate-600">{subject.year ?? '-'}</td>
                  <td className="max-w-xs px-5 py-4 text-slate-600">
                    {(subject.prerequisites ?? []).length > 0
                      ? subject.prerequisites.map((item) => item.name).join(', ')
                      : 'Sin correlativas'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => openEdit(subject)} className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await toggleStatus({ variables: { id: subject.id } });
                            await refetch();
                          } catch (mutationError) {
                            setFeedback({ type: 'error', message: mutationError.message });
                          }
                        }}
                        disabled={toggling}
                        className={'rounded-lg px-2 py-1 text-xs font-medium disabled:opacity-50 ' + (
                          subject.isActive
                            ? 'text-red-500 hover:bg-red-50 hover:text-red-700'
                            : 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700'
                        )}
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
