export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  country: string | null;
  founded: number | null;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface Model {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
}

export interface Car {
  id: string;
  model_id: string;
  name: string;
  slug: string;
  cover_image_url: string | null;
  hero_image_url: string | null;
  engine: string | null;
  engine_code: string | null;
  cylinders: number | null;
  displacement: string | null;
  turbo_system: string | null;
  hybrid_system: string | null;
  horsepower: number | null;
  torque: string | null;
  acceleration_0_100: string | null;
  top_speed: string | null;
  transmission: string | null;
  drivetrain: string | null;
  fuel_type: string | null;
  weight: string | null;
  production_years: string | null;
  production_count: string | null;
  estimated_value: string | null;
  description: string | null;
  is_featured: boolean;
  created_at: string;
  hero_zoom: number | null;
  hero_offset_x: number | null;
  hero_offset_y: number | null;
  cover_zoom: number | null;
  cover_offset_x: number | null;
  cover_offset_y: number | null;
}

export interface CarWithRelations extends Car {
  model?: Model;
  brand?: Brand;
}

export interface GalleryPhoto {
  id: string;
  car_id: string;
  image_url: string;
  category: string;
  shot_by: string;
  camera: string | null;
  lens: string | null;
  shot_date: string | null;
  location: string | null;
  description: string | null;
  tags: string | null;
  display_order: number;
  created_at: string;
}

export interface CarHotspot {
  id: string;
  car_id: string;
  part_name: string;
  x_position: number;
  y_position: number;
  title: string;
  description: string | null;
  specs: string | null;
  icon_name: string | null;
  icon_color: string | null;
  created_at: string;
}

export interface ExhaustSound {
  id: string;
  car_id: string;
  audio_url: string;
  title: string;
  duration: string | null;
  created_at: string;
}

export interface CarRating {
  id: string;
  car_id: string;
  design_score: number;
  sound_score: number;
  driving_experience_score: number;
  daily_usability_score: number;
  rarity_score: number;
  photography_score: number;
  updated_at: string;
}

export interface CarFact {
  id: string;
  car_id: string;
  fact: string;
  display_order: number;
  created_at: string;
}

export interface MapLocation {
  id: string;
  car_id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  created_at: string;
}

export interface GalleryCategory {
  id: string;
  car_id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface VisitorCarRating {
  id: string;
  car_id: string;
  voter_id: string;
  comfort_score: number;
  engine_score: number;
  exterior_design_score: number;
  general_score: number;
  created_at: string;
  updated_at: string;
}

export const VISITOR_RATING_CATEGORIES = [
  { key: 'comfort_score', label: 'Konfor' },
  { key: 'engine_score', label: 'Motor' },
  { key: 'exterior_design_score', label: 'Dış Tasarım' },
  { key: 'general_score', label: 'Genel Araç' },
] as const;

export const DEFAULT_GALLERY_CATEGORIES = ['Ön', 'Arka', 'Yan', 'İç Mekân', 'Motor', 'Detay'];

export const HOTSPOT_PARTS = [
  'Farlar',
  'Stop Lambaları',
  'Egzoz',
  'Jantlar',
  'Lastikler',
  'Fren Sistemi',
  'Süspansiyon',
  'Motor',
  'Turbo',
  'Şanzıman',
  'Direksiyon',
  'Koltuklar',
  'Gösterge Paneli',
  'Multimedya Sistemi',
  'Aerodinamik Parçalar',
  'Karbon Fiber Parçalar',
];

export const HOTSPOT_ICONS = [
  'Circle', 'Square', 'Triangle', 'Hexagon', 'Star', 'Zap', 'Flame', 'Wind',
  'Settings', 'Cog', 'Gauge', 'Fuel', 'Cpu', 'Lightbulb', 'Camera', 'Volume2',
  'Wrench', 'Shield', 'Trophy', 'Diamond',
] as const;

export const RATING_CATEGORIES = [
  { key: 'design_score', label: 'Tasarım' },
  { key: 'sound_score', label: 'Ses' },
  { key: 'driving_experience_score', label: 'Sürüş Deneyimi' },
  { key: 'daily_usability_score', label: 'Günlük Kullanım' },
  { key: 'rarity_score', label: 'Nadirlik' },
  { key: 'photography_score', label: 'Fotoğrafçılık Skoru' },
] as const;

export const SPEC_FIELDS = [
  { key: 'engine', label: 'Motor' },
  { key: 'engine_code', label: 'Motor Kodu' },
  { key: 'cylinders', label: 'Silindir Sayısı' },
  { key: 'displacement', label: 'Motor Hacmi' },
  { key: 'turbo_system', label: 'Turbo Sistemi' },
  { key: 'hybrid_system', label: 'Hibrit Sistemi' },
  { key: 'horsepower', label: 'Beygir Gücü (HP)' },
  { key: 'torque', label: 'Tork' },
  { key: 'acceleration_0_100', label: '0-100 km/s' },
  { key: 'top_speed', label: 'Maksimum Hız' },
  { key: 'transmission', label: 'Şanzıman' },
  { key: 'drivetrain', label: 'Çekiş Sistemi' },
  { key: 'fuel_type', label: 'Yakıt Tipi' },
  { key: 'weight', label: 'Ağırlık' },
  { key: 'production_years', label: 'Üretim Yılları' },
  { key: 'production_count', label: 'Üretim Adedi' },
  { key: 'estimated_value', label: 'Tahmini Piyasa Değeri' },
] as const;
