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

// Backend API product structure (from MongoDB)
interface BackendProduct {
  _id: string
  sku: string
  name: string
  slug: string
  description: string
  images: string[]
  thumbnail: string
  price: number
  mrp: number
  currency: string
  stockQty: number
  isActive: boolean
  isNewArrival: boolean
  isBestSeller: boolean
  tags?: string[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8018'

/**
 * Format price in Indian Rupees format
 */
const formatPrice = (price: number): string => {
  return `Rs. ${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Transform backend product to frontend product format
 */
const transformProduct = (backendProduct: BackendProduct): Product => {
  const product: Product = {
    id: backendProduct._id,
    title: backendProduct.name,
    price: formatPrice(backendProduct.price),
    image: backendProduct.thumbnail || backendProduct.images?.[0] || '/img/placeholder.webp',
  }

  // Add old price if MRP is higher than price
  if (backendProduct.mrp && backendProduct.mrp > backendProduct.price) {
    product.oldPrice = formatPrice(backendProduct.mrp)
  }

  // Add tag based on product flags
  if (backendProduct.isNewArrival) {
    product.tag = { label: 'New Arrival', variant: 'primary' }
  } else if (backendProduct.isBestSeller) {
    product.tag = { label: 'Best Seller', variant: 'secondary' }
  }

  return product
}

/**
 * Fetch products from the backend API
 * @param filters - Optional filters for sorting, price range, and pagination
 * @returns Promise with product list response
 */
export const fetchProducts = async (filters: ProductFilters = {}): Promise<ProductListResponse> => {
  const params = new URLSearchParams()
  
  if (filters.sort) params.append('sort', filters.sort)
  if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice))
  if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice))
  if (filters.page) params.append('page', String(filters.page))
  if (filters.limit) params.append('limit', String(filters.limit))

  const queryString = params.toString()
  const url = `${API_BASE_URL}/api/v1/products${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
  }

  const responseData = await response.json()
  
  // Handle the exact API response format:
  // { success: true, message: "OK", data: { items: [...], pagination: {...} } }
  
  let backendProducts: BackendProduct[] = []
  let pagination = { page: 1, limit: 20, total: 0 }

  // Extract items array from nested structure
  if (responseData.data?.items && Array.isArray(responseData.data.items)) {
    backendProducts = responseData.data.items
    pagination = responseData.data.pagination || pagination
  }
  // Fallback: try other common structures
  else if (responseData.data && Array.isArray(responseData.data)) {
    backendProducts = responseData.data
  }
  else if (responseData.items && Array.isArray(responseData.items)) {
    backendProducts = responseData.items
    pagination = responseData.pagination || pagination
  }
  else if (Array.isArray(responseData)) {
    backendProducts = responseData
  }

  // Transform backend products to frontend format
  const products = backendProducts.map(transformProduct)

  return {
    data: products,
    meta: {
      totalItems: pagination.total || products.length,
      totalPages: Math.ceil((pagination.total || products.length) / (pagination.limit || 20)),
      currentPage: pagination.page || filters.page || 1,
    },
  }
}
