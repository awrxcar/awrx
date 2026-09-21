import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'brand'; brandId: string }
  | { name: 'car'; carId: string }
  | { name: 'search'; query: string }
  | { name: 'compare'; carA?: string; carB?: string }
  | { name: 'favorites' }
  | { name: 'map' }
  | { name: 'admin' };

interface RouterContextValue {
  route: Route;
  navigate: (route: Route) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home': return '#/';
    case 'brand': return `#/brand/${route.brandId}`;
    case 'car': return `#/car/${route.carId}`;
    case 'search': return `#/search/${encodeURIComponent(route.query)}`;
    case 'compare': {
      const params = new URLSearchParams();
      if (route.carA) params.set('a', route.carA);
      if (route.carB) params.set('b', route.carB);
      const qs = params.toString();
      return qs ? `#/compare?${qs}` : '#/compare';
    }
    case 'favorites': return '#/favorites';
    case 'map': return '#/map';
    case 'admin': return '#/admin';
    default: return '#/';
  }
}

function hashToRoute(hash: string): Route {
  const h = hash.replace(/^#/, '') || '/';
  const parts = h.split('?');
  const path = parts[0];
  const query = parts[1] ? new URLSearchParams(parts[1]) : new URLSearchParams();

  if (path === '/' || path === '') return { name: 'home' };
  if (path.startsWith('/brand/')) return { name: 'brand', brandId: decodeURIComponent(path.slice('/brand/'.length)) };
  if (path.startsWith('/car/')) return { name: 'car', carId: decodeURIComponent(path.slice('/car/'.length)) };
  if (path.startsWith('/search/')) return { name: 'search', query: decodeURIComponent(path.slice('/search/'.length)) };
  if (path === '/compare') {
    const carA = query.get('a') || undefined;
    const carB = query.get('b') || undefined;
    return { name: 'compare', carA, carB };
  }
  if (path === '/favorites') return { name: 'favorites' };
  if (path === '/map') return { name: 'map' };
  if (path === '/admin') return { name: 'admin' };
  return { name: 'home' };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => hashToRoute(window.location.hash));
  const [canGoBack, setCanGoBack] = useState(() => window.history.length > 1);

  useEffect(() => {
    const onPopState = () => {
      setRoute(hashToRoute(window.location.hash));
      setCanGoBack(window.history.length > 1);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('hashchange', onPopState);
    };
  }, []);

  const navigate = useCallback((r: Route) => {
    const hash = routeToHash(r);
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash);
    }
    setRoute(r);
    setCanGoBack(window.history.length > 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ name: 'home' });
    }
  }, [navigate]);

  return (
    <RouterContext.Provider value={{ route, navigate, goBack, canGoBack }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
