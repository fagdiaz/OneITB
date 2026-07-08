import React, { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { useForm } from '../../hooks/useForm'
import { ADD_USER } from '../../data/graphql/mutations/addUser'
import { GET_CAREERS } from '../../data/graphql/queries/careers'

const PUBLIC_ROLES = ['Estudiante', 'Profesor', 'Egresado']

export const Register = () => {
  const { form, changed } = useForm({ role: 'Estudiante' })
  const navigate = useNavigate()
  const [saved, setSaved] = useState('not_sended')
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedCareerIds, setSelectedCareerIds] = useState([])

  const [addUser, { loading: addUserLoading }] = useMutation(ADD_USER)
  const { data: careersData, loading: careersLoading, error: careersError } = useQuery(GET_CAREERS, {
    fetchPolicy: 'cache-and-network',
  })

  const careerOptions = useMemo(
    () => (careersData?.careers ?? []).filter((career) => career?.isActive !== false),
    [careersData],
  )

  const passwordsMismatch = Boolean(
    form.confirmPassword &&
    form.password &&
    form.password !== form.confirmPassword,
  )

  const setValidationError = (message) => {
    setErrorMessage(message)
    setSaved('validation_error')
  }

  const handleCareerToggle = (careerId) => {
    setSaved('not_sended')
    setSelectedCareerIds((current) =>
      current.includes(careerId)
        ? current.filter((id) => id !== careerId)
        : [...current, careerId],
    )
  }

  const saveUser = async (e) => {
    e.preventDefault()
    setSaved('not_sended')
    setErrorMessage('')

    if (!form.name?.trim()) return setValidationError('El campo Nombre es obligatorio.')
    if (!form.surname?.trim()) return setValidationError('El campo Apellidos es obligatorio.')
    if (!form.email?.trim()) return setValidationError('El campo Correo electrónico es obligatorio.')
    if (!form.password) return setValidationError('El campo Contraseña es obligatorio.')
    if (!form.confirmPassword) return setValidationError('Confirma la contraseña.')

    const emailPattern = /^[a-zA-Z0-9._%+-]+@itbeltran\.com\.ar$/
    if (!emailPattern.test(form.email)) {
      return setValidationError('Se requiere un correo institucional @itbeltran.com.ar.')
    }
    if (form.password.length < 8) {
      return setValidationError('La contraseña debe tener al menos 8 caracteres.')
    }
    if (form.password !== form.confirmPassword) {
      return setValidationError('Las contraseñas no coinciden.')
    }
    if (!PUBLIC_ROLES.includes(form.role)) {
      return setValidationError('Selecciona un rol válido.')
    }
    if (selectedCareerIds.length === 0) {
      return setValidationError('Selecciona al menos una carrera.')
    }

    const variables = {
      input: {
        firstName: form.name,
        lastName: form.surname,
        email: form.email,
        password: form.password,
        role: form.role,
        careerIds: selectedCareerIds,
      },
    }

    try {
      await addUser({ variables })
      navigate('/login', {
        replace: true,
        state: {
          registrationSuccess: 'Cuenta creada correctamente. Ya podes iniciar sesion.',
        },
      })
    } catch (err) {
      setSaved('error')
      setErrorMessage(err.message || 'No se pudo registrar el usuario.')
    }
  }

  const inputClass = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition'
  const labelClass = 'text-sm font-medium text-slate-700'

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
              <i className="fa-solid fa-user-plus text-white text-lg" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Crear Cuenta</h1>
            <p className="text-sm text-slate-500 mt-1">Registrate en la comunidad ITB</p>
          </div>

          {(saved === 'error' || saved === 'validation_error') && (
            <div className="mb-4 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
              <i className="fa-solid fa-circle-exclamation mt-0.5 shrink-0" />
              <span>{errorMessage || 'Error al registrar el usuario.'}</span>
            </div>
          )}

          <form onSubmit={saveUser} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className={labelClass}>Nombre</label>
                <input id="name" type="text" name="name" onChange={changed} placeholder="Ej. Juan" className={inputClass} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="surname" className={labelClass}>Apellidos</label>
                <input id="surname" type="text" name="surname" onChange={changed} placeholder="Ej. Perez Garcia" className={inputClass} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="role" className={labelClass}>Rol</label>
                <select id="role" name="role" value={form.role || 'Estudiante'} onChange={changed} className={inputClass}>
                  {PUBLIC_ROLES.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className={labelClass}>Correo institucional</label>
              <input id="email" type="email" name="email" onChange={changed} placeholder="usuario@itbeltran.com.ar" className={inputClass} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className={labelClass}>Contraseña</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    onChange={changed}
                    placeholder="Mínimo 8 caracteres"
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 transition hover:text-slate-700"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className={labelClass}>Confirmar contraseña</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    onChange={changed}
                    placeholder="Repetí la contraseña"
                    className={`${inputClass} pr-11 ${passwordsMismatch ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20' : ''}`}
                  />
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 transition hover:text-slate-700"
                    aria-label={showConfirmPassword ? 'Ocultar confirmacion' : 'Mostrar confirmacion'}
                  >
                    <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                  </button>
                </div>
                {passwordsMismatch && (
                  <span className="text-xs font-semibold text-red-600">Las contraseñas no coinciden.</span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-slate-700">Carreras</label>
                <span className="text-xs font-medium text-slate-500">
                  {selectedCareerIds.length || 0} seleccionada{selectedCareerIds.length === 1 ? '' : 's'}
                </span>
              </div>

              {careersLoading && <p className="mt-2 text-sm text-slate-500">Cargando carreras...</p>}
              {careersError && <p className="mt-2 text-sm font-semibold text-red-600">No se pudieron cargar las carreras.</p>}

              <div className="mt-3 grid max-h-44 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {careerOptions.map((career) => (
                  <label
                    key={career.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      selectedCareerIds.includes(career.id)
                        ? 'border-blue-200 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-slate-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCareerIds.includes(career.id)}
                      onChange={() => handleCareerToggle(career.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span className="min-w-0 truncate">
                      {career.code ? `${career.code} - ${career.name}` : career.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={addUserLoading || careersLoading}
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
