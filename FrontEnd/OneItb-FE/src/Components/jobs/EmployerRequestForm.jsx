import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { SUBMIT_EMPLOYER_REQUEST } from '../../data/graphql/employerRequests';

const EMPTY_FORM = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  taxId: '',
  comments: '',
  privacyConsent: false,
  website: '',
};

const normalizeTaxId = (value) => value.replace(/\D/g, '').slice(0, 11);

const validateForm = (form) => {
  if (form.companyName.trim().length < 2) return 'Ingresá el nombre de la empresa.';
  if (form.contactName.trim().length < 2) return 'Ingresá el nombre del contacto responsable.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) return 'Ingresá un correo válido.';
  if (form.phone.replace(/\D/g, '').length < 7) return 'Ingresá un teléfono válido.';
  if (normalizeTaxId(form.taxId).length !== 11) return 'El CUIT debe tener 11 dígitos.';
  if (!form.privacyConsent) return 'Debes aceptar el tratamiento de datos para continuar.';
  return '';
};

export const EmployerRequestForm = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [clientError, setClientError] = useState('');
  const [result, setResult] = useState(null);
  const [submitRequest, { loading, error }] = useMutation(SUBMIT_EMPLOYER_REQUEST);

  const updateField = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setClientError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm(form);
    if (validationError) {
      setClientError(validationError);
      return;
    }

    try {
      const response = await submitRequest({
        variables: {
          input: {
            ...form,
            companyName: form.companyName.trim(),
            contactName: form.contactName.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim(),
            taxId: normalizeTaxId(form.taxId),
            comments: form.comments.trim() || null,
          },
        },
      });
      setResult(response.data?.submitEmployerRequest ?? null);
      setForm(EMPTY_FORM);
    } catch {
      // Apollo exposes the controlled GraphQL/network error below the form.
    }
  };

  if (result?.accepted) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-14 dark:bg-slate-900">
        <section className="mx-auto max-w-xl rounded-3xl border border-emerald-200 bg-slate-100 p-8 text-center shadow-xl dark:border-emerald-300/20 dark:bg-slate-800">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
            <i className="fa-solid fa-check" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-slate-100">
            Solicitud recibida
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {result.message}
          </p>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Referencia {result.referenceCode}
          </p>
          <Link
            to="/"
            className="mt-7 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-slate-100 transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:bg-cyan-400 dark:text-slate-950"
          >
            Volver al inicio
          </Link>
        </section>
      </main>
    );
  }

  const visibleError = clientError || error?.message;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-3xl bg-slate-900 p-8 text-slate-100 shadow-xl dark:bg-slate-800">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
            OneITB para empresas
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight">
            Publicá oportunidades con identidad verificada.
          </h1>
          <p className="mt-5 text-sm leading-7 text-slate-300">
            El equipo administrativo revisará los datos fiscales y de contacto. La cuenta se crea únicamente después de la aprobación y las instrucciones de acceso se envían por correo.
          </p>
          <ul className="mt-7 space-y-4 text-sm text-slate-200">
            <li className="flex gap-3"><i className="fa-solid fa-shield-halved mt-1 text-cyan-300" />Validación administrativa previa.</li>
            <li className="flex gap-3"><i className="fa-solid fa-envelope mt-1 text-cyan-300" />Acceso temporal y seguro por correo.</li>
            <li className="flex gap-3"><i className="fa-solid fa-briefcase mt-1 text-cyan-300" />Gestor de Ofertas y Postulaciones.</li>
          </ul>
        </section>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-3xl border border-slate-200 bg-slate-100 p-6 shadow-lg sm:p-8 dark:border-white/10 dark:bg-slate-800"
        >
          <div>
            <h2 className="text-xl font-black">Solicitud de alta de empresa</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Todos los campos marcados son obligatorios.</p>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <Field label="Empresa *" name="companyName" value={form.companyName} onChange={updateField} maxLength={160} autoComplete="organization" />
            <Field label="Contacto responsable *" name="contactName" value={form.contactName} onChange={updateField} maxLength={160} autoComplete="name" />
            <Field label="Correo laboral *" name="email" type="email" value={form.email} onChange={updateField} maxLength={256} autoComplete="email" />
            <Field label="Teléfono *" name="phone" type="tel" value={form.phone} onChange={updateField} maxLength={50} autoComplete="tel" />
            <Field label="CUIT *" name="taxId" value={form.taxId} onChange={(event) => setForm((current) => ({ ...current, taxId: normalizeTaxId(event.target.value) }))} inputMode="numeric" maxLength={11} />
            <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
              <label htmlFor="employer-website">Sitio web</label>
              <input id="employer-website" name="website" value={form.website} onChange={updateField} tabIndex="-1" autoComplete="off" />
            </div>
          </div>

          <label className="mt-5 block text-sm font-bold" htmlFor="employer-comments">
            Comentarios
          </label>
          <textarea
            id="employer-comments"
            name="comments"
            value={form.comments}
            onChange={updateField}
            maxLength={1500}
            rows={4}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Contanos qué perfiles u oportunidades querés acercar."
          />

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm dark:border-white/10">
            <input
              type="checkbox"
              name="privacyConsent"
              checked={form.privacyConsent}
              onChange={updateField}
              className="mt-0.5 h-4 w-4 accent-cyan-600"
            />
            <span className="text-slate-600 dark:text-slate-300">
              Autorizo el tratamiento de estos datos exclusivamente para validar la empresa y gestionar el acceso a OneITB.
            </span>
          </label>

          {visibleError && (
            <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-300/20 dark:bg-red-400/10 dark:text-red-200">
              {visibleError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-slate-100 transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <><i className="fa-solid fa-circle-notch animate-spin" />Enviando solicitud...</> : 'Enviar solicitud'}
          </button>
        </form>
      </div>
    </main>
  );
};

const Field = ({ label, name, type = 'text', ...props }) => (
  <label className="block text-sm font-bold" htmlFor={`employer-${name}`}>
    {label}
    <input
      id={`employer-${name}`}
      name={name}
      type={type}
      required
      {...props}
      className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-normal outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
    />
  </label>
);
