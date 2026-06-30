import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { GET_USER_PROFILE } from '../../data/graphql/queries/getUserProfile'
import { UPDATE_PROFILE } from '../../data/graphql/mutations/updateProfile'
import { GET_CAREERS, GET_MY_CAREERS } from '../../data/graphql/queries/careers'
import { LINK_USER_TO_CAREERS } from '../../data/graphql/mutations/careers'
import useAuth from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

/**
 * EditProfile — REFACTOR 037
 * Full Tailwind rewrite. Eliminates: content__header, content__title,
 * content__posts, form-login, form-group, alert classes, all inline styles.
 * All GraphQL logic is 100% preserved.
 */
export const EditProfile = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  const { data, loading } = useQuery(GET_USER_PROFILE, {
    fetchPolicy: 'network-only'
  });
  const { data: careersData, loading: careersLoading } = useQuery(GET_CAREERS);
  const { data: myCareersData, loading: myCareersLoading } = useQuery(GET_MY_CAREERS, {
    fetchPolicy: 'network-only'
  });

  const [formState, setFormState] = useState({
    biography: '',
    phone: '',
    linkedIn: '',
    facebook: '',
    instagram: ''
  });

  const [selectedCareers, setSelectedCareers] = useState([]);
  const [saved, setSaved] = useState('not_sended');

  useEffect(() => {
    if (data?.me) {
      const activeUser = data.me;
      if (activeUser) {
        setFormState({
          biography: activeUser.biography || '',
          phone: activeUser.phone || '',
          linkedIn: activeUser.linkedIn || '',
          facebook: activeUser.facebook || '',
          instagram: activeUser.instagram || ''
        });
      }
    }
  }, [data]);

  useEffect(() => {
    if (myCareersData?.myCareers) {
      setSelectedCareers(myCareersData.myCareers.map(c => c.id));
    }
  }, [myCareersData]);

  const [updateProfile, { loading: updateLoading }] = useMutation(UPDATE_PROFILE);
  const [linkUserToCareers, { loading: linkLoading }] = useMutation(LINK_USER_TO_CAREERS);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const variables = {
        input: {
          id: auth.id,
          biography: formState.biography,
          phone: formState.phone,
          linkedIn: formState.linkedIn,
          facebook: formState.facebook,
          instagram: formState.instagram
        }
      };
      const { data: updateData } = await updateProfile({ variables });
      await linkUserToCareers({ variables: { careerIds: selectedCareers }, refetchQueries: [{ query: GET_MY_CAREERS }] });

      if (updateData?.updateProfile?.success) {
        setSaved('saved');
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        setSaved('error');
      }
    } catch (err) {
      console.error(err);
      setSaved('error');
    }
  };

  const handleToggleCareer = (id) => {
    setSelectedCareers(current =>
      current.includes(id) ? current.filter(cId => cId !== id) : [...current, id]
    );
  };

  const inputClass = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition";
  const labelClass = "text-sm font-medium text-slate-700";

  const isSubmitting = updateLoading || linkLoading;

  if (loading || careersLoading || myCareersLoading) return (
    <div className="flex items-center justify-center min-h-full py-20">
      <div className="flex items-center gap-3 text-slate-500">
        <i className="fa-solid fa-circle-notch fa-spin text-blue-500" />
        <span className="text-sm font-medium">Cargando datos del perfil...</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-8">

      {/* Page header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
        <div className="w-1 h-7 bg-blue-600 rounded-full" />
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Editar Información Profesional</h1>
      </div>

      {/* Alerts */}
      {saved === 'saved' && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
          <i className="fa-solid fa-circle-check" /> Perfil actualizado. Redirigiendo...
        </div>
      )}
      {saved === 'error' && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
          <i className="fa-solid fa-circle-exclamation" /> Error al actualizar el perfil. Reintentá.
        </div>
      )}

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <label htmlFor="biography" className={labelClass}>Biografía / Acerca de mí</label>
            <textarea
              id="biography"
              name="biography"
              value={formState.biography}
              onChange={handleInputChange}
              rows={4}
              placeholder="Escribe algo sobre ti, tu perfil profesional y académico..."
              className={`${inputClass} resize-vertical`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className={labelClass}>Número de Teléfono</label>
            <input id="phone" type="text" name="phone" value={formState.phone} onChange={handleInputChange} placeholder="+54 9 11 1234-5678" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="linkedIn" className={labelClass}>
              <i className="fa-brands fa-linkedin text-blue-600 mr-1.5" /> LinkedIn
            </label>
            <input id="linkedIn" type="text" name="linkedIn" value={formState.linkedIn} onChange={handleInputChange} placeholder="linkedin.com/in/usuario" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="instagram" className={labelClass}>
              <i className="fa-brands fa-instagram text-pink-500 mr-1.5" /> Instagram
            </label>
            <input id="instagram" type="text" name="instagram" value={formState.instagram} onChange={handleInputChange} placeholder="instagram.com/usuario" className={inputClass} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="facebook" className={labelClass}>
              <i className="fa-brands fa-facebook text-blue-500 mr-1.5" /> Facebook
            </label>
            <input id="facebook" type="text" name="facebook" value={formState.facebook} onChange={handleInputChange} placeholder="facebook.com/usuario" className={inputClass} />
          </div>

          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
            <label className={labelClass}>Mis Carreras (Enrolamiento)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              {careersData?.careers?.map(career => (
                <label key={career.id} className="flex items-start gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCareers.includes(career.id)}
                    onChange={() => handleToggleCareer(career.id)}
                    className="mt-0.5 w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500 transition-colors"
                  />
                  <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                    {career.name}
                  </span>
                </label>
              ))}
            </div>
            {careersData?.careers?.length === 0 && (
              <span className="text-sm text-slate-400 italic">No hay carreras disponibles en el sistema.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm mt-4"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>

        </form>
      </div>
    </div>
  )
}
