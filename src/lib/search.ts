import type { CarWithRelations, Brand } from './types';

export interface BrandResult {
  brand: Brand;
  score: number;
}

export interface SearchResult {
  brands: BrandResult[];
  cars: CarWithRelations[];
}

function normalize(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let j = 1; j <= b.length; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const tmp = dp[i];
      dp[i] = Math.min(dp[i] + 1, dp[i - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[a.length];
}

function fuzzyIncludes(haystack: string, needle: string): boolean {
  if (haystack.includes(needle)) return true;
  const words = haystack.split(/\s+/);
  for (const w of words) {
    if (w.length < 3) continue;
    const dist = levenshtein(w, needle);
    const tolerance = needle.length <= 4 ? 1 : needle.length <= 7 ? 2 : 3;
    if (dist <= tolerance) return true;
  }
  return false;
}

export function searchBrands(brands: Brand[], query: string): BrandResult[] {
  const q = normalize(query);
  if (!q) return [];

  const results: BrandResult[] = [];

  for (const brand of brands) {
    const bn = normalize(brand.name);
    let score = 0;

    if (bn === q) {
      score = 1000;
    } else if (bn.split(/\s+/).some((w) => w === q)) {
      score = 800;
    } else if (bn.includes(q)) {
      score = 600;
    } else if (bn.replace(/[-\s]/g, '') === q.replace(/[-\s]/g, '')) {
      score = 550;
    } else if (bn.replace(/[-\s]/g, '').includes(q.replace(/[-\s]/g, ''))) {
      score = 400;
    } else if (fuzzyIncludes(bn, q)) {
      score = 200;
    }

    if (score > 0) {
      results.push({ brand, score });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

export function searchCars(cars: CarWithRelations[], query: string): CarWithRelations[] {
  const q = normalize(query);
  if (!q) return cars;

  const scored: { car: CarWithRelations; score: number }[] = [];

  for (const car of cars) {
    const brandName = normalize(car.brand?.name || '');
    const modelName = normalize(car.model?.name || '');
    const carName = normalize(car.name);
    const fullText = `${brandName} ${modelName} ${carName}`;
    let score = 0;
    let matched = false;

    if (brandName === q) {
      score += 800;
      matched = true;
    } else if (brandName.split(/\s+/).some((w) => w === q)) {
      score += 650;
      matched = true;
    } else if (brandName.includes(q)) {
      score += 500;
      matched = true;
    } else if (brandName.replace(/[-\s]/g, '').includes(q.replace(/[-\s]/g, ''))) {
      score += 350;
      matched = true;
    }

    if (modelName === q) {
      score += 700;
      matched = true;
    } else if (modelName.split(/\s+/).some((w) => w === q)) {
      score += 550;
      matched = true;
    } else if (modelName.includes(q)) {
      score += 450;
      matched = true;
    }

    if (carName === q) {
      score += 900;
      matched = true;
    } else if (carName.split(/\s+/).some((w) => w === q)) {
      score += 750;
      matched = true;
    } else if (carName.includes(q)) {
      score += 600;
      matched = true;
    }

    if (!matched && fuzzyIncludes(fullText, q)) {
      score += 100;
      matched = true;
    }

    if (matched) {
      scored.push({ car, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.car);
}

export function searchAll(
  brands: Brand[],
  cars: CarWithRelations[],
  query: string
): SearchResult {
  const q = query.trim();
  if (!q) {
    return { brands: [], cars };
  }

  return {
    brands: searchBrands(brands, q),
    cars: searchCars(cars, q),
  };
}
