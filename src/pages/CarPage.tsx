import { useState } from 'react';
import { ChevronLeft, Heart, Share2, Volume2, Play, Pause, MapPin, Lightbulb, Camera, Gauge, Zap, Settings, Fuel, Weight, Star, Users } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useFavorites } from '@/lib/favorites';
import { useCar, useGallery, useHotspots, useExhaustSounds, useRating, useFacts, useMapLocations, useGalleryCategories, useVisitorRatings } from '@/lib/hooks';
import { SPEC_FIELDS, RATING_CATEGORIES, DEFAULT_GALLERY_CATEGORIES, VISITOR_RATING_CATEGORIES } from '@/lib/types';
import { buildTransformStyle, type ImageTransform } from '@/components/ImageEditor';
import * as LucideIcons from 'lucide-react';

export function CarPage({ carId }: { carId: string }) {
  const { navigate, goBack } = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { car, loading } = useCar(carId);
  const { photos } = useGallery(carId);
  const { hotspots } = useHotspots(carId);
  const { sounds } = useExhaustSounds(carId);
  const { rating } = useRating(carId);
  const { facts } = useFacts(carId);
  const { locations } = useMapLocations(carId);
  const { categories: customCats } = useGalleryCategories(carId);
  const { aggregate: visitorAggregate, myRating, submitRating, submitting } = useVisitorRatings(carId);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [activeGalleryCat, setActiveGalleryCat] = useState<string>('all');
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [visitorScores, setVisitorScores] = useState({
    comfort_score: myRating?.comfort_score || 5,
    engine_score: myRating?.engine_score || 5,
    exterior_design_score: myRating?.exterior_design_score || 5,
    general_score: myRating?.general_score || 5,
  });
  const [scoresInitialized, setScoresInitialized] = useState(false);

  if (myRating && !scoresInitialized) {
    setVisitorScores({
      comfort_score: myRating.comfort_score,
      engine_score: myRating.engine_score,
      exterior_design_score: myRating.exterior_design_score,
      general_score: myRating.general_score,
    });
    setScoresInitialized(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="shimmer-bg rounded-3xl h-[60vh] mb-8" />
          <div className="shimmer-bg rounded-2xl h-8 w-64 mb-4" />
          <div className="shimmer-bg rounded-2xl h-4 w-full mb-2" />
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-400 mb-4">Araç bulunamadı.</p>
          <button onClick={() => navigate({ name: 'home' })} className="text-white underline">Ana sayfaya dön</button>
        </div>
      </div>
    );
  }

  const fav = isFavorite(car.id);
  const heroImg = car.hero_image_url || car.cover_image_url || 'https://images.pexels.com/photos/33345481/pexels-photo-33345481.jpeg?auto=compress&cs=tinysrgb&w=1920';
  const heroTransform: ImageTransform | null = car.hero_zoom ? { zoom: car.hero_zoom, offsetX: car.hero_offset_x || 0, offsetY: car.hero_offset_y || 0 } : null;

  const allGalleryCats = [
    ...DEFAULT_GALLERY_CATEGORIES,
    ...customCats.map((c) => c.name),
  ];
  const filteredPhotos = activeGalleryCat === 'all' ? photos : photos.filter((p) => p.category === activeGalleryCat);

  const avgRating = rating ? (
    (rating.design_score + rating.sound_score + rating.driving_experience_score + rating.daily_usability_score + rating.rarity_score + rating.photography_score) / 6
  ) : 0;

  return (
    <div className="min-h-screen">
      {/* Hero Cover */}
      <section className="relative h-[70vh] overflow-hidden">
        <img src={heroImg} alt={car.name} className="absolute inset-0 w-full h-full object-cover" style={buildTransformStyle(heroTransform)} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/60 to-transparent" />

        <div className="absolute top-24 left-0 right-0 px-6">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-sm text-ink-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Ana Sayfa
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10">
          <div className="max-w-7xl mx-auto">
            <p className="text-xs uppercase tracking-[0.3em] text-ink-400 mb-2">{car.model?.name}</p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-3">{car.name}</h1>
            <div className="flex flex-wrap items-center gap-4">
              {car.horsepower && <span className="glass px-3 py-1.5 rounded-full text-sm text-white">{car.horsepower} HP</span>}
              {car.acceleration_0_100 && <span className="glass px-3 py-1.5 rounded-full text-sm text-white">0-100: {car.acceleration_0_100}s</span>}
              {car.top_speed && <span className="glass px-3 py-1.5 rounded-full text-sm text-white">{car.top_speed}</span>}
              {avgRating > 0 && <span className="glass px-3 py-1.5 rounded-full text-sm text-white">{avgRating.toFixed(1)} / 10 AWRX</span>}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Action Bar */}
        <div className="flex items-center gap-3 mb-12">
          <button
            onClick={() => toggleFavorite(car.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              fav ? 'bg-white text-ink-950' : 'glass text-ink-300 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{fav ? 'Favorilerde' : 'Favorilere Ekle'}</span>
          </button>
          <button
            onClick={() => navigate({ name: 'compare', carA: car.id })}
            className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-ink-300 hover:text-white transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Karşılaştır</span>
          </button>
        </div>

        {/* Description */}
        {car.description && (
          <div className="mb-16 max-w-3xl">
            <p className="text-lg text-ink-300 leading-relaxed">{car.description}</p>
          </div>
        )}

        {/* Technical Specs */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-white mb-6">Teknik Özellikler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {SPEC_FIELDS.map(({ key, label }) => {
              const value = (car as unknown as Record<string, unknown>)[key];
              if (!value) return null;
              const isEstimatedValue = key === 'estimated_value';
              return (
                <div key={key} className="bg-ink-900/50 p-5">
                  <p className="text-xs text-ink-500 mb-1">{label}</p>
                  <p className="text-sm text-white font-medium">{String(value)}</p>
                  {isEstimatedValue && (
                    <p className="text-[11px] text-ink-400 mt-1.5">
                      Değerleme tarihi: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Car Anatomy */}
        {hotspots.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-display font-bold text-white mb-2">Araç Anatomisi</h2>
            <p className="text-sm text-ink-400 mb-6">Noktalara tıklayarak parça detaylarını keşfedin</p>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 relative rounded-2xl overflow-hidden premium-border">
                <img src={car.cover_image_url || heroImg} alt={car.name} className="w-full object-contain bg-ink-900" />
                {hotspots.map((spot) => {
                  const IconComp = spot.icon_name ? (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[spot.icon_name] : null;
                  const color = spot.icon_color || '#ffffff';
                  return (
                    <button
                      key={spot.id}
                      onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                      className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 group z-10"
                      style={{ left: `${spot.x_position}%`, top: `${spot.y_position}%` }}
                    >
                      {IconComp ? (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all" style={{ borderColor: color, color, backgroundColor: activeHotspot === spot.id ? color : `${color}33` }}>
                          <IconComp className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className={`block w-6 h-6 rounded-full border-2 transition-all ${
                          activeHotspot === spot.id ? 'bg-white border-white scale-125' : 'bg-white/20 border-white/60 group-hover:bg-white/40'
                        }`} />
                      )}
                      <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
                    </button>
                  );
                })}
              </div>
              <div className="glass rounded-2xl p-6">
                {activeHotspot ? (
                  (() => {
                    const spot = hotspots.find((h) => h.id === activeHotspot);
                    if (!spot) return null;
                    return (
                      <div className="animate-fade-in">
                        <h3 className="text-lg font-semibold text-white mb-1">{spot.title}</h3>
                        <p className="text-xs text-ink-500 uppercase tracking-wider mb-3">{spot.part_name}</p>
                        {spot.description && <p className="text-sm text-ink-300 leading-relaxed mb-4">{spot.description}</p>}
                        {spot.specs && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-xs text-ink-500 mb-2">Teknik Detaylar</p>
                            <p className="text-sm text-ink-200 whitespace-pre-line">{spot.specs}</p>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-8">
                    <Settings className="w-8 h-8 text-ink-500 mx-auto mb-3" />
                    <p className="text-sm text-ink-400">Bir noktaya tıklayarak parça detaylarını görüntüleyin</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Exhaust Sound */}
        {sounds.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Egzoz Sesi</h2>
            <div className="space-y-3">
              {sounds.map((sound) => (
                <div key={sound.id} className="glass rounded-2xl p-5 flex items-center gap-4">
                  <button
                    onClick={() => {
                      const audio = document.getElementById(`audio-${sound.id}`) as HTMLAudioElement | null;
                      if (playingSound === sound.id) {
                        audio?.pause();
                        setPlayingSound(null);
                      } else {
                        document.querySelectorAll('audio').forEach((a) => a.pause());
                        audio?.play();
                        setPlayingSound(sound.id);
                      }
                    }}
                    className="w-12 h-12 rounded-full bg-white text-ink-950 flex items-center justify-center hover:bg-ink-200 transition-colors flex-shrink-0"
                  >
                    {playingSound === sound.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{sound.title}</p>
                    {sound.duration && <p className="text-xs text-ink-500">{sound.duration}</p>}
                  </div>
                  <Volume2 className="w-5 h-5 text-ink-500" />
                  <audio
                    id={`audio-${sound.id}`}
                    src={sound.audio_url}
                    onEnded={() => setPlayingSound(null)}
                    className="hidden"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AWRX Rating */}
        {rating && (
          <section className="mb-16">
            <h2 className="text-2xl font-display font-bold text-white mb-6">AWRX Puanı</h2>
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/10">
                <div className="text-center">
                  <p className="text-5xl font-display font-bold text-white">{avgRating.toFixed(1)}</p>
                  <p className="text-xs text-ink-500 mt-1">/ 10.0</p>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${avgRating * 10}%` }} />
                  </div>
                  <p className="text-xs text-ink-400 mt-2">AWRX Toplam Puanı</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RATING_CATEGORIES.map(({ key, label }) => {
                  const score = rating[key] as number;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-ink-300">{label}</span>
                        <span className="text-sm font-medium text-white">{score.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/70 rounded-full transition-all duration-1000" style={{ width: `${score * 10}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Visitor Rating */}
        <section className="mb-16">
          <h2 className="text-2xl font-display font-bold text-white mb-2">Ziyaretçi Puanları</h2>
          <p className="text-sm text-ink-400 mb-6">Bu aracı puanlayın — üye olmanız gerekmez</p>
          <div className="glass rounded-2xl p-6 md:p-8">
            {visitorAggregate && (
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/10">
                <div className="text-center">
                  <p className="text-5xl font-display font-bold text-white">{visitorAggregate.overall.toFixed(1)}</p>
                  <p className="text-xs text-ink-500 mt-1">/ 10.0</p>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${visitorAggregate.overall * 10}%` }} />
                  </div>
                  <p className="text-xs text-ink-400 mt-2 flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> {visitorAggregate.count} ziyaretçi puanladı
                  </p>
                </div>
              </div>
            )}
            {visitorAggregate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {VISITOR_RATING_CATEGORIES.map(({ key, label }) => {
                  const scoreMap: Record<string, number> = {
                    comfort_score: visitorAggregate.comfort,
                    engine_score: visitorAggregate.engine,
                    exterior_design_score: visitorAggregate.exterior,
                    general_score: visitorAggregate.general,
                  };
                  const score = scoreMap[key];
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-ink-300">{label}</span>
                        <span className="text-sm font-medium text-white">{score.toFixed(1)}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/70 rounded-full transition-all duration-1000" style={{ width: `${score * 10}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="pt-6 border-t border-white/10">
              <p className="text-sm font-medium text-white mb-4">
                {myRating ? 'Puanınızı Güncelleyin' : 'Bu Araca Puan Verin'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {VISITOR_RATING_CATEGORIES.map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-ink-300 flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-ink-500" /> {label}
                      </span>
                      <span className="text-sm font-medium text-white">{visitorScores[key]} / 10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={visitorScores[key]}
                      onChange={(e) => setVisitorScores({ ...visitorScores, [key]: parseInt(e.target.value) })}
                      className="w-full accent-white"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => submitRating(visitorScores)}
                disabled={submitting}
                className="flex items-center gap-2 mt-6 px-5 py-2.5 bg-white text-ink-950 rounded-xl font-medium text-sm hover:bg-ink-200 transition-colors disabled:opacity-50"
              >
                <Star className="w-4 h-4" /> {submitting ? 'Gönderiliyor...' : myRating ? 'Puanı Güncelle' : 'Puanı Gönder'}
              </button>
              {myRating && (
                <p className="text-xs text-ink-500 mt-3">Bu aracı zaten puanladınız. Puanınızı istediğiniz zaman güncelleyebilirsiniz.</p>
              )}
            </div>
          </div>
        </section>

        {/* AWRX Gallery */}
        {photos.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-display font-bold text-white mb-6">AWRX Gallery</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveGalleryCat('all')}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${activeGalleryCat === 'all' ? 'bg-white text-ink-950' : 'glass text-ink-300 hover:text-white'}`}
              >
                Tümü
              </button>
              {allGalleryCats.map((catName) => (
                <button
                  key={catName}
                  onClick={() => setActiveGalleryCat(catName)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-all ${activeGalleryCat === catName ? 'bg-white text-ink-950' : 'glass text-ink-300 hover:text-white'}`}
                >
                  {catName}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredPhotos.map((photo) => (
                <div key={photo.id} className="group">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden premium-border">
                    <img src={photo.image_url} alt={photo.description || ''} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white font-medium">{photo.shot_by}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        {photo.camera && <span className="text-[10px] text-ink-300">{photo.camera}</span>}
                        {photo.lens && <span className="text-[10px] text-ink-300">{photo.lens}</span>}
                        {photo.shot_date && <span className="text-[10px] text-ink-300">{new Date(photo.shot_date).toLocaleDateString('tr-TR')}</span>}
                        {photo.location && <span className="text-[10px] text-ink-300">{photo.location}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Did You Know */}
        {facts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Biliyor muydunuz?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {facts.map((fact, i) => (
                <div key={fact.id} className="glass rounded-2xl p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">{i + 1}</span>
                  </div>
                  <p className="text-sm text-ink-200 leading-relaxed">{fact.fact}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Map Locations */}
        {locations.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-display font-bold text-white mb-6">Çekim Konumları</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {locations.map((loc) => (
                <div key={loc.id} className="glass rounded-2xl p-5 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-ink-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">{loc.name}</p>
                    {loc.description && <p className="text-xs text-ink-400 mt-1">{loc.description}</p>}
                    <p className="text-[10px] text-ink-500 mt-1">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
