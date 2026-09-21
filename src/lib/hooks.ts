import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Brand, Model, Car, CarWithRelations, GalleryPhoto, CarHotspot, ExhaustSound, CarRating, CarFact, MapLocation, Notification, GalleryCategory, VisitorCarRating } from '@/lib/types';

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('brands').select('*').order('display_order').order('name');
    if (!error && data) setBrands(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { brands, loading, refetch: fetch };
}

export function useModels(brandId: string | null) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandId) { setModels([]); setLoading(false); return; }
    setLoading(true);
    supabase.from('models').select('*').eq('brand_id', brandId).order('name')
      .then(({ data, error }) => {
        if (!error && data) setModels(data);
        setLoading(false);
      });
  }, [brandId]);

  return { models, loading };
}

export function useAllCars() {
  const [cars, setCars] = useState<CarWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select('*, model:models(*, brand:brands(*))')
      .order('created_at', { ascending: false });
    if (!error && data) setCars(data as CarWithRelations[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { cars, loading, refetch: fetch };
}

export function useCarsByModel(modelId: string | null) {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!modelId) { setCars([]); setLoading(false); return; }
    setLoading(true);
    supabase.from('cars').select('*').eq('model_id', modelId).order('name')
      .then(({ data, error }) => {
        if (!error && data) setCars(data);
        setLoading(false);
      });
  }, [modelId]);

  return { cars, loading };
}

export function useCarsByBrand(brandId: string | null) {
  const [cars, setCars] = useState<CarWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandId) { setCars([]); setLoading(false); return; }
    setLoading(true);
    supabase
      .from('cars')
      .select('*, model:models!inner(*, brand:brands!inner(*))')
      .eq('model.brand_id', brandId)
      .order('name')
      .then(({ data, error }) => {
        if (!error && data) setCars(data as CarWithRelations[]);
        setLoading(false);
      });
  }, [brandId]);

  return { cars, loading };
}

export function useCar(carId: string | null) {
  const [car, setCar] = useState<CarWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!carId) { setCar(null); setLoading(false); return; }
    setLoading(true);
    supabase
      .from('cars')
      .select('*, model:models(*, brand:brands(*))')
      .eq('id', carId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) setCar(data as CarWithRelations);
        else setCar(null);
        setLoading(false);
      });
  }, [carId]);

  return { car, loading };
}

export function useGallery(carId: string | null) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!carId) { setPhotos([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from('gallery_photos').select('*').eq('car_id', carId).order('display_order').order('created_at');
    if (!error && data) setPhotos(data);
    setLoading(false);
  }, [carId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { photos, loading, refetch: fetch };
}

export function useHotspots(carId: string | null) {
  const [hotspots, setHotspots] = useState<CarHotspot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!carId) { setHotspots([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from('car_hotspots').select('*').eq('car_id', carId);
    if (!error && data) setHotspots(data);
    setLoading(false);
  }, [carId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { hotspots, loading, refetch: fetch };
}

export function useExhaustSounds(carId: string | null) {
  const [sounds, setSounds] = useState<ExhaustSound[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!carId) { setSounds([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from('exhaust_sounds').select('*').eq('car_id', carId);
    if (!error && data) setSounds(data);
    setLoading(false);
  }, [carId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { sounds, loading, refetch: fetch };
}

export function useRating(carId: string | null) {
  const [rating, setRating] = useState<CarRating | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!carId) { setRating(null); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from('car_ratings').select('*').eq('car_id', carId).maybeSingle();
    if (!error && data) setRating(data);
    else setRating(null);
    setLoading(false);
  }, [carId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { rating, loading, refetch: fetch };
}

export function useFacts(carId: string | null) {
  const [facts, setFacts] = useState<CarFact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!carId) { setFacts([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from('car_facts').select('*').eq('car_id', carId).order('display_order');
    if (!error && data) setFacts(data);
    setLoading(false);
  }, [carId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { facts, loading, refetch: fetch };
}

export function useMapLocations(carId: string | null) {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!carId) { setLocations([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from('map_locations').select('*').eq('car_id', carId);
    if (!error && data) setLocations(data);
    setLoading(false);
  }, [carId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { locations, loading, refetch: fetch };
}

export function useAllMapLocations() {
  const [locations, setLocations] = useState<(MapLocation & { car?: Car })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('map_locations')
      .select('*, car:cars(*)')
      .order('created_at', { ascending: false });
    if (!error && data) setLocations(data as (MapLocation & { car?: Car })[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { locations, loading, refetch: fetch };
}

export function useGalleryCategories(carId: string | null) {
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!carId) { setCategories([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from('gallery_categories').select('*').eq('car_id', carId).order('display_order');
    if (!error && data) setCategories(data);
    setLoading(false);
  }, [carId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { categories, loading, refetch: fetch };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
    if (!error && data) setNotifications(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const markAsRead = useCallback((id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setRemovingId(null);
    }, 300);
  }, []);

  return { notifications, loading, refetch: fetch, markAsRead, removingId };
}

const VOTER_ID_KEY = 'awrx_voter_id';

function getOrCreateVoterId(): string {
  try {
    let id = localStorage.getItem(VOTER_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VOTER_ID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function useVisitorRatings(carId: string | null) {
  const [ratings, setRatings] = useState<VisitorCarRating[]>([]);
  const [myRating, setMyRating] = useState<VisitorCarRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voterId, setVoterId] = useState<string>('');

  useEffect(() => {
    setVoterId(getOrCreateVoterId());
  }, []);

  const fetch = useCallback(async () => {
    if (!carId) { setRatings([]); setMyRating(null); setLoading(false); return; }
    setLoading(true);
    const vid = getOrCreateVoterId();
    const { data, error } = await supabase
      .from('visitor_car_ratings')
      .select('*')
      .eq('car_id', carId);
    if (!error && data) {
      setRatings(data);
      setMyRating(data.find((r) => r.voter_id === vid) || null);
    }
    setLoading(false);
  }, [carId]);

  useEffect(() => { fetch(); }, [fetch]);

  const submitRating = useCallback(async (scores: {
    comfort_score: number;
    engine_score: number;
    exterior_design_score: number;
    general_score: number;
  }) => {
    if (!carId || !voterId) return;
    setSubmitting(true);
    const { data: existing } = await supabase
      .from('visitor_car_ratings')
      .select('id')
      .eq('car_id', carId)
      .eq('voter_id', voterId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('visitor_car_ratings')
        .update({ ...scores, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('visitor_car_ratings')
        .insert({ car_id: carId, voter_id: voterId, ...scores });
    }
    setSubmitting(false);
    fetch();
  }, [carId, voterId, fetch]);

  const aggregate = ratings.length > 0
    ? {
        comfort: ratings.reduce((s, r) => s + r.comfort_score, 0) / ratings.length,
        engine: ratings.reduce((s, r) => s + r.engine_score, 0) / ratings.length,
        exterior: ratings.reduce((s, r) => s + r.exterior_design_score, 0) / ratings.length,
        general: ratings.reduce((s, r) => s + r.general_score, 0) / ratings.length,
        overall: ratings.reduce((s, r) => (s + r.comfort_score + r.engine_score + r.exterior_design_score + r.general_score) / 4, 0) / ratings.length,
        count: ratings.length,
      }
    : null;

  return { ratings, myRating, aggregate, loading, submitting, submitRating, refetch: fetch };
}
