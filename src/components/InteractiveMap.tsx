import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe, Locate } from 'lucide-react';

interface MapLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string | null;
  car?: { id: string; name: string } | null;
}

interface InteractiveMapProps {
  locations: MapLocation[];
  onLocationClick?: (loc: MapLocation) => void;
}

// Türkiye + KKTC'yi kapsayan sınırlar
const TR_CY_BOUNDS = L.latLngBounds([34.3, 25.5], [42.3, 45.0]);
const DEFAULT_CENTER: L.LatLngExpression = [38.6, 34.5];

// Karo sağlayıcıları: biri çalışmazsa sıradakine geçilir
const TILE_PROVIDERS: { url: string; options: L.TileLayerOptions }[] = [
  {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    options: { subdomains: 'abcd', maxZoom: 19, attribution: '&copy; OpenStreetMap &copy; CARTO' },
  },
  {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: { maxZoom: 19, attribution: '&copy; OpenStreetMap' },
  },
  {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    options: { maxZoom: 19, attribution: 'Tiles &copy; Esri' },
  },
];

const PROVIDER_TIMEOUT_MS = 7000;
const ERRORS_BEFORE_SWITCH = 3;

const markerIcon = L.divIcon({
  className: 'awrx-pin-wrapper',
  html: '<div class="awrx-pin"><span class="awrx-pin-pulse"></span><span class="awrx-pin-dot"></span></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const MAP_STYLES = `
.awrx-pin-wrapper { background: transparent !important; border: 0 !important; }
.awrx-pin { position: relative; width: 20px; height: 20px; }
.awrx-pin-dot {
  position: absolute; left: 3px; top: 3px; width: 14px; height: 14px; border-radius: 9999px;
  background: #f59e0b; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,.5);
  transition: transform .15s ease;
}
.awrx-pin-pulse {
  position: absolute; inset: 0; border-radius: 9999px; background: #f59e0b; opacity: .35;
  animation: awrx-ping 1.8s cubic-bezier(0,0,.2,1) infinite;
}
.awrx-pin-wrapper:hover .awrx-pin-dot { transform: scale(1.3); }
@keyframes awrx-ping { 75%, 100% { transform: scale(2.2); opacity: 0; } }
.awrx-tooltip .awrx-tt-name { font-size: 12px; font-weight: 600; }
.awrx-tooltip .awrx-tt-car { font-size: 11px; opacity: .7; }
`;

function parseCoord(v: unknown): number | null {
  const n = typeof v === 'string' ? parseFloat(v.replace(',', '.')) : Number(v);
  return Number.isFinite(n) ? n : null;
}

function buildTooltip(loc: MapLocation): HTMLElement {
  const wrap = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'awrx-tt-name';
  name.textContent = loc.name;
  wrap.appendChild(name);
  if (loc.car?.name) {
    const car = document.createElement('div');
    car.className = 'awrx-tt-car';
    car.textContent = loc.car.name;
    wrap.appendChild(car);
  }
  return wrap;
}

export function InteractiveMap({ locations, onLocationClick }: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const clickRef = useRef(onLocationClick);
  const restartTilesRef = useRef<() => void>(() => {});
  const [tilesFailed, setTilesFailed] = useState(false);

  useEffect(() => {
    clickRef.current = onLocationClick;
  }, [onLocationClick]);

  // Haritayı oluştur
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      center: DEFAULT_CENTER,
      zoom: 5,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
    });
    L.control.zoom({ position: 'topright' }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // ---- Karo sağlayıcısı yönetimi ----
    let tileLayer: L.TileLayer | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const startProvider = (idx: number) => {
      if (timer) clearTimeout(timer);
      if (tileLayer) {
        map.removeLayer(tileLayer);
        tileLayer = null;
      }
      if (idx >= TILE_PROVIDERS.length) {
        setTilesFailed(true);
        return;
      }

      const provider = TILE_PROVIDERS[idx];
      const layer = L.tileLayer(provider.url, provider.options);
      let loaded = false;
      let errors = 0;

      layer.on('tileload', () => {
        if (tileLayer !== layer || loaded) return;
        loaded = true;
        if (timer) clearTimeout(timer);
        setTilesFailed(false);
      });
      layer.on('tileerror', () => {
        if (tileLayer !== layer || loaded) return;
        errors += 1;
        if (errors >= ERRORS_BEFORE_SWITCH) startProvider(idx + 1);
      });

      tileLayer = layer;
      layer.addTo(map);
      timer = setTimeout(() => {
        if (tileLayer === layer && !loaded) startProvider(idx + 1);
      }, PROVIDER_TIMEOUT_MS);
    };

    restartTilesRef.current = () => {
      setTilesFailed(false);
      startProvider(0);
    };
    startProvider(0);

    // ---- Boyut ve ilk görünüm ----
    let fitted = false;
    const fitIfReady = () => {
      const size = map.getSize();
      if (size.x > 0 && size.y > 0) {
        map.invalidateSize(false);
        if (!fitted) {
          map.fitBounds(TR_CY_BOUNDS, { animate: false });
          fitted = true;
        }
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
        fitIfReady();
      });
      resizeObserver.observe(el);
    }

    const onWindowChange = () => {
      map.invalidateSize();
      fitIfReady();
    };
    window.addEventListener('resize', onWindowChange);
    window.addEventListener('orientationchange', onWindowChange);
    window.addEventListener('pageshow', onWindowChange);
    document.addEventListener('visibilitychange', onWindowChange);

    fitIfReady();
    const t1 = setTimeout(fitIfReady, 100);
    const t2 = setTimeout(fitIfReady, 500);

    return () => {
      if (timer) clearTimeout(timer);
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', onWindowChange);
      window.removeEventListener('orientationchange', onWindowChange);
      window.removeEventListener('pageshow', onWindowChange);
      document.removeEventListener('visibilitychange', onWindowChange);
      map.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
  }, []);

  // İşaretçileri güncelle
  useEffect(() => {
    const group = markersRef.current;
    if (!group) return;
    group.clearLayers();

    locations.forEach((loc) => {
      const lat = parseCoord(loc.latitude);
      const lng = parseCoord(loc.longitude);
      if (lat === null || lng === null || lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

      const marker = L.marker([lat, lng], { icon: markerIcon, title: loc.name, keyboard: true });
      marker.bindTooltip(buildTooltip(loc), {
        direction: 'top',
        offset: [0, -10],
        className: 'awrx-tooltip',
      });
      marker.on('click', () => clickRef.current?.(loc));
      marker.addTo(group);
    });
  }, [locations]);

  const resetView = useCallback(() => {
    mapRef.current?.fitBounds(TR_CY_BOUNDS, { animate: true });
  }, []);

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-2xl premium-border"
      style={{ minHeight: 420, isolation: 'isolate' }}
    >
      <style>{MAP_STYLES}</style>

      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, zIndex: 0, background: '#dbe4ea' }}
      />

      {tilesFailed && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] glass-dark rounded-xl px-4 py-3 flex items-center gap-3 text-xs text-white max-w-[90%]">
          <span>Harita karoları yüklenemedi. İnternet bağlantını kontrol et.</span>
          <button
            onClick={() => restartTilesRef.current()}
            className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 whitespace-nowrap"
          >
            Yeniden dene
          </button>
        </div>
      )}

      <button
        onClick={resetView}
        className="absolute bottom-4 right-4 z-[1000] w-10 h-10 glass-dark rounded-xl flex items-center justify-center text-secondary-c hover:text-primary-c transition-colors"
        aria-label="Sıfırla"
      >
        <Locate className="w-5 h-5" />
      </button>

      <div className="absolute top-4 left-4 glass-dark rounded-xl px-3 py-2 flex items-center gap-2 z-[1000] pointer-events-none">
        <Globe className="w-4 h-4 text-muted-c" />
        <span className="text-xs text-secondary-c">Türkiye & KKTC Haritası</span>
      </div>
    </div>
  );
}