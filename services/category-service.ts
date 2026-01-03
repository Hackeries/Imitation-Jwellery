// services/category-service. ts

export interface Category {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  type: "category" | "collection" | "priceStrip";
}

interface BackendCategory {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  type: "category" | "collection" | "priceStrip";
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8018";

// Cache for slug -> categoryId mapping
let categoryCache: Map<string, Category> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

const transformCategory = (backend: BackendCategory): Category => ({
  id: backend._id,
  title: backend.title,
  slug: backend.slug,
  description: backend.description,
  thumbnail: backend.thumbnail,
  isActive: backend.isActive,
  type: backend.type,
});

export const fetchCategories = async (): Promise<Category[]> => {
  const url = `${API_BASE_URL}/api/v1/product-categories? isActive=true&type=category`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const responseData = await response.json();

  let backendCategories: BackendCategory[] = [];

  if (responseData.data?.items && Array.isArray(responseData.data.items)) {
    backendCategories = responseData.data.items;
  } else if (responseData.data && Array.isArray(responseData.data)) {
    backendCategories = responseData.data;
  } else if (responseData.items && Array.isArray(responseData.items)) {
    backendCategories = responseData.items;
  } else if (Array.isArray(responseData)) {
    backendCategories = responseData;
  }

  return backendCategories.map(transformCategory);
};

const ensureCache = async (): Promise<Map<string, Category>> => {
  const now = Date.now();

  if (categoryCache && now - cacheTimestamp < CACHE_TTL) {
    return categoryCache;
  }

  const categories = await fetchCategories();
  categoryCache = new Map();

  for (const cat of categories) {
    categoryCache.set(cat.slug.toLowerCase(), cat);
  }

  cacheTimestamp = now;
  return categoryCache;
};

export const getCategoryBySlug = async (
  slug: string
): Promise<Category | null> => {
  const cache = await ensureCache();
  return cache.get(slug.toLowerCase()) || null;
};

export const getCategoryIdBySlug = async (
  slug: string
): Promise<string | null> => {
  const category = await getCategoryBySlug(slug);
  return category?.id || null;
};

export const clearCategoryCache = (): void => {
  categoryCache = null;
  cacheTimestamp = 0;
};

// Display name mapping for category titles
export const getCategoryDisplayName = (slug: string): string => {
  const displayNames: Record<string, string> = {
    pendant: "Pendant",
    necklace: "Necklace",
    earring: "Earring",
    bracelet: "Bracelet",
    "jewelry-set": "Jewelry Set",
    ring: "Ring",
  };

  return (
    displayNames[slug.toLowerCase()] ||
    slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ")
  );
};
