import React from 'react';

const statusLabels = {
  IN_PROGRESS: 'En curso',
  REGULAR: 'Regular',
  APPROVED: 'Aprobado',
  FREE: 'Libre',
};

const escapeCsvValue = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const escapeHtml = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(new Date(value));
};

const formatScore = (value) => {
  if (value === null || value === undefined) return 'Sin nota';
  return Number(value).toLocaleString('es-AR', { maximumFractionDigits: 2 });
};

export const CertificateExport = ({ progress, loading, user }) => {
  const items = progress ?? [];
  const approvedCount = items.filter((item) => item.status === 'APPROVED').length;

  const downloadCsv = () => {
    const header = ['Materia', 'Codigo', 'Carrera', 'Estado', 'Nota', 'Actualizado'];
    const rows = items.map((item) => [
      item.subject?.name,
      item.subject?.code,
      item.subject?.career?.name,
      statusLabels[item.status] ?? item.status,
      formatScore(item.score),
      formatDate(item.updatedAt),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'oneitb-progreso-academico.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const printCertificate = () => {
    const issuedAt = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(new Date());
    const rows = items.map((item) => `
      <tr>
        <td>${escapeHtml(item.subject?.name)}</td>
        <td>${escapeHtml(item.subject?.code)}</td>
        <td>${escapeHtml(item.subject?.career?.name)}</td>
        <td>${escapeHtml(statusLabels[item.status] ?? item.status)}</td>
        <td>${escapeHtml(formatScore(item.score))}</td>
      </tr>
    `).join('');

    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;

    printWindow.document.write(`
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Constancia academica OneITB</title>
          <style>
            body { margin: 0; font-family: Inter, Arial, sans-serif; color: #0f172a; background: #f8fafc; }
            main { width: 190mm; min-height: 260mm; margin: 10mm auto; background: white; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; }
            header { background: #0f172a; color: white; padding: 28px 34px; }
            h1 { margin: 8px 0 0; font-size: 28px; letter-spacing: -0.04em; }
            .eyebrow { margin: 0; color: #93c5fd; font-size: 11px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; }
            section { padding: 30px 34px; }
            .student { font-size: 24px; font-weight: 900; margin: 6px 0 0; }
            .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 24px 0; }
            .card { border: 1px solid #e2e8f0; border-radius: 18px; padding: 14px; background: #f8fafc; }
            .label { margin: 0 0 6px; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: .12em; }
            .value { margin: 0; font-size: 17px; font-weight: 900; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { text-align: left; color: #475569; font-size: 10px; text-transform: uppercase; letter-spacing: .08em; }
            th, td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; }
            footer { padding: 18px 34px 30px; color: #64748b; font-size: 11px; }
            @media print { body { background: white; } main { margin: 0; border: 0; border-radius: 0; width: auto; min-height: auto; } }
          </style>
        </head>
        <body>
          <main>
            <header>
              <p class="eyebrow">OneITB - Constancia institucional</p>
              <h1>Progreso academico del estudiante</h1>
            </header>
            <section>
              <p class="label">Estudiante</p>
              <p class="student">${escapeHtml(user?.username ?? 'Usuario OneITB')}</p>
              <div class="summary">
                <div class="card"><p class="label">Materias registradas</p><p class="value">${items.length}</p></div>
                <div class="card"><p class="label">Materias aprobadas</p><p class="value">${approvedCount}</p></div>
                <div class="card"><p class="label">Emision</p><p class="value">${escapeHtml(issuedAt)}</p></div>
              </div>
              <table>
                <thead>
                  <tr><th>Materia</th><th>Codigo</th><th>Carrera</th><th>Estado</th><th>Nota</th></tr>
                </thead>
                <tbody>${rows || '<tr><td colspan="5">Sin registros academicos.</td></tr>'}</tbody>
              </table>
            </section>
            <footer>
              Documento generado desde OneITB. Para credenciales publicas, utilice los enlaces disponibles en materias aprobadas.
            </footer>
          </main>
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">Constancias</p>
          <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">Exportar progreso academico</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Descarga CSV para auditoria o imprime una constancia formal del estado academico actual.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={loading || items.length === 0}
            onClick={downloadCsv}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <i className="fa-solid fa-file-csv" />
            Descargar CSV
          </button>
          <button
            type="button"
            disabled={loading || items.length === 0}
            onClick={printCertificate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i className="fa-solid fa-print" />
            Imprimir constancia
          </button>
        </div>
      </div>
    </div>
  );
};
