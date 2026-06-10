import React, { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { GET_USERS } from '../../data/graphql/queries/getUsers'
import { useForm } from '../../hooks/useForm'
import { ADD_USER } from '../../data/graphql/mutations/addUser'

/**
 * Register — REFACTOR 037
 * Full Tailwind rewrite. Eliminates: content__header, content__title,
 * content__posts, register-form, form-group, btn, alert classes.
 * All validation logic is 100% preserved.
 */
export const Register = () => {
  const { loading, error } = useQuery(GET_USERS);
  const { form, changed } = useForm({});
  const [saved, setSaved] = useState('not_sended');
  const [errorMessage, setErrorMessage] = useState('');

  const saveUser = async (e) => {
    e.preventDefault();

    if (!form.name) { setErrorMessage('El campo Nombre es obligatorio.'); setSaved('validation_error'); return; }
    if (!form.surname) { setErrorMessage('El campo Apellidos es obligatorio.'); setSaved('validation_error'); return; }
    if (!form.alias) { setErrorMessage('El campo Alias es obligatorio.'); setSaved('validation_error'); return; }
    if (!form.email) { setErrorMessage('El campo Correo electrónico es obligatorio.'); setSaved('validation_error'); return; }
    if (!form.password) { setErrorMessage('El campo Contraseña es obligatorio.'); setSaved('validation_error'); return; }
    if (form.alias.length < 3) { setErrorMessage('El alias debe tener al menos 3 caracteres.'); setSaved('validation_error'); return; }

    const emailPattern = /^[a-zA-Z0-9_\-\.]+@itbeltran\.com\.ar$/;
    if (!emailPattern.test(form.email)) { setErrorMessage('El correo debe pertenecer al dominio @itbeltran.com.ar.'); setSaved('validation_error'); return; }
    if (form.password.length < 8) { setErrorMessage('La contraseña debe tener al menos 8 caracteres.'); setSaved('validation_error'); return; }

    const variables = {
      input: {
        username: form.alias,
        firstName: form.name,
        lastName: form.surname,
        email: form.email,
        password: form.password,
        enrolledCareers: []
      }
    };

    console.log('Datos a enviar a GraphQL:', variables);

    try {
      const { data } = await addUser({ variables });
      setSaved('saved');
      console.log(data);
    } catch (err) {
      console.log(err);
      setSaved('error');
      setErrorMessage(err.message);
    }
  };

  const [addUser, { loading: addUserLoading }] = useMutation(ADD_USER);

  const inputClass = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition";
  const labelClass = "text-sm font-medium text-slate-700";

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
              <i className="fa-solid fa-user-plus text-white text-lg" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Crear Cuenta</h1>
            <p className="text-sm text-slate-500 mt-1">Registrate en la comunidad ITB</p>
          </div>

          {/* Alerts */}
          {saved === 'saved' && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium">
              <i className="fa-solid fa-circle-check" /> Usuario registrado correctamente.
            </div>
          )}
          {(saved === 'error' || saved === 'validation_error') && (
            <div className="mb-4 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
              <i className="fa-solid fa-circle-exclamation mt-0.5 shrink-0" />
              <span>{errorMessage || 'Error al registrar el usuario.'}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={saveUser} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className={labelClass}>Nombre</label>
              <input id="name" type="text" name="name" onChange={changed} placeholder="Ej. Juan" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="surname" className={labelClass}>Apellidos</label>
              <input id="surname" type="text" name="surname" onChange={changed} placeholder="Ej. Pérez García" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="alias" className={labelClass}>Alias</label>
              <input id="alias" type="text" name="alias" onChange={changed} placeholder="Mínimo 3 caracteres" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className={labelClass}>Correo institucional</label>
              <input id="email" type="email" name="email" onChange={changed} placeholder="usuario@itbeltran.com.ar" className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className={labelClass}>Contraseña</label>
              <input id="password" type="password" name="password" onChange={changed} placeholder="Mínimo 8 caracteres" className={inputClass} />
            </div>

            <button
              type="submit"
              disabled={addUserLoading}
              className="w-full mt-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              {addUserLoading ? 'Registrando...' : 'Registrarse'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}
