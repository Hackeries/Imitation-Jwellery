export interface Product {
  id: string
  title: string
  price: string
  oldPrice?: string
  image: string
  tag?: {
    label: string
    variant: "primary" | "secondary"
  }
}

export interface ProductListResponse {
  data: Product[]
  meta: {
    totalItems: number
    totalPages: number
    currentPage: number
  }
}

export interface ProductFilters {
  sort?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
}

/**
 * Fetch products from the backend API
 * @param filters - Optional filters for sorting, price range, and pagination
 * @returns Promise with product list response
 */
export const fetchProducts = async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
  // Build query parameters
  const params = new URLSearchParams()
  
  if (filters.sort) {
    params.append('sort', filters.sort)
  }
  if (filters.minPrice !== undefined) {
    params.append('minPrice', String(filters.minPrice))
  }
  if (filters.maxPrice !== undefined) {
    params.append('maxPrice', String(filters.maxPrice))
  }
  if (filters.page) {
    params.append('page', String(filters.page))
  }
  if (filters.limit) {
    params.append('limit', String(filters.limit))
  }

  const queryString = params.toString()
  const url = `/api/v1/products${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  
  // Return data in expected format
  // Handle both direct array response and wrapped response
  if (Array.isArray(data)) {
    return {
      data: data,
      meta: {
        totalItems: data.length,
        totalPages: 1,
        currentPage: 1,
      },
    }
  }
  
  // If API returns { data, meta } structure
  return {
    data: data.data || data.products || [],
    meta: data.meta || {
      totalItems: (data.data || data.products || []).length,
      totalPages: data.totalPages || 1,
      currentPage: data.currentPage || filters.page || 1,
    },
  }
}
