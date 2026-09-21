import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, SearchX, Building2, Car as CarIcon } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useAllCars, useBrands } from '@/lib/hooks';
import { searchAll } from '@/lib/search';

export function SearchPage({ query }: { query: string }) {
  const { navigate, goBack } = useRouter();
  const { cars, loading: carsLoading } = useAllCars();
  const { brands, loading: brandsLoading } = useBrands();
  const [searchValue, setSearchValue] = useState(query);

  useEffect(() => { setSearchValue(query); }, [query]);

  const loading = carsLoading || brandsLoading;

  const results = useMemo(
    () => searchAll(brands, cars, query),
    [brands, cars, query]
  );

  const hasQuery = query.trim().length > 0;
  const totalResults = results.brands.length + results.cars.length;

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
            <Search className="w-5 h-5 text-muted-c" />
            <p className="text-xs uppercase tracking-[0.3em] text-faint-c">Araç Arama</p>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); if (searchValue.trim()) navigate({ name: 'search', query: searchValue.trim() }); }}
            className="max-w-2xl"
          >
            <div className="glass-strong rounded-2xl p-2 flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-c ml-3" />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Marka, model veya araç adı ara..."
                className="flex-1 bg-transparent text-primary-c placeholder-faint-c outline-none py-3 text-base"
              />
              <button type="submit" className="px-4 py-2 accent-bg rounded-xl font-medium text-sm accent-bg-hover transition-colors">
                Ara
              </button>
            </div>
          </form>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-c">
            {loading ? 'Aranıyor...' : hasQuery
              ? `"${query}" için ${totalResults} sonuç bulundu`
              : `${results.cars.length} araç listeleniyor`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer-bg rounded-2xl aspect-[4/3]" />
            ))}
          </div>
        ) : totalResults === 0 && hasQuery ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="w-20 h-20 rounded-3xl glass flex items-center justify-center mb-6">
              <SearchX className="w-10 h-10 text-faint-c" />
            </div>
            <h3 className="text-2xl font-display font-bold text-gradient mb-2">Sonuç Bulunamadı</h3>
            <p className="text-muted-c text-center max-w-md mb-6">
              "{query}" araması için hiçbir marka veya araç eşleşmedi. Farklı bir kelime ile tekrar deneyin.
            </p>
            <button
              onClick={() => navigate({ name: 'home' })}
              className="mt-2 px-5 py-2.5 accent-bg rounded-xl font-medium text-sm accent-bg-hover transition-colors"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        ) : (
          <div className="pb-20 space-y-12">
            {/* Brand Results */}
            {results.brands.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-4 h-4 text-muted-c" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary-c">
                    Markalar ({results.brands.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.brands.map(({ brand }) => (
                    <button
                      key={brand.id}
                      onClick={() => navigate({ name: 'brand', brandId: brand.id })}
                      className="group glass rounded-2xl p-5 flex flex-col items-center justify-center gap-3 premium-border hover:bg-glass-strong transition-all duration-500"
                    >
                      {brand.logo_url ? (
                        <img src={brand.logo_url} alt={brand.name} className="h-10 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <span className="text-2xl font-display font-bold text-secondary-c group-hover:text-primary-c transition-colors">
                          {brand.name.charAt(0)}
                        </span>
                      )}
                      <span className="text-sm font-medium text-primary-c">{brand.name}</span>
                      {brand.country && <span className="text-[10px] text-faint-c">{brand.country}</span>}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Car Results */}
            {results.cars.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CarIcon className="w-4 h-4 text-muted-c" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary-c">
                    Araçlar ({results.cars.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.cars.map((car) => (
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
                          <p className="text-xs text-ink-400 mb-1">{car.brand?.name} · {car.model?.name}</p>
                          <h3 className="text-lg font-semibold text-white">{car.name}</h3>
                          <div className="flex items-center gap-3 mt-2">
                            {car.horsepower && <span className="text-xs text-ink-300">{car.horsepower} HP</span>}
                            {car.cylinders && <span className="text-xs text-ink-300">V{car.cylinders}</span>}
                            {car.drivetrain && <span className="text-xs text-ink-300">{car.drivetrain}</span>}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
