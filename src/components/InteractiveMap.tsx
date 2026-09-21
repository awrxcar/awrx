import { useEffect, useRef, useState } from 'react';
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

const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

// Türkiye + Kıbrıs sınırları [güney-batı, kuzey-doğu]
const TR_CY_BOUNDS: [[number, number], [number, number]] = [
  [34.3, 25.5],
  [42.3, 45.0],
];

let leafletPromise: Promise<any> | null = null;

function loadLeaflet(): Promise<any> {
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve(w.L);
    script.onerror = () => {
      leafletPromise = null;
      reject(new Error('Leaflet yüklenemedi'));
    };
    document.body.appendChild(script);
  });
  return leafletPromise;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );

export function InteractiveMap({ locations, onLocationClick }: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const clickRef = useRef(onLocationClick);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clickRef.current = onLocationClick;
  }, [onLocationClick]);

  // Haritayı oluştur
  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
          minZoom: 5,
          maxZoom: 18,
          scrollWheelZoom: true,
        });
        map.fitBounds(TR_CY_BOUNDS);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        markersRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        setReady(true);

        // Kapsayıcı boyutu sonradan oturursa haritayı düzelt
        setTimeout(() => map.invalidateSize(), 100);
      })
      .catch((e) => setError(e.message));

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
      }
    };
  }, []);

  // İşaretçileri güncelle
  useEffect(() => {
    const L = (window as any).L;
    if (!ready || !L || !markersRef.current) return;

    markersRef.current.clearLayers();

    const icon = L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;border-radius:9999px;background:#f59e0b;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5)"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    locations.forEach((loc) => {
      const lat = Number(loc.latitude);
      const lng = Number(loc.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const marker = L.marker([lat, lng], { icon });
      const html = `<div><b style="font-size:12px">${escapeHtml(loc.name)}</b>${
        loc.car ? `<br/><span style="font-size:11px;opacity:.7">${escapeHtml(loc.car.name)}</span>` : ''
      }</div>`;
      marker.bindTooltip(html, { direction: 'top', offset: [0, -10] });
      marker.on('click', () => clickRef.current?.(loc));
      marker.addTo(markersRef.current);
    });
  }, [locations, ready]);

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-2xl premium-border"
      style={{ minHeight: '500px' }}
    >
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-[1000] text-sm text-red-500">
          Harita yüklenemedi. İnternet bağlantını kontrol et.
        </div>
      )}

      <button
        onClick={() => mapRef.current?.fitBounds(TR_CY_BOUNDS)}
        className="absolute bottom-4 right-4 z-[1000] w-10 h-10 glass-dark rounded-xl flex items-center justify-center text-secondary-c hover:text-primary-c transition-colors"
        aria-label="Sıfırla"
      >
        <Locate className="w-5 h-5" />
      </button>

      <div className="absolute top-4 left-4 glass-dark rounded-xl px-3 py-2 flex items-center gap-2 z-[1000]">
        <Globe className="w-4 h-4 text-muted-c" />
        <span className="text-xs text-secondary-c">Türkiye & KKTC Haritası</span>
      </div>
    </div>
  );
}
