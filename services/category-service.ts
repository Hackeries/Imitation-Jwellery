import { getCommonHeaders } from "@/lib/api-utils";

export interface Category {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  type: "category" | "collection" | "priceStrip";
  position?: number;
}

interface BackendCategory {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  type: "category" | "collection" | "priceStrip";
  position?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

let categoryCache: Map<string, Category> | null = null;
let allCategoriesCache: Category[] | null = null;
let collectionsCache: Category[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 10;

const transformCategory = (backend: BackendCategory): Category => ({
  id: backend._id,
  title: backend.title,
  slug: backend.slug,
  description: backend.description,
  thumbnail: backend.thumbnail,
  isActive: backend.isActive,
  type: backend.type,
  position: backend.position,
});

export const fetchCategories = async (): Promise<Category[]> => {
  const now = Date.now();
  if (allCategoriesCache && now - cacheTimestamp < CACHE_TTL) {
    return allCategoriesCache;
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/product-categories?isActive=true&type=category`,
      { headers: getCommonHeaders() }
    );

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    const items: BackendCategory[] = json?.data?.items ?? [];

    allCategoriesCache = items.map(transformCategory);
    cacheTimestamp = now;

    return allCategoriesCache;
  } catch {
    return [];
  }
};

export const fetchCollections = async (): Promise<Category[]> => {
  const now = Date.now();
  if (collectionsCache && now - cacheTimestamp < CACHE_TTL) {
    return collectionsCache;
  }

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/product-collections?isActive=true`,
      { headers: getCommonHeaders() }
    );

    if (!res.ok) {
      const fallbackRes = await fetch(
        `${API_BASE_URL}/api/v1/product-categories?isActive=true&type=collection`,
        { headers: getCommonHeaders() }
      );

      if (!fallbackRes.ok) {
        return [];
      }

      const fallbackJson = await fallbackRes.json();
      const fallbackItems: BackendCategory[] = fallbackJson?.data?.items ?? [];
      collectionsCache = fallbackItems.map(transformCategory);
      return collectionsCache;
    }

    const json = await res.json();
    const items: BackendCategory[] = json?.data?.items ?? [];

    if (items.length === 0) {
      const fallbackRes = await fetch(
        `${API_BASE_URL}/api/v1/product-categories?isActive=true&type=collection`,
        { headers: getCommonHeaders() }
      );

      if (fallbackRes.ok) {
        const fallbackJson = await fallbackRes.json();
        const fallbackItems: BackendCategory[] =
          fallbackJson?.data?.items ?? [];
        collectionsCache = fallbackItems.map(transformCategory);
        return collectionsCache;
      }
    }

    collectionsCache = items.map(transformCategory);
    return collectionsCache;
  } catch {
    return [];
  }
};

export const fetchPriceStrips = async (): Promise<Category[]> => {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/product-categories?isActive=true&type=priceStrip`,
    { headers: getCommonHeaders() }
  );

  if (!res.ok) {
    return [];
  }

  const json = await res.json();
  const items: BackendCategory[] = json?.data?.items ?? [];

  return items.map(transformCategory);
};

const ensureCache = async (): Promise<Map<string, Category>> => {
  const now = Date.now();

  if (categoryCache && now - cacheTimestamp < CACHE_TTL) {
    return categoryCache;
  }

  const categories = await fetchCategories();
  const map = new Map<string, Category>();

  for (const cat of categories) {
    map.set(cat.slug.toLowerCase(), cat);
  }

  categoryCache = map;
  cacheTimestamp = now;
  return map;
};

export const getCategoryBySlug = async (
  slug: string
): Promise<Category | null> => {
  const cache = await ensureCache();
  return cache.get(slug.toLowerCase()) ?? null;
};

export const getCategoryIdBySlug = async (
  slug: string
): Promise<string | null> => {
  const cat = await getCategoryBySlug(slug);
  return cat?.id ?? null;
};

export const getCategoryById = async (
  categoryId: string
): Promise<Category | null> => {
  const url = `${API_BASE_URL}/api/v1/product-categories/${categoryId}`;

  try {
    const res = await fetch(url, { headers: getCommonHeaders() });

    if (!res.ok) return null;

    const json = await res.json();
    const category: BackendCategory | undefined =
      json?.data?.category ?? json?.data ?? json?.category;

    if (!category) return null;

    return transformCategory(category);
  } catch {
    return null;
  }
};

export const getAllCategoriesAndCollections = async (): Promise<{
  categories: Category[];
  collections: Category[];
}> => {
  try {
    const [categories, collections] = await Promise.all([
      fetchCategories(),
      fetchCollections(),
    ]);

    return { categories, collections };
  } catch {
    return { categories: [], collections: [] };
  }
};

export const clearCategoryCache = (): void => {
  categoryCache = null;
  allCategoriesCache = null;
  collectionsCache = null;
  cacheTimestamp = 0;
};
