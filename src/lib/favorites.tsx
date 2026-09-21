import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface FavoritesContextValue {
  favorites: string[];
  toggleFavorite: (carId: string) => void;
  isFavorite: (carId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

const STORAGE_KEY = 'awrx_favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const toggleFavorite = (carId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(carId) ? prev.filter((id) => id !== carId) : [...prev, carId];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const isFavorite = (carId: string) => favorites.includes(carId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
