import { Analytics } from '@vercel/analytics/react';
import { RouterProvider, useRouter } from '@/lib/router';
import { FavoritesProvider } from '@/lib/favorites';
import { ThemeProvider } from '@/lib/theme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Navbar } from '@/components/Navbar';
import { HomePage } from '@/pages/HomePage';
import { BrandPage } from '@/pages/BrandPage';
import { CarPage } from '@/pages/CarPage';
import { SearchPage } from '@/pages/SearchPage';
import { ComparePage } from '@/pages/ComparePage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { MapPage } from '@/pages/MapPage';
import { AdminPage } from '@/pages/AdminPage';

function Routes() {
  const { route } = useRouter();

  switch (route.name) {
    case 'home':
      return <HomePage />;
    case 'brand':
      return <BrandPage brandId={route.brandId} />;
    case 'car':
      return <CarPage carId={route.carId} />;
    case 'search':
      return <SearchPage query={route.query} />;
    case 'compare':
      return <ComparePage carA={route.carA} carB={route.carB} />;
    case 'favorites':
      return <FavoritesPage />;
    case 'map':
      return <MapPage />;
    case 'admin':
      return <AdminPage />;
    default:
      return <HomePage />;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider>
          <FavoritesProvider>
            <div className="min-h-screen bg-base-c text-primary-c transition-colors duration-500">
              <Navbar />
              <Routes />
            </div>
          </FavoritesProvider>
        </RouterProvider>
      </ThemeProvider>
      <Analytics />
    </ErrorBoundary>
  );
}
