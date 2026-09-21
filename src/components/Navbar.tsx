import { useState, useEffect } from 'react';
import { Search, Heart, Map as MapIcon, GitCompare, Bell, X, Menu, Sun, Moon } from 'lucide-react';
import { useRouter, type Route } from '@/lib/router';
import { useTheme } from '@/lib/theme';
import { Logo } from '@/components/Logo';
import { useNotifications } from '@/lib/hooks';

export function Navbar() {
  const { route, navigate } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { notifications, markAsRead, removingId } = useNotifications();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [bellOpen, setBellOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const unreadCount = notifications.length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate({ name: 'search', query: searchValue.trim() });
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  const navItem = (label: string, target: Route, icon?: React.ReactNode) => (
    <button
      onClick={() => { navigate(target); setMobileMenu(false); }}
      className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${
        route.name === target.name ? 'text-primary-c' : 'text-secondary-c hover:text-primary-c'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-dark py-3' : 'py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <button onClick={() => navigate({ name: 'home' })} className="flex items-center">
            <Logo size="md" />
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {navItem('Keşfet', { name: 'home' })}
            {navItem('Karşılaştır', { name: 'compare' }, <GitCompare className="w-4 h-4" />)}
            {navItem('Favoriler', { name: 'favorites' }, <Heart className="w-4 h-4" />)}
            {navItem('Harita', { name: 'map' }, <MapIcon className="w-4 h-4" />)}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-secondary-c hover:text-primary-c transition-colors"
              aria-label="Ara"
            >
              <Search className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setBellOpen(!bellOpen)}
                className="p-2 text-secondary-c hover:text-primary-c transition-colors relative"
                aria-label="Bildirimler"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 text-[10px] font-bold accent-bg rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {bellOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 glass-dark rounded-2xl p-4 z-50 animate-fade-in-down max-h-96 overflow-y-auto no-scrollbar">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-primary-c">Bildirimler</span>
                      <button onClick={() => setBellOpen(false)} className="text-muted-c hover:text-primary-c">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-c py-4 text-center">Henüz bildirim yok</p>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`glass rounded-xl p-3 cursor-pointer hover:border-hover-c transition-all ${
                              removingId === n.id ? 'animate-slide-out' : ''
                            }`}
                            onClick={() => markAsRead(n.id)}
                          >
                            <p className="text-sm font-medium text-primary-c">{n.title}</p>
                            {n.body && <p className="text-xs text-muted-c mt-1">{n.body}</p>}
                            <p className="text-[10px] text-faint-c mt-1">
                              {new Date(n.created_at).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 text-secondary-c hover:text-primary-c transition-colors"
              aria-label={theme === 'dark' ? 'Gündüz moduna geç' : 'Gece moduna geç'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden p-2 text-secondary-c hover:text-primary-c"
              aria-label="Menü"
            >
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden glass-dark border-t border-subtle-c mt-3 px-6 py-4 flex flex-col gap-4 animate-fade-in-down">
            {navItem('Keşfet', { name: 'home' })}
            {navItem('Karşılaştır', { name: 'compare' }, <GitCompare className="w-4 h-4" />)}
            {navItem('Favoriler', { name: 'favorites' }, <Heart className="w-4 h-4" />)}
            {navItem('Harita', { name: 'map' }, <MapIcon className="w-4 h-4" />)}
          </div>
        )}
      </header>

      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-base-c/60 backdrop-blur-xl flex items-start justify-center pt-32 px-6 animate-fade-in"
          onClick={() => setSearchOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submitSearch}
            className="w-full max-w-2xl"
          >
            <div className="glass-strong rounded-2xl p-2 flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-c ml-3" />
              <input
                autoFocus
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="700 HP V8 Mercedes, Twin Turbo Ferrari, AWD Porsche 500 HP..."
                className="flex-1 bg-transparent text-primary-c placeholder-faint-c outline-none py-3 text-base"
              />
              <button type="submit" className="px-4 py-2 accent-bg rounded-xl font-medium text-sm accent-bg-hover transition-colors">
                Ara
              </button>
            </div>
            <p className="text-xs text-faint-c mt-3 text-center">
              Doğal dilde arayın: "V12 Lamborghini", "Twin Turbo Ferrari under 2020", "AWD Porsche 500 HP"
            </p>
          </form>
        </div>
      )}
    </>
  );
}
