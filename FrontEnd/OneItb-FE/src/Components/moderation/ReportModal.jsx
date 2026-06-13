import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REPORT_INQUIRY } from '../../data/graphql/mutations/moderation';

export const ReportModal = ({ isOpen, onClose, inquiryId, onReported }) => {
  const [reason, setReason] = useState('');
  const [reportInquiry, { loading, error }] = useMutation(REPORT_INQUIRY);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!reason.trim() || !inquiryId) return;

    await reportInquiry({
      variables: {
        inquiryId,
        reason: reason.trim()
      }
    });
    setReason('');
    onClose();
    onReported?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Reportar publicación</h2>
            <p className="mt-1 text-sm text-slate-500">
              El equipo de moderación revisará el motivo y la publicación.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            rows={4}
            required
            placeholder="Describí el problema..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
          {error && <p className="text-sm text-red-600">{error.message}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar reporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
