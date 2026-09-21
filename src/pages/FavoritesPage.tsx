import { ChevronLeft, Heart } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useFavorites } from '@/lib/favorites';
import { useAllCars } from '@/lib/hooks';

export function FavoritesPage() {
  const { navigate, goBack } = useRouter();
  const { favorites } = useFavorites();
  const { cars, loading } = useAllCars();

  const favCars = cars.filter((c) => favorites.includes(c.id));

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
            <Heart className="w-5 h-5 text-ink-400" />
            <p className="text-xs uppercase tracking-[0.3em] text-ink-500">Favorilerim</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gradient">{favCars.length} Araç</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shimmer-bg rounded-2xl aspect-[4/3]" />
            ))}
          </div>
        ) : favCars.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-ink-600 mx-auto mb-4" />
            <p className="text-ink-400 text-lg">Henüz favori araç yok.</p>
            <p className="text-ink-500 text-sm mt-2">Araç sayfalarında kalp simgesine tıklayarak favorilere ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {favCars.map((car) => (
              <button
                key={car.id}
                onClick={() => navigate({ name: 'car', carId: car.id })}
                className="group text-left"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden premium-border">
                  <img
                    src={car.cover_image_url || car.hero_image_url || 'https://images.pexels.com/photos/94272/sports-car-pkw-auto-vehicle-94272.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={car.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <Heart className="w-5 h-5 text-white fill-current" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-xs text-ink-400 mb-1">{car.brand?.name} · {car.model?.name}</p>
                    <h3 className="text-lg font-semibold text-white">{car.name}</h3>
                    {car.horsepower && <p className="text-sm text-ink-300 mt-1">{car.horsepower} HP</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
