import { useState, useEffect, useRef, useCallback } from 'react';
import { Lock, X, Plus, Trash2, Edit3, Save, Upload, Send, ChevronLeft, Image, Music, MapPin, Star, Lightbulb, Bell, Car as CarIcon, Factory, Settings, GripVertical, Eye, Move, Palette, Crop, Search } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { Logo } from '@/components/Logo';
import { ImageEditor, type ImageTransform } from '@/components/ImageEditor';
import { buildTransformStyle } from '@/components/ImageEditor';
import { supabase } from '@/lib/supabase';
import { useBrands, useAllCars, useNotifications } from '@/lib/hooks';
import { SPEC_FIELDS, HOTSPOT_PARTS, HOTSPOT_ICONS, DEFAULT_GALLERY_CATEGORIES, RATING_CATEGORIES } from '@/lib/types';
import type { Brand, CarWithRelations, GalleryPhoto, CarHotspot, ExhaustSound, CarFact, MapLocation, Model } from '@/lib/types';

const ADMIN_PASSWORD = 'AWRX2025';
const SESSION_KEY = 'awrx_admin_session';

export function AdminPage() {
  const { navigate } = useRouter();
  const [authed, setAuthed] = useState<boolean>(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch { return false; }
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* ignore */ }
      setError(false);
    } else { setError(true); }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <button onClick={() => navigate({ name: 'home' })} className="flex items-center gap-2 text-sm text-ink-400 hover:text-white transition-colors mb-8 mx-auto">
            <ChevronLeft className="w-4 h-4" /> Ana Sayfa
          </button>
          <div className="glass-strong rounded-3xl p-8 animate-scale-in">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl glass mx-auto flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-ink-300" />
              </div>
              <Logo size="md" className="block mb-2" />
              <p className="text-sm text-ink-400">Yönetici Girişi</p>
            </div>
            <form onSubmit={handleLogin}>
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Şifre"
                className={`w-full bg-ink-900/50 border rounded-xl px-4 py-3 text-white placeholder-ink-500 outline-none transition-colors ${error ? 'border-red-500/50' : 'border-white/10 focus:border-white/30'}`} />
              {error && <p className="text-xs text-red-400 mt-2">Hatalı şifre. Erişim engellendi.</p>}
              <button type="submit" className="w-full mt-4 py-3 bg-white text-ink-950 rounded-xl font-medium hover:bg-ink-200 transition-colors">Giriş Yap</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <AdminPanel />;
}

type Tab = 'cars' | 'brands' | 'models' | 'gallery' | 'hotspots' | 'sounds' | 'ratings' | 'facts' | 'locations' | 'notifications';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'brands', label: 'Markalar', icon: <Factory className="w-4 h-4" /> },
  { id: 'models', label: 'Modeller', icon: <CarIcon className="w-4 h-4" /> },
  { id: 'cars', label: 'Araçlar', icon: <CarIcon className="w-4 h-4" /> },
  { id: 'gallery', label: 'Galeri', icon: <Image className="w-4 h-4" /> },
  { id: 'hotspots', label: 'Anatomi', icon: <Settings className="w-4 h-4" /> },
  { id: 'sounds', label: 'Egzoz Sesi', icon: <Music className="w-4 h-4" /> },
  { id: 'ratings', label: 'Puanlar', icon: <Star className="w-4 h-4" /> },
  { id: 'facts', label: 'Biliyor muydunuz', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'locations', label: 'Harita', icon: <MapPin className="w-4 h-4" /> },
  { id: 'notifications', label: 'Bildirimler', icon: <Bell className="w-4 h-4" /> },
];

function AdminPanel() {
  const { navigate } = useRouter();
  const [tab, setTab] = useState<Tab>('brands');

  return (
    <div className="min-h-screen pt-24 px-6 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ink-500 mb-1">Yönetim Paneli</p>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gradient">AWRX Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate({ name: 'home' })} className="flex items-center gap-2 text-sm text-ink-300 hover:text-white transition-colors">
              <Eye className="w-4 h-4" /> Siteyi Gör
            </button>
            <button onClick={() => { try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ } navigate({ name: 'home' }); }}
              className="text-sm text-ink-400 hover:text-white transition-colors">Çıkış</button>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? 'bg-white text-ink-950' : 'glass text-ink-300 hover:text-white'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <div className="animate-fade-in">
          {tab === 'brands' && <BrandsManager />}
          {tab === 'models' && <ModelsManager />}
          {tab === 'cars' && <CarsManager />}
          {tab === 'gallery' && <GalleryManager />}
          {tab === 'hotspots' && <HotspotsManager />}
          {tab === 'sounds' && <SoundsManager />}
          {tab === 'ratings' && <RatingsManager />}
          {tab === 'facts' && <FactsManager />}
          {tab === 'locations' && <LocationsManager />}
          {tab === 'notifications' && <NotificationsManager />}
        </div>
      </div>
    </div>
  );
}

// ============ SHARED HELPERS ============
function slugify(s: string) {
  return s
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const toInt = (v?: string): number | null => {
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

const toFloat = (v?: string): number | null => {
  if (!v) return null;
  const n = parseFloat(v.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

/** Hata varsa kullanıcıya gösterir ve true döner. */
function notifyError(error: { message: string } | null | undefined, action = 'İşlem'): boolean {
  if (error) {
    console.error(error);
    alert(`${action} başarısız oldu: ${error.message}`);
    return true;
  }
  return false;
}

async function uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) { console.error(error); return null; }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function FormField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs text-ink-400 mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 outline-none focus:border-white/30 text-sm" />
    </div>
  );
}

function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="text-xs text-ink-400 mb-1.5 block">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        className="w-full bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 outline-none focus:border-white/30 resize-none text-sm" />
    </div>
  );
}

function FileUploadButton({ bucket, pathPrefix, accept, label, onUploaded }: {
  bucket: string; pathPrefix: string; accept: string; label: string; onUploaded: (url: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handle = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const url = await uploadFile(bucket, path, file);
    setUploading(false);
    if (ref.current) ref.current.value = '';
    if (url) onUploaded(url);
    else alert('Yükleme başarısız oldu. URL ile eklemeyi deneyin.');
  };

  return (
    <>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />
      <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
        className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-sm text-ink-300 hover:text-white transition-colors disabled:opacity-50">
        <Upload className="w-4 h-4" /> {uploading ? 'Yükleniyor...' : label}
      </button>
    </>
  );
}

function CarSelector({ cars, value, onChange }: { cars: CarWithRelations[]; value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-white/30 mb-6">
      <option value="">Araç seçin...</option>
      {cars.map((c) => <option key={c.id} value={c.id}>{c.brand?.name} · {c.model?.name} · {c.name}</option>)}
    </select>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-14 h-14 rounded-2xl glass mx-auto flex items-center justify-center mb-4 text-ink-500">{icon}</div>
      <p className="text-ink-400">{message}</p>
    </div>
  );
}

// ============ BRANDS MANAGER ============
function BrandsManager() {
  const { brands, refetch, loading } = useBrands();
  const [editing, setEditing] = useState<Brand | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', country: '', founded: '', logo_url: '', description: '' });

  const startEdit = (brand: Brand) => {
    setEditing(brand);
    setForm({ name: brand.name, country: brand.country || '', founded: brand.founded ? String(brand.founded) : '', logo_url: brand.logo_url || '', description: brand.description || '' });
    setShowForm(true);
  };

  const startAdd = () => {
    setEditing(null);
    setForm({ name: '', country: '', founded: '', logo_url: '', description: '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) return;
    const payload: Record<string, unknown> = {
      name,
      country: form.country || null,
      founded: toInt(form.founded),
      logo_url: form.logo_url || null,
      description: form.description || null,
    };
    // Düzenlemede isim değişmediyse mevcut slug korunur (bağlantılar bozulmasın)
    if (!editing || editing.name !== name) payload.slug = slugify(name);

    const { error } = editing
      ? await supabase.from('brands').update(payload).eq('id', editing.id)
      : await supabase.from('brands').insert(payload);
    if (notifyError(error, 'Marka kaydı')) return;

    setShowForm(false);
    setEditing(null);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu markayı silmek istediğinize emin misiniz? Tüm modeller ve araçlar silinecek.')) return;
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (notifyError(error, 'Marka silme')) return;
    refetch();
  };

  const filteredBrands = search.trim()
    ? brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()) || (b.country || '').toLowerCase().includes(search.toLowerCase()))
    : brands;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2.5 bg-white text-ink-950 rounded-xl font-medium text-sm hover:bg-ink-200 transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" /> Yeni Marka
        </button>
        <div className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 flex-1">
          <Search className="w-4 h-4 text-ink-500 flex-shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Marka veya ülke ara..."
            className="flex-1 min-w-0 bg-transparent text-white placeholder-ink-500 outline-none text-sm" />
          {search && <button onClick={() => setSearch('')} className="text-ink-500 hover:text-white flex-shrink-0"><X className="w-4 h-4" /></button>}
        </div>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{editing ? 'Marka Düzenle' : 'Yeni Marka'}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-2 glass rounded-lg text-ink-300 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Marka Adı" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <FormField label="Ülke" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
            <FormField label="Kuruluş Yılı" value={form.founded} onChange={(v) => setForm({ ...form, founded: v })} type="number" />
            <FormField label="Logo URL" value={form.logo_url} onChange={(v) => setForm({ ...form, logo_url: v })} />
          </div>
          <div className="mt-4">
            <FileUploadButton bucket="logos" pathPrefix="logos" accept="image/*" label="Logo Yükle"
              onUploaded={(url) => setForm((f) => ({ ...f, logo_url: url }))} />
            {form.logo_url && <img src={form.logo_url} alt="logo preview" className="h-12 mt-2 object-contain" />}
          </div>
          <div className="mt-4"><TextArea label="Açıklama" value={form.description} onChange={(v) => setForm({ ...form, description: v })} /></div>
          <button onClick={handleSave} className="flex items-center gap-2 mt-4 px-5 py-2.5 bg-white text-ink-950 rounded-xl font-medium text-sm">
            <Save className="w-4 h-4" /> Kaydet
          </button>
        </div>
      )}

      {loading ? <p className="text-ink-400">Yükleniyor...</p> : brands.length === 0 ? (
        <EmptyState icon={<Factory className="w-6 h-6" />} message="Henüz marka eklenmemiş. İlk markanızı ekleyin." />
      ) : filteredBrands.length === 0 ? (
        <EmptyState icon={<Search className="w-6 h-6" />} message={`"${search}" ile eşleşen marka yok.`} />
      ) : (
        <div className="space-y-3">
          {filteredBrands.map((brand) => (
            <div key={brand.id} className="glass rounded-2xl p-4 flex items-center gap-4 premium-border">
              {brand.logo_url ? <img src={brand.logo_url} alt="" className="h-8 object-contain" /> :
                <span className="w-8 h-8 rounded-lg glass flex items-center justify-center text-sm font-bold">{brand.name.charAt(0)}</span>}
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{brand.name}</p>
                <p className="text-xs text-ink-400">{brand.country}{brand.founded ? ` · ${brand.founded}` : ''}</p>
              </div>
              <button onClick={() => startEdit(brand)} className="p-2 glass rounded-lg hover:text-white text-ink-300"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(brand.id)} className="p-2 glass rounded-lg hover:text-red-400 text-ink-300"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ MODELS MANAGER ============
function ModelsManager() {
  const { brands, refetch: refetchBrands } = useBrands();
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Model | null>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', cover_url: '' });

  const fetchModels = useCallback(async () => {
    if (!selectedBrand) { setModels([]); return; }
    setLoading(true);
    const { data } = await supabase.from('models').select('*').eq('brand_id', selectedBrand).order('name');
    if (data) setModels(data);
    setLoading(false);
  }, [selectedBrand]);

  useEffect(() => { fetchModels(); }, [fetchModels]);

  const changeBrand = (id: string) => {
    setSelectedBrand(id);
    setShowForm(false);
    setEditing(null);
  };

  const startAdd = () => { setEditing(null); setForm({ name: '', description: '', cover_url: '' }); setShowForm(true); };
  const startEdit = (m: Model) => { setEditing(m); setForm({ name: m.name, description: m.description || '', cover_url: m.cover_image_url || '' }); setShowForm(true); };

  const handleSave = async () => {
    const name = form.name.trim();
    if (!selectedBrand || !name) return;
    const payload: Record<string, unknown> = {
      brand_id: selectedBrand,
      name,
      description: form.description || null,
      cover_image_url: form.cover_url || null,
    };
    if (!editing || editing.name !== name) payload.slug = slugify(name);

    const { error } = editing
      ? await supabase.from('models').update(payload).eq('id', editing.id)
      : await supabase.from('models').insert(payload);
    if (notifyError(error, 'Model kaydı')) return;

    setShowForm(false); setEditing(null); fetchModels(); refetchBrands();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu modeli silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('models').delete().eq('id', id);
    if (notifyError(error, 'Model silme')) return;
    fetchModels();
  };

  const filteredModels = search.trim()
    ? models.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || (m.description || '').toLowerCase().includes(search.toLowerCase()))
    : models;

  return (
    <div>
      <select value={selectedBrand} onChange={(e) => changeBrand(e.target.value)}
        className="w-full bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-white/30 mb-6">
        <option value="">Marka seçin...</option>
        {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </select>

      {selectedBrand && (
        <div className="flex items-center gap-3 mb-6">
          <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2.5 bg-white text-ink-950 rounded-xl font-medium text-sm hover:bg-ink-200 transition-colors flex-shrink-0">
            <Plus className="w-4 h-4" /> Yeni Model
          </button>
          <div className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 flex-1">
            <Search className="w-4 h-4 text-ink-500 flex-shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Model ara..."
              className="flex-1 min-w-0 bg-transparent text-white placeholder-ink-500 outline-none text-sm" />
            {search && <button onClick={() => setSearch('')} className="text-ink-500 hover:text-white flex-shrink-0"><X className="w-4 h-4" /></button>}
          </div>
        </div>
      )}

      {showForm && selectedBrand && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{editing ? 'Model Düzenle' : 'Yeni Model'}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="p-2 glass rounded-lg text-ink-300 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Model Adı" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <div>
              <label className="text-xs text-ink-400 mb-1.5 block">Kapak Fotoğrafı URL</label>
              <div className="flex gap-2">
                <input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
                  className="flex-1 min-w-0 bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 outline-none focus:border-white/30 text-sm" />
                <FileUploadButton bucket="models" pathPrefix={`models/${selectedBrand}`} accept="image/*" label="Yükle"
                  onUploaded={(url) => setForm((f) => ({ ...f, cover_url: url }))} />
              </div>
            </div>
          </div>
          <div className="mt-4"><TextArea label="Açıklama" value={form.description} onChange={(v) => setForm({ ...form, description: v })} /></div>
          {form.cover_url && <img src={form.cover_url} alt="preview" className="h-32 mt-3 rounded-xl object-cover" />}
          <button onClick={handleSave} className="flex items-center gap-2 mt-4 px-5 py-2.5 bg-white text-ink-950 rounded-xl font-medium text-sm">
            <Save className="w-4 h-4" /> Kaydet
          </button>
        </div>
      )}

      {!selectedBrand ? <EmptyState icon={<CarIcon className="w-6 h-6" />} message="Model eklemek için bir marka seçin." /> :
       loading ? <p className="text-ink-400">Yükleniyor...</p> :
       models.length === 0 ? <EmptyState icon={<CarIcon className="w-6 h-6" />} message="Bu markada henüz model yok." /> :
       filteredModels.length === 0 ? <EmptyState icon={<Search className="w-6 h-6" />} message={`"${search}" ile eşleşen model yok.`} /> : (
        <div className="space-y-3">
          {filteredModels.map((m) => (
            <div key={m.id} className="glass rounded-2xl p-4 flex items-center gap-4 premium-border">
              {m.cover_image_url ? <img src={m.cover_image_url} alt="" className="w-14 h-14 rounded-xl object-cover" /> :
                <div className="w-14 h-14 rounded-xl glass flex items-center justify-center"><CarIcon className="w-5 h-5 text-ink-500" /></div>}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{m.name}</p>
                {m.description && <p className="text-xs text-ink-400 truncate">{m.description}</p>}
              </div>
              <button onClick={() => startEdit(m)} className="p-2 glass rounded-lg hover:text-white text-ink-300"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(m.id)} className="p-2 glass rounded-lg hover:text-red-400 text-ink-300"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ CARS MANAGER ============
function CarsManager() {
  const { cars, loading, refetch } = useAllCars();
  const { brands } = useBrands();
  const [editing, setEditing] = useState<CarWithRelations | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const handleDelete = async (id: string) => {
    if (!confirm('Bu aracı silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('cars').delete().eq('id', id);
    if (notifyError(error, 'Araç silme')) return;
    refetch();
  };

  if (showForm || editing) {
    return <CarForm car={editing} brands={brands} onClose={() => { setShowForm(false); setEditing(null); refetch(); }} />;
  }

  const filteredCars = search.trim()
    ? cars.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.brand?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.model?.name || '').toLowerCase().includes(search.toLowerCase()))
    : cars;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white text-ink-950 rounded-xl font-medium text-sm hover:bg-ink-200 transition-colors flex-shrink-0">
          <Plus className="w-4 h-4" /> Yeni Araç
        </button>
        <div className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 flex-1">
          <Search className="w-4 h-4 text-ink-500 flex-shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Araç, marka veya model ara..."
            className="flex-1 min-w-0 bg-transparent text-white placeholder-ink-500 outline-none text-sm" />
          {search && <button onClick={() => setSearch('')} className="text-ink-500 hover:text-white flex-shrink-0"><X className="w-4 h-4" /></button>}
        </div>
      </div>

      {loading ? <p className="text-ink-400">Yükleniyor...</p> : cars.length === 0 ? (
        <EmptyState icon={<CarIcon className="w-6 h-6" />} message="Henüz araç eklenmemiş. İlk aracınızı ekleyin." />
      ) : filteredCars.length === 0 ? (
        <EmptyState icon={<Search className="w-6 h-6" />} message={`"${search}" ile eşleşen araç yok.`} />
      ) : (
        <div className="space-y-3">
          {filteredCars.map((car) => {
            const thumb = car.cover_image_url || car.hero_image_url;
            return (
              <div key={car.id} className="glass rounded-2xl p-4 flex items-center gap-4 premium-border">
                {thumb ? (
                  <img src={thumb} alt="" className="w-16 h-16 rounded-xl object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-16 h-16 rounded-xl glass flex items-center justify-center flex-shrink-0"><CarIcon className="w-5 h-5 text-ink-500" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{car.name}</p>
                  <p className="text-xs text-ink-400">{car.brand?.name} · {car.model?.name}</p>
                  {car.horsepower && <p className="text-xs text-ink-500 mt-0.5">{car.horsepower} HP</p>}
                </div>
                {car.is_featured && <span className="text-[10px] px-2 py-0.5 glass rounded-full text-ink-300">Öne Çıkan</span>}
                <button onClick={() => setEditing(car)} className="p-2 glass rounded-lg hover:text-white text-ink-300"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(car.id)} className="p-2 glass rounded-lg hover:text-red-400 text-ink-300"><Trash2 className="w-4 h-4" /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CarForm({ car, brands, onClose }: { car: CarWithRelations | null; brands: Brand[]; onClose: () => void }) {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    if (car) {
      const obj: Record<string, string> = {};
      Object.keys(car).forEach((k) => { obj[k] = String((car as unknown as Record<string, unknown>)[k] ?? ''); });
      return obj;
    }
    return {};
  });
  const [selectedBrandId, setSelectedBrandId] = useState(car?.model?.brand_id || '');
  const [selectedModelId, setSelectedModelId] = useState(car?.model_id || '');
  const [newModelName, setNewModelName] = useState('');
  const [createNewModel, setCreateNewModel] = useState(!car);
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const [editingImage, setEditingImage] = useState<{ type: 'hero' | 'cover'; url: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const buildTransform = (prefix: 'hero' | 'cover'): ImageTransform | null => {
    const zoom = toFloat(formData[`${prefix}_zoom`]);
    if (!zoom) return null;
    return {
      zoom,
      offsetX: toFloat(formData[`${prefix}_offset_x`]) ?? 0,
      offsetY: toFloat(formData[`${prefix}_offset_y`]) ?? 0,
    };
  };
  const heroTransform = buildTransform('hero');
  const coverTransform = buildTransform('cover');

  useEffect(() => {
    if (!selectedBrandId) { setModels([]); return; }
    supabase.from('models').select('id, name').eq('brand_id', selectedBrandId).order('name')
      .then(({ data }) => { if (data) setModels(data); });
  }, [selectedBrandId]);

  const setField = (key: string, value: string) => setFormData((p) => ({ ...p, [key]: value }));
  const setFields = (obj: Record<string, string>) => setFormData((p) => ({ ...p, ...obj }));

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      let modelId = selectedModelId;
      if (createNewModel && selectedBrandId && newModelName.trim()) {
        const name = newModelName.trim();
        const { data, error } = await supabase.from('models').insert({ brand_id: selectedBrandId, name, slug: slugify(name) }).select().single();
        if (error) { alert('Model oluşturulamadı: ' + error.message); return; }
        modelId = data.id;
      }
      if (!modelId) { alert('Lütfen bir model seçin veya oluşturun.'); return; }

      const name = (formData.name || '').trim() || 'Untitled';
      const payload: Record<string, unknown> = {
        model_id: modelId,
        name,
        cover_image_url: formData.cover_image_url || null,
        hero_image_url: formData.hero_image_url || null,
        hero_zoom: toFloat(formData.hero_zoom),
        hero_offset_x: toFloat(formData.hero_offset_x),
        hero_offset_y: toFloat(formData.hero_offset_y),
        cover_zoom: toFloat(formData.cover_zoom),
        cover_offset_x: toFloat(formData.cover_offset_x),
        cover_offset_y: toFloat(formData.cover_offset_y),
        engine: formData.engine || null,
        engine_code: formData.engine_code || null,
        cylinders: toInt(formData.cylinders),
        displacement: formData.displacement || null,
        turbo_system: formData.turbo_system || null,
        hybrid_system: formData.hybrid_system || null,
        horsepower: toInt(formData.horsepower),
        torque: formData.torque || null,
        acceleration_0_100: formData.acceleration_0_100 || null,
        top_speed: formData.top_speed || null,
        transmission: formData.transmission || null,
        drivetrain: formData.drivetrain || null,
        fuel_type: formData.fuel_type || null,
        weight: formData.weight || null,
        production_years: formData.production_years || null,
        production_count: formData.production_count || null,
        estimated_value: formData.estimated_value || null,
        description: formData.description || null,
        is_featured: formData.is_featured === 'true',
      };
      // Düzenlemede isim değişmediyse mevcut slug korunur
      if (!car || car.name !== name) payload.slug = slugify(name);

      const { error } = car
        ? await supabase.from('cars').update(payload).eq('id', car.id)
        : await supabase.from('cars').insert(payload);
      if (notifyError(error, 'Araç kaydı')) return;

      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleUploaded = (type: 'hero' | 'cover', url: string) => {
    // Yeni fotoğrafta eski zoom/kaydırma değerleri sıfırlanır
    setFields({
      [`${type}_image_url`]: url,
      [`${type}_zoom`]: '',
      [`${type}_offset_x`]: '',
      [`${type}_offset_y`]: '',
    });
    setEditingImage({ type, url });
  };

  return (
    <>
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">{car ? 'Aracı Düzenle' : 'Yeni Araç'}</h3>
          <button onClick={onClose} className="p-2 glass rounded-lg text-ink-300 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <div className="mb-6">
          <label className="text-xs text-ink-400 mb-1.5 block">Marka</label>
          <select value={selectedBrandId} onChange={(e) => { setSelectedBrandId(e.target.value); setSelectedModelId(''); setCreateNewModel(true); }}
            className="w-full bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-white/30">
            <option value="">Marka seçin...</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1.5">
            <label className="text-xs text-ink-400">Model</label>
            <button type="button" onClick={() => setCreateNewModel(!createNewModel)} className="text-xs text-ink-500 hover:text-white">
              {createNewModel ? 'Mevcut model seç' : 'Yeni model oluştur'}
            </button>
          </div>
          {createNewModel ? (
            <input value={newModelName} onChange={(e) => setNewModelName(e.target.value)} placeholder="Yeni model adı"
              className="w-full bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 outline-none focus:border-white/30" />
          ) : (
            <select value={selectedModelId} onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-white/30">
              <option value="">Model seçin...</option>
              {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Araç Adı" value={formData.name || ''} onChange={(v) => setField('name', v)} />
          <div>
            <label className="text-xs text-ink-400 mb-1.5 block">Kapak Fotoğrafı</label>
            <div className="flex gap-2">
              <input value={formData.cover_image_url || ''} onChange={(e) => setField('cover_image_url', e.target.value)} placeholder="URL"
                className="flex-1 min-w-0 bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 outline-none focus:border-white/30 text-sm" />
              <FileUploadButton label="Yükle" bucket="cars" pathPrefix={`cars/${selectedModelId || 'temp'}`} accept="image/*"
                onUploaded={(url) => handleUploaded('cover', url)} />
              {formData.cover_image_url && <button type="button" onClick={() => setEditingImage({ type: 'cover', url: formData.cover_image_url })} className="flex items-center gap-1.5 px-3 py-2.5 glass rounded-xl text-sm text-ink-300 hover:text-white"><Crop className="w-4 h-4" /> Düzenle</button>}
            </div>
            {formData.cover_image_url && (
              <div className="relative mt-2 rounded-xl overflow-hidden premium-border" style={{ aspectRatio: '4/3' }}>
                <img src={formData.cover_image_url} alt="cover preview" className="absolute inset-0 w-full h-full object-cover" style={buildTransformStyle(coverTransform)} />
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-ink-400 mb-1.5 block">Hero Fotoğrafı</label>
            <div className="flex gap-2">
              <input value={formData.hero_image_url || ''} onChange={(e) => setField('hero_image_url', e.target.value)} placeholder="URL"
                className="flex-1 min-w-0 bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 outline-none focus:border-white/30 text-sm" />
              <FileUploadButton label="Yükle" bucket="cars" pathPrefix={`cars/${selectedModelId || 'temp'}`} accept="image/*"
                onUploaded={(url) => handleUploaded('hero', url)} />
              {formData.hero_image_url && <button type="button" onClick={() => setEditingImage({ type: 'hero', url: formData.hero_image_url })} className="flex items-center gap-1.5 px-3 py-2.5 glass rounded-xl text-sm text-ink-300 hover:text-white"><Crop className="w-4 h-4" /> Düzenle</button>}
            </div>
            {formData.hero_image_url && (
              <div className="relative mt-2 rounded-xl overflow-hidden premium-border" style={{ aspectRatio: '16/9' }}>
                <img src={formData.hero_image_url} alt="hero preview" className="absolute inset-0 w-full h-full object-cover" style={buildTransformStyle(heroTransform)} />
              </div>
            )}
          </div>
          {SPEC_FIELDS.map(({ key, label }) => (
            <FormField key={key} label={label} value={formData[key] || ''} onChange={(v) => setField(key, v)} />
          ))}
        </div>

        <div className="mt-4"><TextArea label="Açıklama" value={formData.description || ''} onChange={(v) => setField('description', v)} /></div>

        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input type="checkbox" checked={formData.is_featured === 'true'} onChange={(e) => setField('is_featured', e.target.checked ? 'true' : 'false')} className="w-4 h-4 accent-white" />
          <span className="text-sm text-ink-300">Öne çıkan araç</span>
        </label>

        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-white text-ink-950 rounded-xl font-medium text-sm hover:bg-ink-200 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 glass rounded-xl text-sm text-ink-300 hover:text-white">İptal</button>
        </div>
      </div>

      {editingImage && (
        <ImageEditor
          imageUrl={editingImage.url}
          title={editingImage.type === 'hero' ? 'Hero Fotoğrafı Düzenle' : 'Kapak Fotoğrafı Düzenle'}
          aspectRatio={editingImage.type === 'hero' ? '16/9' : '4/3'}
          initialTransform={editingImage.type === 'hero' ? heroTransform : coverTransform}
          onSave={(t) => {
            const p = editingImage.type;
            setFields({
              [`${p}_image_url`]: editingImage.url,
              [`${p}_zoom`]: String(t.zoom),
              [`${p}_offset_x`]: String(t.offsetX),
              [`${p}_offset_y`]: String(t.offsetY),
            });
            setEditingImage(null);
          }}
          onCancel={() => setEditingImage(null)}
        />
      )}
    </>
  );
}

// ============ GALLERY MANAGER ============
function GalleryManager() {
  const { cars } = useAllCars();
  const [selectedCar, setSelectedCar] = useState('');
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedPhotoIdx, setDraggedPhotoIdx] = useState<number | null>(null);
  const [form, setForm] = useState({ image_url: '', category: '', shot_by: 'AWRX', camera: '', lens: '', shot_date: '', location: '', description: '', tags: '' });
  const [newCategory, setNewCategory] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchAll = useCallback(async () => {
    if (!selectedCar) { setPhotos([]); setCategories([]); return; }
    const [{ data: photosData }, { data: catData }] = await Promise.all([
      supabase.from('gallery_photos').select('*').eq('car_id', selectedCar).order('display_order').order('created_at'),
      supabase.from('gallery_categories').select('*').eq('car_id', selectedCar).order('display_order'),
    ]);
    if (photosData) setPhotos(photosData);
    if (catData) setCategories(catData);
  }, [selectedCar]);

  useEffect(() => { setPhotos([]); setCategories([]); fetchAll(); }, [fetchAll]);

  const allCategoryNames = Array.from(new Set([...DEFAULT_GALLERY_CATEGORIES, ...categories.map((c) => c.name)]));

  const photoPayload = (imageUrl: string) => ({
    car_id: selectedCar, image_url: imageUrl,
    category: form.category || DEFAULT_GALLERY_CATEGORIES[0],
    shot_by: form.shot_by || 'AWRX',
    camera: form.camera || null, lens: form.lens || null,
    shot_date: form.shot_date || null, location: form.location || null,
    description: form.description || null, tags: form.tags || null,
  });

  const handleFiles = async (files: FileList) => {
    if (!selectedCar) { alert('Önce araç seçin.'); return; }
    setUploading(true);
    let failed = 0;
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `gallery/${selectedCar}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const url = await uploadFile('gallery', path, file);
      if (!url) { failed++; continue; }
      const { error } = await supabase.from('gallery_photos').insert(photoPayload(url));
      if (error) { console.error(error); failed++; }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    if (failed) alert(`${failed} fotoğraf yüklenemedi.`);
    fetchAll();
  };

  const handleAddByUrl = async () => {
    if (!selectedCar || !form.image_url.trim()) return;
    const { error } = await supabase.from('gallery_photos').insert(photoPayload(form.image_url.trim()));
    if (notifyError(error, 'Fotoğraf ekleme')) return;
    setForm({ ...form, image_url: '' });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) return;
    const { error } = await supabase.from('gallery_photos').delete().eq('id', id);
    if (notifyError(error, 'Fotoğraf silme')) return;
    fetchAll();
  };

  const handleSetCover = async (photo: GalleryPhoto) => {
    const { error } = await supabase.from('cars').update({
      cover_image_url: photo.image_url,
      cover_zoom: null, cover_offset_x: null, cover_offset_y: null,
    }).eq('id', selectedCar);
    if (notifyError(error, 'Kapak güncelleme')) return;
    alert('Kapak fotoğrafı güncellendi.');
  };

  const handleReorder = async (fromIdx: number, toIdx: number) => {
    const reordered = [...photos];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setPhotos(reordered);
    const results = await Promise.all(
      reordered.map((p, i) => supabase.from('gallery_photos').update({ display_order: i }).eq('id', p.id))
    );
    const failed = results.find((r) => r.error);
    if (failed) { notifyError(failed.error, 'Sıralama'); fetchAll(); }
  };

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!selectedCar || !name) return;
    if (allCategoryNames.some((c) => c.toLowerCase() === name.toLowerCase())) {
      alert('Bu kategori zaten var.');
      return;
    }
    const { error } = await supabase.from('gallery_categories').insert({ car_id: selectedCar, name });
    if (notifyError(error, 'Kategori ekleme')) return;
    setNewCategory('');
    fetchAll();
  };

  const handleDeleteCategory = async (id: string) => {
    const { error } = await supabase.from('gallery_categories').delete().eq('id', id);
    if (notifyError(error, 'Kategori silme')) return;
    fetchAll();
  };

  return (
    <div>
      <CarSelector cars={cars} value={selectedCar} onChange={setSelectedCar} />

      {selectedCar && (
        <>
          {/* Drag & Drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all mb-6 ${
              dragOver ? 'border-white/40 bg-white/5' : 'border-white/10 hover:border-white/20'}`}
          >
            <Upload className="w-8 h-8 text-ink-400 mx-auto mb-3" />
            <p className="text-sm text-ink-300">{uploading ? 'Yükleniyor...' : 'Fotoğrafları sürükleyip bırakın veya tıklayın'}</p>
            <p className="text-xs text-ink-500 mt-1">Sınırsız fotoğraf · Otomatik kategori atama</p>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => e.target.files?.length && handleFiles(e.target.files)} />
          </div>

          {/* Category Management */}
          <div className="glass rounded-2xl p-5 mb-6">
            <p className="text-xs text-ink-400 mb-3">Galeri Kategorileri</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {allCategoryNames.map((cat) => (
                <span key={cat} className="text-xs px-3 py-1.5 glass rounded-full text-ink-300">{cat}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="Yeni kategori adı"
                className="flex-1 min-w-0 bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-ink-500 outline-none focus:border-white/30 text-sm" />
              <button onClick={handleAddCategory} className="flex items-center gap-1 px-4 py-2 bg-white text-ink-950 rounded-xl text-sm font-medium">
                <Plus className="w-4 h-4" /> Kategori Ekle
              </button>
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {categories.map((c) => (
                  <button key={c.id} onClick={() => handleDeleteCategory(c.id)} className="flex items-center gap-1 text-xs px-2 py-1 glass rounded-full text-ink-400 hover:text-red-400">
                    {c.name} <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* URL Add Form */}
          <div className="glass rounded-2xl p-5 mb-6">
            <p className="text-xs text-ink-400 mb-3">URL ile Fotoğraf Ekle</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Fotoğraf URL" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} />
              <div>
                <label className="text-xs text-ink-400 mb-1.5 block">Kategori</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none text-sm">
                  <option value="">Kategori seçin...</option>
                  {allCategoryNames.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <FormField label="Shot by" value={form.shot_by} onChange={(v) => setForm({ ...form, shot_by: v })} />
              <FormField label="Kamera" value={form.camera} onChange={(v) => setForm({ ...form, camera: v })} />
              <FormField label="Lens" value={form.lens} onChange={(v) => setForm({ ...form, lens: v })} />
              <FormField label="Çekim Tarihi" value={form.shot_date} onChange={(v) => setForm({ ...form, shot_date: v })} type="date" />
              <FormField label="Konum" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
              <FormField label="Etiketler" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} />
            </div>
            <button onClick={handleAddByUrl} className="flex items-center gap-2 mt-4 px-4 py-2 bg-white text-ink-950 rounded-xl text-sm font-medium">
              <Plus className="w-4 h-4" /> Ekle
            </button>
          </div>

          {/* Photo Grid with Drag Reorder */}
          {photos.length === 0 ? <EmptyState icon={<Image className="w-6 h-6" />} message="Henüz fotoğraf yok." /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {photos.map((photo, idx) => (
                <div key={photo.id}
                  draggable
                  onDragStart={() => setDraggedPhotoIdx(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (draggedPhotoIdx !== null && draggedPhotoIdx !== idx) handleReorder(draggedPhotoIdx, idx); setDraggedPhotoIdx(null); }}
                  className="relative group aspect-square rounded-xl overflow-hidden cursor-move"
                >
                  <img src={photo.image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-ink-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <button onClick={() => handleSetCover(photo)} className="text-xs glass-dark rounded-lg px-2 py-1 text-white hover:text-ink-200">Kapak Yap</button>
                    <button onClick={() => handleDelete(photo.id)} className="p-2 glass-dark rounded-lg text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="absolute top-1 left-1 flex items-center gap-1">
                    <span className="text-[9px] glass-dark px-1.5 py-0.5 rounded text-ink-300">{photo.category}</span>
                  </div>
                  <div className="absolute top-1 right-1 opacity-50 group-hover:opacity-100">
                    <GripVertical className="w-3 h-3 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============ HOTSPOTS MANAGER (Visual Editor) ============
function HotspotsManager() {
  const { cars } = useAllCars();
  const [selectedCar, setSelectedCar] = useState('');
  const [hotspots, setHotspots] = useState<CarHotspot[]>([]);
  const [car, setCar] = useState<CarWithRelations | null>(null);
  const [editing, setEditing] = useState<Partial<CarHotspot> | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragMoved = useRef(false);

  const fetchAll = useCallback(async () => {
    if (!selectedCar) { setHotspots([]); setCar(null); return; }
    const [{ data: hsData }, { data: carData }] = await Promise.all([
      supabase.from('car_hotspots').select('*').eq('car_id', selectedCar),
      supabase.from('cars').select('*, model:models(*, brand:brands(*))').eq('id', selectedCar).maybeSingle(),
    ]);
    if (hsData) setHotspots(hsData);
    if (carData) setCar(carData as CarWithRelations);
  }, [selectedCar]);

  useEffect(() => { setEditing(null); setAddingNew(false); fetchAll(); }, [fetchAll]);

  const handleImageClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !addingNew) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setEditing({ car_id: selectedCar, x_position: x, y_position: y, part_name: HOTSPOT_PARTS[0], title: '', description: '', specs: '', icon_name: 'Circle', icon_color: '#ffffff' });
    setAddingNew(false);
  };

  const startDrag = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    dragMoved.current = false;
    let last: { x: number; y: number } | null = null;

    const onMove = (ev: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(2, Math.min(98, ((ev.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(2, Math.min(98, ((ev.clientY - rect.top) / rect.height) * 100));
      dragMoved.current = true;
      last = { x, y };
      setHotspots((hs) => hs.map((h) => (h.id === id ? { ...h, x_position: x, y_position: y } : h)));
    };

    const onUp = async () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      if (last) {
        const { error } = await supabase.from('car_hotspots').update({ x_position: last.x, y_position: last.y }).eq('id', id);
        notifyError(error, 'Hotspot konumu kaydetme');
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const handleSave = async () => {
    if (!editing || !selectedCar) return;
    const payload = {
      car_id: selectedCar,
      part_name: editing.part_name || HOTSPOT_PARTS[0],
      x_position: editing.x_position ?? 50,
      y_position: editing.y_position ?? 50,
      title: editing.title || 'Untitled',
      description: editing.description || null,
      specs: editing.specs || null,
      icon_name: editing.icon_name || 'Circle',
      icon_color: editing.icon_color || '#ffffff',
    };
    const { error } = editing.id
      ? await supabase.from('car_hotspots').update(payload).eq('id', editing.id)
      : await supabase.from('car_hotspots').insert(payload);
    if (notifyError(error, 'Hotspot kaydı')) return;
    setEditing(null);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu hotspot silinsin mi?')) return;
    const { error } = await supabase.from('car_hotspots').delete().eq('id', id);
    if (notifyError(error, 'Hotspot silme')) return;
    setEditing(null);
    fetchAll();
  };

  const heroImg = car?.cover_image_url || car?.hero_image_url || '';

  return (
    <div>
      <CarSelector cars={cars} value={selectedCar} onChange={setSelectedCar} />

      {selectedCar && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setAddingNew(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${addingNew ? 'bg-white/20 text-white' : 'bg-white text-ink-950 hover:bg-ink-200'}`}>
              <Plus className="w-4 h-4" /> {addingNew ? 'Fotoğrafa tıklayın...' : 'Hotspot Ekle'}
            </button>
            {addingNew && <button onClick={() => setAddingNew(false)} className="text-sm text-ink-400 hover:text-white">İptal</button>}
          </div>

          {!heroImg ? (
            <EmptyState icon={<Image className="w-6 h-6" />} message="Bu araç için kapak fotoğrafı yok. Önce araç düzenleyin ve kapak fotoğrafı ekleyin." />
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Visual Editor */}
              <div className="lg:col-span-2">
                <div ref={containerRef} onClick={handleImageClick}
                  className={`relative rounded-2xl overflow-hidden premium-border ${addingNew ? 'cursor-crosshair' : ''}`}>
                  <img src={heroImg} alt="" className="w-full object-contain bg-ink-900 select-none pointer-events-none" draggable={false} />
                  {hotspots.map((spot) => (
                    <div key={spot.id}
                      onPointerDown={(e) => startDrag(e, spot.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (dragMoved.current) { dragMoved.current = false; return; }
                        setEditing(spot);
                      }}
                      className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 cursor-move z-10 group"
                      style={{ left: `${spot.x_position}%`, top: `${spot.y_position}%`, touchAction: 'none' }}>
                      <span className="flex items-center justify-center w-7 h-7 rounded-full border-2"
                        style={{ borderColor: spot.icon_color || '#fff', color: spot.icon_color || '#fff', backgroundColor: `${spot.icon_color || '#fff'}33` }}>
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: spot.icon_color || '#fff' }} />
                      </span>
                      <span className="absolute inset-0 rounded-full border-2 animate-ping pointer-events-none" style={{ borderColor: spot.icon_color || '#fff' }} />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-ink-500 mt-3 flex items-center gap-2">
                  <Move className="w-3 h-3" /> Hotspot'ları sürükleyerek taşıyın · Tıklayarak düzenleyin
                </p>
              </div>

              {/* Edit Panel */}
              <div className="glass rounded-2xl p-5">
                {editing ? (
                  <div className="animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-white">{editing.id ? 'Hotspot Düzenle' : 'Yeni Hotspot'}</h3>
                      <button onClick={() => setEditing(null)} className="p-1.5 glass rounded-lg text-ink-300 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-ink-400 mb-1.5 block">Parça</label>
                        <select value={editing.part_name || HOTSPOT_PARTS[0]} onChange={(e) => setEditing({ ...editing, part_name: e.target.value })}
                          className="w-full bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none text-sm">
                          {HOTSPOT_PARTS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <FormField label="Başlık" value={editing.title || ''} onChange={(v) => setEditing({ ...editing, title: v })} />
                      <TextArea label="Açıklama" value={editing.description || ''} onChange={(v) => setEditing({ ...editing, description: v })} rows={2} />
                      <TextArea label="Teknik Bilgiler" value={editing.specs || ''} onChange={(v) => setEditing({ ...editing, specs: v })} rows={2} />
                      <div>
                        <label className="text-xs text-ink-400 mb-1.5 flex items-center gap-1"><Palette className="w-3 h-3" /> İkon</label>
                        <select value={editing.icon_name || 'Circle'} onChange={(e) => setEditing({ ...editing, icon_name: e.target.value })}
                          className="w-full bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none text-sm">
                          {HOTSPOT_ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-ink-400 mb-1.5 block">Renk</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={editing.icon_color || '#ffffff'} onChange={(e) => setEditing({ ...editing, icon_color: e.target.value })}
                            className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
                          <span className="text-sm text-ink-300">{editing.icon_color || '#ffffff'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-white text-ink-950 rounded-xl text-sm font-medium">
                          <Save className="w-4 h-4" /> Kaydet
                        </button>
                        {editing.id && <button onClick={() => handleDelete(editing.id!)} className="flex items-center gap-1 px-3 py-2 glass rounded-xl text-sm text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" /> Sil
                        </button>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-ink-400 mb-3">{hotspots.length} hotspot</p>
                    <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
                      {hotspots.map((h) => (
                        <button key={h.id} onClick={() => setEditing(h)}
                          className="w-full text-left glass rounded-xl p-3 hover:border-white/20 transition-all flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: h.icon_color || '#fff' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{h.title}</p>
                            <p className="text-xs text-ink-500">{h.part_name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    {hotspots.length === 0 && <p className="text-xs text-ink-500 text-center py-4">Henüz hotspot yok. "Hotspot Ekle" butonuna tıklayın.</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============ SOUNDS MANAGER ============
function SoundsManager() {
  const { cars } = useAllCars();
  const [selectedCar, setSelectedCar] = useState('');
  const [sounds, setSounds] = useState<ExhaustSound[]>([]);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const fetchSounds = useCallback(async () => {
    if (!selectedCar) { setSounds([]); return; }
    const { data } = await supabase.from('exhaust_sounds').select('*').eq('car_id', selectedCar);
    if (data) setSounds(data);
  }, [selectedCar]);

  useEffect(() => { setSounds([]); fetchSounds(); }, [fetchSounds]);

  const handleAddUrl = async () => {
    if (!selectedCar || !url.trim()) return;
    const { error } = await supabase.from('exhaust_sounds').insert({ car_id: selectedCar, audio_url: url.trim(), title: title || 'Exhaust Sound' });
    if (notifyError(error, 'Ses ekleme')) return;
    setUrl(''); setTitle('');
    fetchSounds();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ses kaydı silinsin mi?')) return;
    const { error } = await supabase.from('exhaust_sounds').delete().eq('id', id);
    if (notifyError(error, 'Ses silme')) return;
    fetchSounds();
  };

  return (
    <div>
      <CarSelector cars={cars} value={selectedCar} onChange={setSelectedCar} />

      {selectedCar && (
        <>
          <div className="glass rounded-2xl p-5 mb-6">
            <FormField label="Başlık" value={title} onChange={setTitle} />
            <div className="mt-3">
              <FileUploadWithInsert bucket="sounds" pathPrefix={`sounds/${selectedCar}`} accept="audio/*" carId={selectedCar} title={title}
                onDone={() => { setTitle(''); fetchSounds(); }} />
            </div>
            <div className="mt-3">
              <FormField label="Veya Ses URL" value={url} onChange={setUrl} />
            </div>
            <button onClick={handleAddUrl} className="flex items-center gap-2 mt-3 px-4 py-2 bg-white text-ink-950 rounded-xl text-sm font-medium">
              <Plus className="w-4 h-4" /> URL ile Ekle
            </button>
          </div>

          {sounds.length === 0 ? <EmptyState icon={<Music className="w-6 h-6" />} message="Henüz ses kaydı yok." /> : (
            <div className="space-y-3">
              {sounds.map((s) => (
                <div key={s.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                  <Music className="w-5 h-5 text-ink-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{s.title}</p>
                    <audio controls src={s.audio_url} className="mt-2 h-8 w-full max-w-md" />
                  </div>
                  <button onClick={() => handleDelete(s.id)} className="p-2 glass rounded-lg hover:text-red-400 text-ink-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function FileUploadWithInsert({ bucket, pathPrefix, accept, carId, title, onDone }: {
  bucket: string; pathPrefix: string; accept: string; carId: string; title: string; onDone: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handle = async (file: File) => {
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const url = await uploadFile(bucket, path, file);
    if (url) {
      const { error } = await supabase.from('exhaust_sounds').insert({ car_id: carId, audio_url: url, title: title || 'Exhaust Sound' });
      notifyError(error, 'Ses kaydı ekleme');
    } else {
      alert('Ses dosyası yüklenemedi.');
    }
    setUploading(false);
    if (ref.current) ref.current.value = '';
    onDone();
  };

  return (
    <>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />
      <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
        className="flex items-center gap-2 px-4 py-2.5 bg-white text-ink-950 rounded-xl text-sm font-medium hover:bg-ink-200 transition-colors disabled:opacity-50">
        <Upload className="w-4 h-4" /> {uploading ? 'Yükleniyor...' : 'Ses Dosyası Yükle (MP3, WAV)'}
      </button>
    </>
  );
}

// ============ RATINGS MANAGER ============
function RatingsManager() {
  const { cars } = useAllCars();
  const [selectedCar, setSelectedCar] = useState('');
  const [rating, setRating] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!selectedCar) { setRating({}); return; }
    let cancelled = false;
    supabase.from('car_ratings').select('*').eq('car_id', selectedCar).maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const r: Record<string, string> = {};
        RATING_CATEGORIES.forEach(({ key }) => { r[key] = String((data as Record<string, unknown> | null)?.[key] ?? '0'); });
        setRating(r);
      });
    return () => { cancelled = true; };
  }, [selectedCar]);

  const handleSave = async () => {
    if (!selectedCar) return;
    const payload: Record<string, number | string> = { car_id: selectedCar };
    RATING_CATEGORIES.forEach(({ key }) => { payload[key] = toFloat(rating[key]) ?? 0; });
    const existing = await supabase.from('car_ratings').select('id').eq('car_id', selectedCar).maybeSingle();
    if (notifyError(existing.error, 'Puan okuma')) return;
    const { error } = existing.data
      ? await supabase.from('car_ratings').update({ ...payload, updated_at: new Date().toISOString() }).eq('car_id', selectedCar)
      : await supabase.from('car_ratings').insert(payload);
    if (notifyError(error, 'Puan kaydı')) return;
    alert('Puanlar kaydedildi.');
  };

  return (
    <div>
      <CarSelector cars={cars} value={selectedCar} onChange={setSelectedCar} />

      {selectedCar && (
        <div className="glass rounded-2xl p-6">
          <div className="space-y-4">
            {RATING_CATEGORIES.map(({ key, label }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm text-ink-300">{label}</label>
                  <span className="text-sm font-medium text-white">{rating[key] || '0'} / 10</span>
                </div>
                <input type="range" min="0" max="10" step="0.1" value={rating[key] || '0'}
                  onChange={(e) => setRating({ ...rating, [key]: e.target.value })} className="w-full accent-white" />
              </div>
            ))}
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 mt-6 px-5 py-2.5 bg-white text-ink-950 rounded-xl font-medium text-sm">
            <Save className="w-4 h-4" /> Puanları Kaydet
          </button>
        </div>
      )}
    </div>
  );
}

// ============ FACTS MANAGER ============
function FactsManager() {
  const { cars } = useAllCars();
  const [selectedCar, setSelectedCar] = useState('');
  const [facts, setFacts] = useState<CarFact[]>([]);
  const [fact, setFact] = useState('');

  const fetchFacts = useCallback(async () => {
    if (!selectedCar) { setFacts([]); return; }
    const { data } = await supabase.from('car_facts').select('*').eq('car_id', selectedCar).order('display_order');
    if (data) setFacts(data);
  }, [selectedCar]);

  useEffect(() => { setFacts([]); fetchFacts(); }, [fetchFacts]);

  const handleAdd = async () => {
    if (!selectedCar || !fact.trim()) return;
    const { error } = await supabase.from('car_facts').insert({ car_id: selectedCar, fact: fact.trim() });
    if (notifyError(error, 'Bilgi ekleme')) return;
    setFact('');
    fetchFacts();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('car_facts').delete().eq('id', id);
    if (notifyError(error, 'Bilgi silme')) return;
    fetchFacts();
  };

  return (
    <div>
      <CarSelector cars={cars} value={selectedCar} onChange={setSelectedCar} />

      {selectedCar && (
        <>
          <div className="glass rounded-2xl p-5 mb-6">
            <TextArea label="İlginç Bilgi" value={fact} onChange={setFact} />
            <button onClick={handleAdd} className="flex items-center gap-2 mt-3 px-4 py-2 bg-white text-ink-950 rounded-xl text-sm font-medium">
              <Plus className="w-4 h-4" /> Ekle
            </button>
          </div>

          {facts.length === 0 ? <EmptyState icon={<Lightbulb className="w-6 h-6" />} message="Henüz bilgi kartı yok." /> : (
            <div className="space-y-3">
              {facts.map((f) => (
                <div key={f.id} className="glass rounded-2xl p-4 flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-ink-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-ink-200 flex-1">{f.fact}</p>
                  <button onClick={() => handleDelete(f.id)} className="p-1.5 glass rounded-lg hover:text-red-400 text-ink-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============ LOCATIONS MANAGER ============
function LocationsManager() {
  const { cars } = useAllCars();
  const [selectedCar, setSelectedCar] = useState('');
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [form, setForm] = useState({ name: '', lat: '', lng: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const fetchLocations = useCallback(async () => {
    if (!selectedCar) { setLocations([]); return; }
    const { data } = await supabase.from('map_locations').select('*').eq('car_id', selectedCar);
    if (data) setLocations(data);
  }, [selectedCar]);

  useEffect(() => { setLocations([]); fetchLocations(); }, [fetchLocations]);

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&accept-language=tr&q=${encodeURIComponent(searchQuery.trim())}&limit=5`);
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      const results = data.map((r: { display_name: string; lat: string; lon: string }) => ({ display_name: r.display_name, lat: r.lat, lon: r.lon }));
      setSearchResults(results);
      if (results.length === 0) setSearchError('Sonuç bulunamadı.');
    } catch {
      setSearchError('Arama yapılamadı. Bağlantınızı kontrol edin veya koordinatları elle girin.');
    }
    setSearching(false);
  };

  const handleAdd = async () => {
    if (!selectedCar || !form.name.trim()) return;
    const lat = toFloat(form.lat);
    const lng = toFloat(form.lng);
    if (lat === null || lng === null || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Geçerli bir enlem (-90 ile 90) ve boylam (-180 ile 180) girin.');
      return;
    }
    const { error } = await supabase.from('map_locations').insert({
      car_id: selectedCar, name: form.name.trim(),
      latitude: lat, longitude: lng,
      description: form.description || null,
    });
    if (notifyError(error, 'Konum ekleme')) return;
    setForm({ name: '', lat: '', lng: '', description: '' });
    setSearchResults([]);
    fetchLocations();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('map_locations').delete().eq('id', id);
    if (notifyError(error, 'Konum silme')) return;
    fetchLocations();
  };

  return (
    <div>
      <CarSelector cars={cars} value={selectedCar} onChange={setSelectedCar} />

      {selectedCar && (
        <>
          <div className="glass rounded-2xl p-5 mb-6">
            <p className="text-xs text-ink-400 mb-3">Konum Ara (OpenStreetMap)</p>
            <div className="flex gap-2 mb-3">
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
                placeholder="Şehir, adres veya mekan adı..."
                className="flex-1 min-w-0 bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 outline-none focus:border-white/30 text-sm" />
              <button onClick={searchLocation} disabled={searching}
                className="px-4 py-2.5 bg-white text-ink-950 rounded-xl text-sm font-medium disabled:opacity-50">
                {searching ? 'Aranıyor...' : 'Ara'}
              </button>
            </div>
            {searchError && <p className="text-xs text-red-400 mb-3">{searchError}</p>}
            {searchResults.length > 0 && (
              <div className="space-y-1 mb-4">
                {searchResults.map((r, i) => (
                  <button key={i} onClick={() => setForm({ ...form, lat: r.lat, lng: r.lon, name: r.display_name.split(',')[0] })}
                    className="w-full text-left glass rounded-xl p-2.5 hover:border-white/20 transition-all">
                    <p className="text-xs text-ink-200 truncate">{r.display_name}</p>
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Konum Adı" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <FormField label="Açıklama" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
              <FormField label="Enlem (Latitude)" value={form.lat} onChange={(v) => setForm({ ...form, lat: v })} />
              <FormField label="Boylam (Longitude)" value={form.lng} onChange={(v) => setForm({ ...form, lng: v })} />
            </div>
            <button onClick={handleAdd} className="flex items-center gap-2 mt-4 px-4 py-2 bg-white text-ink-950 rounded-xl text-sm font-medium">
              <Plus className="w-4 h-4" /> Konum Ekle
            </button>
          </div>

          {locations.length === 0 ? <EmptyState icon={<MapPin className="w-6 h-6" />} message="Henüz konum yok." /> : (
            <div className="space-y-3">
              {locations.map((l) => (
                <div key={l.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-ink-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{l.name}</p>
                    {l.description && <p className="text-xs text-ink-400">{l.description}</p>}
                    <p className="text-[10px] text-ink-500">{Number(l.latitude).toFixed(4)}, {Number(l.longitude).toFixed(4)}</p>
                  </div>
                  <button onClick={() => handleDelete(l.id)} className="p-2 glass rounded-lg hover:text-red-400 text-ink-300"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============ NOTIFICATIONS MANAGER ============
function NotificationsManager() {
  const { notifications, refetch } = useNotifications();
  const [form, setForm] = useState({ title: '', body: '', type: 'new_car' });

  const handleSend = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from('notifications').insert({ title: form.title.trim(), body: form.body || null, type: form.type });
    if (notifyError(error, 'Bildirim gönderme')) return;
    setForm({ title: '', body: '', type: 'new_car' });
    refetch();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (notifyError(error, 'Bildirim silme')) return;
    refetch();
  };

  return (
    <div>
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField label="Başlık" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <div>
            <label className="text-xs text-ink-400 mb-1.5 block">Tip</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-ink-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none text-sm">
              <option value="new_car">Yeni Araç</option>
              <option value="update">Güncelleme</option>
              <option value="news">Haber</option>
            </select>
          </div>
          <div className="md:col-span-2"><TextArea label="İçerik" value={form.body} onChange={(v) => setForm({ ...form, body: v })} rows={2} /></div>
        </div>
        <button onClick={handleSend} className="flex items-center gap-2 mt-4 px-4 py-2 bg-white text-ink-950 rounded-xl text-sm font-medium">
          <Send className="w-4 h-4" /> Bildirim Gönder
        </button>
      </div>

      {notifications.length === 0 ? <EmptyState icon={<Bell className="w-6 h-6" />} message="Henüz bildirim yok." /> : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="glass rounded-2xl p-4 flex items-center gap-3">
              <Bell className="w-4 h-4 text-ink-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{n.title}</p>
                {n.body && <p className="text-xs text-ink-400">{n.body}</p>}
                <p className="text-[10px] text-ink-500">{new Date(n.created_at).toLocaleDateString('tr-TR')}</p>
              </div>
              <button onClick={() => handleDelete(n.id)} className="p-2 glass rounded-lg hover:text-red-400 text-ink-300"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}