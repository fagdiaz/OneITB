import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const FILTER_PRESETS = [
  { id: 'natural', label: 'Natural', filter: '', tint: null },
  { id: 'grayscale', label: 'Gris', filter: 'grayscale(1)', tint: null },
  { id: 'sepia', label: 'Sepia suave', filter: 'sepia(0.38) saturate(1.05)', tint: null },
  { id: 'contrast', label: 'Contraste', filter: 'contrast(1.22) saturate(1.08)', tint: null },
  { id: 'cool', label: 'Frio', filter: 'saturate(1.05)', tint: 'rgba(59, 130, 246, 0.16)' },
  { id: 'warm', label: 'Calido', filter: 'saturate(1.08)', tint: 'rgba(251, 146, 60, 0.16)' },
];

const CANVAS_SIZE = 720;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const BASE_ZOOM = 2;

const clampFilterValue = (value, base = 100) => Math.max(0, base + Number(value || 0));
const normalizeZoom = (value) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(value) || 1));
const getEffectiveZoom = (value) => BASE_ZOOM * normalizeZoom(value);

const buildCanvasFilter = ({ preset, brightness, contrast, saturation }) => {
  const parts = [];
  if (preset?.filter) parts.push(preset.filter);
  parts.push(`brightness(${clampFilterValue(brightness)}%)`);
  parts.push(`contrast(${clampFilterValue(contrast)}%)`);
  parts.push(`saturate(${clampFilterValue(saturation)}%)`);
  return parts.join(' ');
};

const getRotatedBounds = (image, degrees) => {
  const radians = ((degrees % 180) * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));

  return {
    width: (image.width * cos) + (image.height * sin),
    height: (image.width * sin) + (image.height * cos),
  };
};

const SliderControl = ({ label, min, max, step = 1, value, onChange }) => (
  <label className="grid gap-1.5">
    <span className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
      <span>{label}</span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-white/10 dark:text-slate-300">
        {value}
      </span>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="accent-blue-600"
    />
  </label>
);

export const AvatarEditorModal = ({
  isOpen,
  imageSrc,
  originalFileName,
  onClose,
  onSave,
  saving = false,
}) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const previewFrameRef = useRef(null);
  const dragStateRef = useRef(null);
  const [activeTab, setActiveTab] = useState('crop');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [fineRotation, setFineRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [presetId, setPresetId] = useState('natural');
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [vignette, setVignette] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);

  const selectedPreset = useMemo(
    () => FILTER_PRESETS.find((preset) => preset.id === presetId) || FILTER_PRESETS[0],
    [presetId],
  );

  const resetControls = useCallback(() => {
    setActiveTab('crop');
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
    setFineRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPresetId('natural');
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setVignette(0);
    setLoadError(false);
  }, []);

  const getCoverScale = useCallback((image, candidateRotation) => {
    const bounds = getRotatedBounds(image, candidateRotation);
    return Math.max(CANVAS_SIZE / bounds.width, CANVAS_SIZE / bounds.height);
  }, []);

  const getRenderedBounds = useCallback((candidateZoom = zoom) => {
    const image = imageRef.current;
    if (!image) {
      return { width: CANVAS_SIZE, height: CANVAS_SIZE };
    }

    const candidateRotation = rotation + fineRotation;
    const bounds = getRotatedBounds(image, candidateRotation);
    const scale = getCoverScale(image, candidateRotation) * getEffectiveZoom(candidateZoom);

    return {
      width: bounds.width * scale,
      height: bounds.height * scale,
    };
  }, [fineRotation, getCoverScale, rotation, zoom]);

  const clampOffset = useCallback((candidateOffset, candidateZoom = zoom) => {
    const bounds = getRenderedBounds(candidateZoom);
    const maxX = Math.max(0, (bounds.width - CANVAS_SIZE) / 2);
    const maxY = Math.max(0, (bounds.height - CANVAS_SIZE) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, candidateOffset.x)),
      y: Math.max(-maxY, Math.min(maxY, candidateOffset.y)),
    };
  }, [getRenderedBounds, zoom]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const size = CANVAS_SIZE;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, size, size);
    context.fillStyle = '#f8fafc';
    context.fillRect(0, 0, size, size);
    context.save();
    context.translate(size / 2 + offset.x, size / 2 + offset.y);
    context.rotate(((rotation + fineRotation) * Math.PI) / 180);

    const candidateRotation = rotation + fineRotation;
    const coverScale = getCoverScale(image, candidateRotation) * getEffectiveZoom(zoom);
    context.scale(flipH ? -coverScale : coverScale, flipV ? -coverScale : coverScale);
    context.filter = buildCanvasFilter({
      preset: selectedPreset,
      brightness,
      contrast,
      saturation,
    });
    context.drawImage(image, -image.width / 2, -image.height / 2);
    context.restore();

    context.filter = 'none';
    if (selectedPreset.tint) {
      context.save();
      context.globalCompositeOperation = 'soft-light';
      context.fillStyle = selectedPreset.tint;
      context.fillRect(0, 0, size, size);
      context.restore();
    }

    if (vignette !== 0) {
      const intensity = Math.min(Math.abs(vignette) / 100, 1) * 0.55;
      const gradient = context.createRadialGradient(size / 2, size / 2, size * 0.2, size / 2, size / 2, size * 0.72);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, vignette > 0 ? `rgba(15,23,42,${intensity})` : `rgba(255,255,255,${intensity})`);
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);
    }
  }, [brightness, contrast, fineRotation, flipH, flipV, getCoverScale, offset.x, offset.y, rotation, saturation, selectedPreset, vignette, zoom]);

  useEffect(() => {
    if (!isOpen || !imageSrc) return undefined;

    resetControls();
    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      setImageVersion((current) => current + 1);
    };
    image.onerror = () => setLoadError(true);
    image.src = imageSrc;

    return () => {
      imageRef.current = null;
    };
  }, [imageSrc, isOpen, resetControls]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, imageVersion]);

  useEffect(() => {
    setOffset((current) => {
      const next = clampOffset(current, zoom);
      return next.x === current.x && next.y === current.y ? current : next;
    });
  }, [clampOffset, imageVersion, zoom]);

  if (!isOpen) return null;

  const getCanvasScale = () => {
    const rect = previewFrameRef.current?.getBoundingClientRect();
    return rect?.width ? CANVAS_SIZE / rect.width : 1;
  };

  const handlePointerDown = (event) => {
    if (saving || loadError) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: offset,
      canvasScale: getCanvasScale(),
    };
  };

  const handlePointerMove = (event) => {
    const dragState = dragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    event.preventDefault();
    const deltaX = (event.clientX - dragState.startX) * dragState.canvasScale;
    const deltaY = (event.clientY - dragState.startY) * dragState.canvasScale;
    setOffset(clampOffset({
      x: dragState.startOffset.x + deltaX,
      y: dragState.startOffset.y + deltaY,
    }));
  };

  const handlePointerEnd = (event) => {
    if (dragStateRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStateRef.current = null;
  };

  const handleZoomChange = (value) => {
    const nextZoom = normalizeZoom(value);
    setZoom(nextZoom);
    setOffset((current) => clampOffset(current, nextZoom));
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || saving) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const baseName = (originalFileName || 'avatar').replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-');
        const file = new File([blob], `${baseName || 'avatar'}-edited-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        onSave(file);
      },
      'image/jpeg',
      0.92,
    );
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <div className="grid max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:shadow-[0_28px_90px_rgba(0,0,0,0.55)] md:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col border-b border-slate-200 bg-slate-100/70 p-3 dark:border-white/10 dark:bg-slate-900/70 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300">
                Editor de avatar
              </p>
              <h2 className="text-base font-black tracking-tight text-slate-950 dark:text-white">
                Ajusta tu imagen de perfil
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Cerrar editor de avatar"
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <div className="mt-4 flex flex-1 items-center justify-center">
            <div
              ref={previewFrameRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onPointerLeave={handlePointerEnd}
              className="relative aspect-square w-full max-w-[315px] touch-none select-none overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-2.5 shadow-inner dark:border-white/10 dark:bg-slate-950"
            >
              <canvas
                ref={canvasRef}
                className="h-full w-full cursor-grab rounded-[1.25rem] object-cover active:cursor-grabbing"
                aria-label="Vista previa editada del avatar"
              />
              <div className="pointer-events-none absolute inset-2.5 rounded-[1.25rem] ring-1 ring-inset ring-white/40 dark:ring-white/10" />
              {loadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-sm font-semibold text-red-600 dark:bg-slate-950/90 dark:text-red-300">
                  No se pudo cargar la imagen seleccionada.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="flex max-h-[88vh] flex-col overflow-y-auto p-3.5">
          <div className="grid grid-cols-3 gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1 text-xs font-bold dark:border-white/10 dark:bg-slate-900">
            {[
              ['crop', 'Recortar'],
              ['filter', 'Filtrar'],
              ['adjust', 'Ajustar'],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`rounded-xl px-3 py-2 transition ${
                  activeTab === id
                    ? 'bg-white text-blue-700 shadow-sm dark:bg-blue-500/15 dark:text-blue-200'
                    : 'text-slate-500 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            {activeTab === 'crop' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setRotation((current) => current - 90)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                    <i className="fa-solid fa-rotate-left mr-2" />
                    Rotar izq.
                  </button>
                  <button type="button" onClick={() => setRotation((current) => current + 90)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
                    <i className="fa-solid fa-rotate-right mr-2" />
                    Rotar der.
                  </button>
                  <button type="button" onClick={() => setFlipH((current) => !current)} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${flipH ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-300/30 dark:bg-blue-500/15 dark:text-blue-200' : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10'}`}>
                    <i className="fa-solid fa-arrows-left-right mr-2" />
                    Espejo H
                  </button>
                  <button type="button" onClick={() => setFlipV((current) => !current)} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${flipV ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-300/30 dark:bg-blue-500/15 dark:text-blue-200' : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10'}`}>
                    <i className="fa-solid fa-arrows-up-down mr-2" />
                    Espejo V
                  </button>
                </div>
                <SliderControl label="Zoom" min={MIN_ZOOM} max={MAX_ZOOM} step={0.05} value={zoom} onChange={handleZoomChange} />
                <SliderControl label="Rotacion fina" min={-45} max={45} value={fineRotation} onChange={setFineRotation} />
              </>
            )}

            {activeTab === 'filter' && (
              <div className="grid gap-2">
                {FILTER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setPresetId(preset.id)}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      presetId === preset.id
                        ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-300/30 dark:bg-blue-500/15 dark:text-blue-200'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="h-5 w-5 rounded-full border border-white/70 bg-gradient-to-br from-slate-200 via-blue-200 to-slate-700 shadow-sm" />
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'adjust' && (
              <>
                <SliderControl label="Brillo" min={-100} max={100} value={brightness} onChange={setBrightness} />
                <SliderControl label="Contraste" min={-100} max={100} value={contrast} onChange={setContrast} />
                <SliderControl label="Saturacion" min={-100} max={100} value={saturation} onChange={setSaturation} />
                <SliderControl label="Vineta" min={-100} max={100} value={vignette} onChange={setVignette} />
              </>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loadError}
              className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Subiendo imagen...' : 'Actualizar Imagen'}
            </button>
            <button
              type="button"
              onClick={resetControls}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Restablecer ajustes
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
