import { useState } from 'react';
import { ChevronLeft, Search } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useBrands, useCarsByBrand } from '@/lib/hooks';
import { buildTransformStyle, type ImageTransform } from '@/components/ImageEditor';
import { Logo } from '@/components/Logo';

export function BrandPage({ brandId }: { brandId: string }) {
  const { navigate, goBack } = useRouter();
  const { brands } = useBrands();
  const { cars, loading } = useCarsByBrand(brandId);
  const [filter, setFilter] = useState('');

  const brand = brands.find((b) => b.id === brandId);
  const filtered = filter
    ? cars.filter((c) => c.name.toLowerCase().includes(filter.toLowerCase()) || c.model?.name?.toLowerCase().includes(filter.toLowerCase()))
    : cars;

  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-sm text-ink-400 hover:text-white transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" /> Geri
        </button>

        <div className="mb-12">
          {brand?.logo_url && (
            <img src={brand.logo_url} alt={brand.name} className="h-16 object-contain mb-4 opacity-80" />
          )}
          <h1 className="text-4xl md:text-6xl font-display font-bold text-gradient mb-2">{brand?.name || 'Marka'}</h1>
          {brand?.country && <p className="text-ink-400">{brand.country}{brand.founded ? ` · ${brand.founded}` : ''}</p>}
          {brand?.description && <p className="text-ink-300 mt-4 max-w-2xl leading-relaxed">{brand.description}</p>}
        </div>

        <div className="mb-8 flex items-center gap-3 max-w-md">
          <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-ink-500" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Model ara..."
              className="flex-1 bg-transparent text-white placeholder-ink-500 outline-none text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer-bg rounded-2xl aspect-[4/3]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-ink-400">Bu marka için henüz araç eklenmemiş.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {filtered.map((car) => (
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
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-xs text-ink-400 mb-1">{car.model?.name}</p>
                    <h3 className="text-lg font-semibold text-white">{car.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      {car.horsepower && <span className="text-xs text-ink-300">{car.horsepower} HP</span>}
                      {car.acceleration_0_100 && <span className="text-xs text-ink-300">0-100: {car.acceleration_0_100}s</span>}
                    </div>
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
