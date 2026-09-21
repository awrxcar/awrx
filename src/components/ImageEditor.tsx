import { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, MoveUp, MoveDown, MoveLeft, MoveRight, RotateCcw, X, Check } from 'lucide-react';

export interface ImageTransform {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

interface ImageEditorProps {
  imageUrl: string;
  initialTransform?: ImageTransform | null;
  aspectRatio?: string;
  title: string;
  onSave: (transform: ImageTransform) => void;
  onCancel: () => void;
}

const DEFAULT_TRANSFORM: ImageTransform = { zoom: 1, offsetX: 0, offsetY: 0 };
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;
const PAN_STEP = 2;

export function buildTransformStyle(transform: ImageTransform | null): React.CSSProperties {
  if (!transform) return {};
  const zoom = transform.zoom || 1;
  const offsetX = transform.offsetX || 0;
  const offsetY = transform.offsetY || 0;
  return {
    transform: `scale(${zoom}) translate(${offsetX}%, ${offsetY}%)`,
  };
}

export function ImageEditor({
  imageUrl,
  initialTransform,
  aspectRatio = '16/9',
  title,
  onSave,
  onCancel,
}: ImageEditorProps) {
  const [transform, setTransform] = useState<ImageTransform>(
    initialTransform
      ? { zoom: initialTransform.zoom || 1, offsetX: initialTransform.offsetX || 0, offsetY: initialTransform.offsetY || 0 }
      : DEFAULT_TRANSFORM
  );

  const clampOffset = useCallback((offsetX: number, offsetY: number, zoom: number) => {
    const maxPan = ((zoom - 1) / 2) * 100;
    if (maxPan <= 0) return { x: 0, y: 0 };
    return {
      x: Math.max(-maxPan, Math.min(maxPan, offsetX)),
      y: Math.max(-maxPan, Math.min(maxPan, offsetY)),
    };
  }, []);

  const handleZoomIn = () => {
    setTransform((prev) => {
      const newZoom = Math.min(MAX_ZOOM, prev.zoom + ZOOM_STEP);
      const clamped = clampOffset(prev.offsetX, prev.offsetY, newZoom);
      return { zoom: newZoom, offsetX: clamped.x, offsetY: clamped.y };
    });
  };

  const handleZoomOut = () => {
    setTransform((prev) => {
      const newZoom = Math.max(MIN_ZOOM, prev.zoom - ZOOM_STEP);
      const clamped = clampOffset(prev.offsetX, prev.offsetY, newZoom);
      return { zoom: newZoom, offsetX: clamped.x, offsetY: clamped.y };
    });
  };

  const handlePan = (dir: 'left' | 'right' | 'up' | 'down') => {
    setTransform((prev) => {
      let nx = prev.offsetX;
      let ny = prev.offsetY;
      if (dir === 'left') nx -= PAN_STEP;
      if (dir === 'right') nx += PAN_STEP;
      if (dir === 'up') ny -= PAN_STEP;
      if (dir === 'down') ny += PAN_STEP;
      const clamped = clampOffset(nx, ny, prev.zoom);
      return { ...prev, offsetX: clamped.x, offsetY: clamped.y };
    });
  };

  const handleReset = () => setTransform(DEFAULT_TRANSFORM);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0) handleZoomOut();
    else handleZoomIn();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-ink-950/90 backdrop-blur-xl flex items-center justify-center px-6 animate-fade-in">
      <div className="w-full max-w-4xl glass-strong rounded-3xl p-6 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-xs text-ink-400 mt-1">Fotoğrafı kadraja yerleştirin, ardından kaydedin</p>
          </div>
          <button onClick={onCancel} className="p-2 glass rounded-lg text-ink-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview */}
        <div
          className="relative w-full overflow-hidden rounded-2xl premium-border bg-ink-900 mx-auto"
          style={{ aspectRatio, maxHeight: '50vh' }}
          onWheel={handleWheel}
        >
          <img
            src={imageUrl}
            alt="preview"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            style={{
              transform: `scale(${transform.zoom}) translate(${transform.offsetX}%, ${transform.offsetY}%)`,
              transition: 'transform 0.15s ease-out',
            }}
          />
          <div className="absolute top-3 left-3 glass-dark rounded-lg px-2.5 py-1 flex items-center gap-1.5 z-10">
            <span className="text-[10px] text-ink-300">Canlı Önizleme</span>
          </div>
          <div className="absolute bottom-3 right-3 glass-dark rounded-lg px-2.5 py-1 z-10">
            <span className="text-[10px] text-ink-300">Zoom: {transform.zoom.toFixed(1)}x</span>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
          <button onClick={handleZoomIn} className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-xl text-sm text-ink-200 hover:text-white hover:border-white/20 transition-all">
            <ZoomIn className="w-4 h-4" /> Yakınlaştır
          </button>
          <button onClick={handleZoomOut} className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-xl text-sm text-ink-200 hover:text-white hover:border-white/20 transition-all">
            <ZoomOut className="w-4 h-4" /> Uzaklaştır
          </button>
          <button onClick={handleReset} className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-xl text-sm text-ink-200 hover:text-white hover:border-white/20 transition-all">
            <RotateCcw className="w-4 h-4" /> Sıfırla
          </button>
          <button onClick={() => handlePan('left')} className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-xl text-sm text-ink-200 hover:text-white hover:border-white/20 transition-all">
            <MoveLeft className="w-4 h-4" /> Sola
          </button>
          <button onClick={() => handlePan('right')} className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-xl text-sm text-ink-200 hover:text-white hover:border-white/20 transition-all">
            <MoveRight className="w-4 h-4" /> Sağa
          </button>
          <button onClick={() => handlePan('up')} className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-xl text-sm text-ink-200 hover:text-white hover:border-white/20 transition-all">
            <MoveUp className="w-4 h-4" /> Yukarı
          </button>
          <button onClick={() => handlePan('down')} className="flex items-center justify-center gap-2 px-4 py-3 glass rounded-xl text-sm text-ink-200 hover:text-white hover:border-white/20 transition-all">
            <MoveDown className="w-4 h-4" /> Aşağı
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onSave(transform)}
            className="flex items-center gap-2 px-5 py-3 bg-white text-ink-950 rounded-xl font-medium text-sm hover:bg-ink-200 transition-colors"
          >
            <Check className="w-4 h-4" /> Kaydet
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-3 glass rounded-xl text-sm text-ink-300 hover:text-white"
          >
            <X className="w-4 h-4" /> İptal
          </button>
        </div>
      </div>
    </div>
  );
}
