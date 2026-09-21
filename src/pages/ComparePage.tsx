import { useState, useEffect } from 'react';
import { ChevronLeft, X, GitCompare } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useAllCars } from '@/lib/hooks';
import { SPEC_FIELDS, RATING_CATEGORIES } from '@/lib/types';

export function ComparePage({ carA: initialA, carB: initialB }: { carA?: string; carB?: string }) {
  const { navigate, goBack } = useRouter();
  const { cars, loading } = useAllCars();
  const [carAId, setCarAId] = useState(initialA || '');
  const [carBId, setCarBId] = useState(initialB || '');
  const [pickerOpen, setPickerOpen] = useState<'a' | 'b' | null>(null);

  useEffect(() => {
    if (initialA) setCarAId(initialA);
    if (initialB) setCarBId(initialB);
  }, [initialA, initialB]);

  const carA = cars.find((c) => c.id === carAId);
  const carB = cars.find((c) => c.id === carBId);

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-sm text-ink-400 hover:text-white transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" /> Geri
        </button>

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <GitCompare className="w-5 h-5 text-ink-400" />
            <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Araç Karşılaştırma</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient">Yan Yana Karşılaştırma</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <CompareSlot
            car={carA}
            loading={loading}
            onPick={() => setPickerOpen('a')}
            onClear={() => setCarAId('')}
          />
          <CompareSlot
            car={carB}
            loading={loading}
            onPick={() => setPickerOpen('b')}
            onClear={() => setCarBId('')}
          />
        </div>

        {carA && carB && (
          <div className="glass rounded-2xl overflow-hidden mb-20">
            <div className="grid grid-cols-3 border-b border-white/10">
              <div className="p-5 text-sm text-ink-400">Özellik</div>
              <div className="p-5 text-sm font-medium text-white">{carA.name}</div>
              <div className="p-5 text-sm font-medium text-white">{carB.name}</div>
            </div>
            {SPEC_FIELDS.map(({ key, label }) => {
              const valA = (carA as unknown as Record<string, unknown>)[key];
              const valB = (carB as unknown as Record<string, unknown>)[key];
              if (!valA && !valB) return null;
              return (
                <div key={key} className="grid grid-cols-3 border-b border-white/5">
                  <div className="p-4 text-xs text-ink-500">{label}</div>
                  <div className={`p-4 text-sm ${valA ? 'text-white' : 'text-ink-600'}`}>{valA ? String(valA) : '—'}</div>
                  <div className={`p-4 text-sm ${valB ? 'text-white' : 'text-ink-600'}`}>{valB ? String(valB) : '—'}</div>
                </div>
              );
            })}
          </div>
        )}

        {!carA || !carB ? (
          <p className="text-sm text-ink-400 text-center pb-20">Karşılaştırma için iki araç seçin.</p>
        ) : null}
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-[100] bg-ink-950/80 backdrop-blur-xl flex items-start justify-center pt-24 px-6 animate-fade-in" onClick={() => setPickerOpen(null)}>
          <div className="w-full max-w-2xl glass-strong rounded-2xl p-5 max-h-[60vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-white mb-4">Araç Seç</h3>
            <div className="space-y-2">
              {cars.map((car) => (
                <button
                  key={car.id}
                  onClick={() => {
                    if (pickerOpen === 'a') setCarAId(car.id);
                    else setCarBId(car.id);
                    setPickerOpen(null);
                  }}
                  className="w-full text-left glass rounded-xl p-3 hover:border-white/20 transition-all flex items-center gap-3"
                >
                  <img src={car.cover_image_url || car.hero_image_url || ''} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm text-white">{car.name}</p>
                    <p className="text-xs text-ink-500">{car.brand?.name} · {car.model?.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CompareSlot({ car, loading, onPick, onClear }: {
  car: ReturnType<typeof useAllCars>['cars'][number] | undefined;
  loading: boolean;
  onPick: () => void;
  onClear: () => void;
}) {
  if (loading && !car) {
    return <div className="shimmer-bg rounded-2xl aspect-[4/3]" />;
  }
  if (!car) {
    return (
      <button
        onClick={onPick}
        className="aspect-[4/3] glass rounded-2xl flex flex-col items-center justify-center gap-3 premium-border hover:bg-white/5 transition-all"
      >
        <div className="w-12 h-12 rounded-full glass flex items-center justify-center">
          <GitCompare className="w-5 h-5 text-ink-400" />
        </div>
        <p className="text-sm text-ink-400">Araç Seç</p>
      </button>
    );
  }
  return (
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden premium-border">
      <img src={car.cover_image_url || car.hero_image_url || ''} alt={car.name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
      <button onClick={onClear} className="absolute top-3 right-3 w-8 h-8 glass-dark rounded-full flex items-center justify-center hover:bg-white/10">
        <X className="w-4 h-4" />
      </button>
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-xs text-ink-400">{car.brand?.name} · {car.model?.name}</p>
        <h3 className="text-xl font-semibold text-white mt-1">{car.name}</h3>
        {car.horsepower && <p className="text-sm text-ink-300 mt-1">{car.horsepower} HP</p>}
      </div>
    </div>
  );
}
