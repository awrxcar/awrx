import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, ArrowRight, Sparkles, Building2 } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { Logo } from '@/components/Logo';
import { useBrands, useAllCars } from '@/lib/hooks';
import { buildTransformStyle, type ImageTransform } from '@/components/ImageEditor';
import type { Brand } from '@/lib/types';

const HERO_IMAGE = 'awrx-logo.jpg';

function normalizeBrand(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ë/g, 'e')
    .trim();
}

export function HomePage() {
  const { navigate } = useRouter();
  const { brands, loading: brandsLoading } = useBrands();
  const { cars } = useAllCars();
  const [searchValue, setSearchValue] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const filteredBrands = useMemo(() => {
    const q = normalizeBrand(brandSearch);
    if (!q) return brands;
    return brands.filter((b) => normalizeBrand(b.name).includes(q));
  }, [brands, brandSearch]);

  const updateScrollState = useCallback(() => {
    const el = carouselRef.current;
    if (!el) { setCanScrollLeft(false); setCanScrollRight(false); return; }
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < maxScroll - 2);
  }, []);

  const scrollCarousel = (dir: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener('scroll', onScroll, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', onScroll);
  }, [brandsLoading, filteredBrands, updateScrollState]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    if (filteredBrands.length === 0) return;
    el.scrollTo({ left: 0, behavior: 'auto' });
    updateScrollState();
  }, [brandSearch, filteredBrands, updateScrollState]);

  useEffect(() => {
    const onResize = () => updateScrollState();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateScrollState]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) navigate({ name: 'search', query: searchValue.trim() });
  };

  const featuredCars = cars.filter((c) => c.is_featured).slice(0, 6);
  const displayFeatured = featuredCars.length > 0 ? featuredCars : cars.slice(0, 6);

  const showArrows = filteredBrands.length > 4;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/50 via-ink-950/70 to-ink-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/60 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="animate-fade-in-up">
            <p className="text-xs uppercase tracking-[0.4em] text-ink-400 mb-6">Premium Automotive Database</p>
            <Logo size="xl" className="block mb-8" />
            <p className="text-lg md:text-xl text-ink-300 font-light max-w-2xl mx-auto leading-relaxed">
              Dünyanın en premium otomobil veritabanı. Markaları keşfedin, modelleri inceleyin,
              teknik detaylara dalın.
            </p>
          </div>

          <form onSubmit={submitSearch} className="mt-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass-strong rounded-2xl p-2 flex items-center gap-3 group focus-within:border-white/20 transition-all duration-500">
              <Search className="w-5 h-5 text-ink-400 ml-3" />
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="700 HP V8 Mercedes, Twin Turbo Ferrari, AWD Porsche..."
                className="flex-1 bg-transparent text-white placeholder-ink-500 outline-none py-3 text-sm md:text-base"
              />
              <button type="submit" className="px-5 py-3 bg-white text-ink-950 rounded-xl font-medium text-sm hover:bg-ink-200 transition-colors flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">AI Ara</span>
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {['V12 Lamborghini', 'Twin Turbo Ferrari', 'AWD Porsche 500 HP', '700 HP Mercedes'].map((q) => (
              <button
                key={q}
                onClick={() => navigate({ name: 'search', query: q })}
                className="text-xs px-3 py-1.5 glass rounded-full text-ink-300 hover:text-white hover:border-white/20 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float">
          <div className="w-6 h-10 border-2 border-ink-500 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-ink-400 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Brands Carousel */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink-500 mb-2">Üreticiler</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gradient">Markaları Keşfedin</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-2 w-full md:w-64">
                <Search className="w-4 h-4 text-ink-500 flex-shrink-0" />
                <input
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="Marka ara..."
                  className="flex-1 bg-transparent text-white placeholder-ink-500 outline-none text-sm min-w-0"
                />
                {brandSearch && (
                  <button
                    onClick={() => setBrandSearch('')}
                    className="text-ink-500 hover:text-white transition-colors flex-shrink-0"
                    aria-label="Temizle"
                  >
                    <ChevronLeft className="w-4 h-4 rotate-45" />
                  </button>
                )}
              </div>
              {showArrows && (
                <div className="hidden md:flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => scrollCarousel('left')}
                    disabled={!canScrollLeft}
                    className="p-2.5 glass rounded-full hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Önceki markalar"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    disabled={!canScrollRight}
                    className="p-2.5 glass rounded-full hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Sonraki markalar"
                  >
                  <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {brandsLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="shimmer-bg rounded-2xl w-[260px] h-[140px] flex-shrink-0" />
              ))}
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-ink-400">Henüz marka eklenmemiş.</p>
              <button onClick={() => navigate({ name: 'admin' })} className="text-sm text-ink-300 hover:text-white mt-3 underline">Yönetim panelinden ekleyin</button>
            </div>
          ) : filteredBrands.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-10 h-10 text-ink-600 mx-auto mb-3" />
              <p className="text-ink-400">Marka bulunamadı</p>
              <p className="text-ink-500 text-sm mt-1">"{brandSearch}" ile eşleşen marka yok.</p>
            </div>
          ) : (
            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto no-scrollbar pb-4"
            >
              {filteredBrands.map((brand) => (
                <BrandCard key={brand.id} brand={brand} onClick={() => navigate({ name: 'brand', brandId: brand.id })} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Cars */}
      {displayFeatured.length > 0 && (
        <section className="py-20 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.3em] text-ink-500 mb-2">Öne Çıkanlar</p>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gradient">Premium Seçkiler</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayFeatured.map((car) => {
                const coverTransform: ImageTransform | null = car.cover_zoom ? { zoom: car.cover_zoom, offsetX: car.cover_offset_x || 0, offsetY: car.cover_offset_y || 0 } : null;
                return (
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
                      style={buildTransformStyle(coverTransform)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-xs text-ink-400 mb-1">{car.brand?.name}</p>
                      <h3 className="text-lg font-semibold text-white">{car.name}</h3>
                      {car.horsepower && <p className="text-sm text-ink-300 mt-1">{car.horsepower} HP</p>}
                    </div>
                  </div>
                </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <a
              href="mailto:info@awrx.com"
              className="w-10 h-10 glass rounded-full flex items-center justify-center text-ink-400 hover:text-white hover:border-white/20 transition-all"
              aria-label="Gmail"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 12.5l8-5.2V8.5l-8 5.2-8-5.2v-1.2l8 5.2zM22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0v.5l-8 5.2-8-5.2V6h16z"/>
              </svg>
            </a>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 glass rounded-full flex items-center justify-center text-ink-400 hover:text-white hover:border-white/20 transition-all"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p className="text-xs text-ink-500">© 2025 AWRX — Premium Automotive Database</p>
            <button
              onClick={() => navigate({ name: 'admin' })}
              className="text-xs text-ink-600 hover:text-ink-400 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function BrandCard({ brand, onClick }: { brand: Brand; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex-shrink-0 w-[260px] h-[140px] glass rounded-2xl flex flex-col items-center justify-center gap-3 premium-border hover:bg-white/5 transition-all duration-500"
    >
      {brand.logo_url ? (
        <img src={brand.logo_url} alt={brand.name} className="h-10 object-contain opacity-70 group-hover:opacity-100 transition-opacity" />
      ) : (
        <span className="text-2xl font-display font-bold text-ink-400 group-hover:text-white transition-colors">
          {brand.name.charAt(0)}
        </span>
      )}
      <span className="text-sm font-medium text-ink-300 group-hover:text-white transition-colors">{brand.name}</span>
      {brand.country && <span className="text-[10px] text-ink-500">{brand.country}</span>}
    </button>
  );
}
