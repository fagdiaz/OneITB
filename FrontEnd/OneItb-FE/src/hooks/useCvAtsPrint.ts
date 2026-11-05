import { RefObject, useCallback, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

interface UseCvAtsPrintOptions {
  contentRef: RefObject<HTMLElement>;
  documentTitle?: string;
}

const sanitizeTitle = (value?: string): string => {
  const normalized = value?.trim().replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_-]+/g, '-') ?? '';
  return normalized.replace(/^-+|-+$/g, '').slice(0, 80) || 'OneITB-CV-ATS';
};

export const ATS_PAGE_STYLE = `
  @page { size: A4; margin: 12mm; }
  html, body {
    background: #ffffff !important;
    color: #0f172a !important;
    margin: 0 !important;
    padding: 0 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body::before { display: none !important; }
  .no-print { display: none !important; }
  .cv-ats-document,
  .resume-print-target {
    font-family: Arial, Helvetica, "Segoe UI", sans-serif !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 12mm 14mm !important;
    box-shadow: none !important;
    border: none !important;
    background-color: #ffffff !important;
    color: #111827 !important;
    overflow: visible !important;
    transform: none !important;
    box-sizing: border-box !important;
  }
  .cv-ats-document *,
  .resume-print-target * {
    font-family: Arial, Helvetica, "Segoe UI", sans-serif !important;
  }
  .cv-ats-heading { break-after: avoid-page; page-break-after: avoid; }
  .cv-ats-entry, .cv-ats-contact-item { break-inside: avoid-page; page-break-inside: avoid; }
  .cv-ats-section p, .cv-ats-section li { orphans: 3; widows: 3; }
  .cv-ats-link { color: #0f172a !important; text-decoration: underline !important; }
`;

export const useCvAtsPrint = ({ contentRef, documentTitle }: UseCvAtsPrintOptions) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState('');

  const triggerPrint = useReactToPrint({
    contentRef,
    documentTitle: sanitizeTitle(documentTitle),
    pageStyle: ATS_PAGE_STYLE,
    onBeforePrint: async () => {
      setPrintError('');
      setIsPrinting(true);
    },
    onAfterPrint: () => setIsPrinting(false),
    onPrintError: () => {
      setIsPrinting(false);
      setPrintError('No se pudo preparar el CV para imprimir. Intenta nuevamente.');
    },
  });

  const printCv = useCallback(() => {
    if (!contentRef.current) {
      setPrintError('La previsualización del CV todavía no está disponible.');
      return;
    }

    setPrintError('');
    triggerPrint();
  }, [contentRef, triggerPrint]);

  return {
    printCv,
    isPrinting,
    printError,
    clearPrintError: () => setPrintError(''),
  };
};
