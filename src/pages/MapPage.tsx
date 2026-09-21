import { ChevronLeft, MapPin } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useAllMapLocations } from '@/lib/hooks';
import { InteractiveMap } from '@/components/InteractiveMap';

export function MapPage() {
  const { navigate, goBack } = useRouter();
  const { locations, loading } = useAllMapLocations();

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-sm text-secondary-c hover:text-primary-c transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" /> Geri
        </button>

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-muted-c" />
            <p className="text-xs uppercase tracking-[0.3em] text-faint-c">Çekim Konumları</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient">Etkileşimli Dünya Haritası</h1>
          <p className="text-sm text-muted-c mt-2 max-w-xl">
            Sürükleyerek gezinin, yakınlaştırın ve işaretçilere tıklayarak araç detaylarını keşfedin.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 pb-20">
          <div className="lg:col-span-2 h-[500px] md:h-[600px]">
            {loading ? (
              <div className="w-full h-full shimmer-bg rounded-2xl" />
            ) : locations.length === 0 ? (
              <div className="w-full h-full glass rounded-2xl flex items-center justify-center">
                <p className="text-muted-c">Henüz konum eklenmemiş.</p>
              </div>
            ) : (
              <InteractiveMap
                locations={locations}
                onLocationClick={(loc) => loc.car && navigate({ name: 'car', carId: loc.car.id })}
              />
            )}
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto no-scrollbar">
            <p className="text-xs uppercase tracking-wider text-faint-c mb-2">
              {locations.length} Konum
            </p>
            {loading ? (
              <p className="text-muted-c text-sm">Yükleniyor...</p>
            ) : locations.length === 0 ? (
              <p className="text-muted-c text-sm">Henüz konum eklenmemiş.</p>
            ) : (
              locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => loc.car && navigate({ name: 'car', carId: loc.car.id })}
                  className="w-full text-left glass rounded-2xl p-4 premium-border hover:bg-glass-strong transition-all"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-c flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-primary-c">{loc.name}</p>
                      {loc.car && <p className="text-xs text-muted-c mt-0.5">{loc.car.name}</p>}
                      {loc.description && <p className="text-xs text-faint-c mt-1">{loc.description}</p>}
                      <p className="text-[10px] text-disabled-c mt-1">
                        {loc.latitude.toFixed(3)}, {loc.longitude.toFixed(3)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
