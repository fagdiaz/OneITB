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
  @page { size: A4 portrait; margin: 12mm 14mm; }
  html, body { background: #ffffff !important; color: #0f172a !important; }
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
