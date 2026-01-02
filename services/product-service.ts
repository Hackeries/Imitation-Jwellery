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
  inStock?: boolean
  outOfStock?: boolean
  page?: number
  limit?: number
}

const mockProducts: Product[] = [
  {
    id: "1",
    title: "Heart Gold Pendant",
    price: "Rs. 299.00",
    oldPrice: "Rs. 349.00",
    image: "/img/bracelet-img.webp",
    tag: { label: "New Arrival", variant: "primary" },
  },
  {
    id: "2",
    title: "Classic Fan Pendant",
    price: "Rs. 399.00",
    oldPrice: "Rs. 449.00",
    image: "/img/bracelets.webp",
  },
  {
    id: "3",
    title: "Ruby Square Pendant",
    price: "Rs. 499.00",
    oldPrice: "Rs. 549.00",
    image: "/img/earring.webp",
  },
  {
    id: "4",
    title: "Heart Gold Pendant",
    price: "Rs. 299.00",
    oldPrice: "Rs. 349.00",
    image: "/img/bracelet-img.webp",
  },
  {
    id: "5",
    title: "Classic Fan Pendant",
    price: "Rs. 399.00",
    oldPrice: "Rs. 449.00",
    image: "/img/bracelets.webp",
  },
  {
    id: "6",
    title: "Ruby Square Pendant",
    price: "Rs. 499.00",
    oldPrice: "Rs. 549.00",
    image: "/img/earring.webp",
  },
  {
    id: "7",
    title: "Heart Gold Pendant",
    price: "Rs. 299.00",
    oldPrice: "Rs. 349.00",
    image: "/img/bracelet-img.webp",
  },
  {
    id: "8",
    title: "Classic Fan Pendant",
    price: "Rs. 399.00",
    oldPrice: "Rs. 449.00",
    image: "/img/bracelets.webp",
  },
  {
    id: "9",
    title: "Ruby Square Pendant",
    price: "Rs. 499.00",
    oldPrice: "Rs. 549.00",
    image: "/img/earring.webp",
  },
]

export const fetchProducts = async (filters: ProductFilters): Promise<ProductListResponse> => {
  // Mocking delay for demonstration
  await new Promise((resolve) => setTimeout(resolve, 500))

  let products = [...mockProducts]

  // Apply price filter
  if (filters.minPrice !== undefined) {
    products = products.filter((p) => {
      const priceNum = parseFloat(p.price.replace(/[^0-9.]/g, ""))
      return priceNum >= filters.minPrice!
    })
  }
  if (filters.maxPrice !== undefined) {
    products = products.filter((p) => {
      const priceNum = parseFloat(p.price.replace(/[^0-9.]/g, ""))
      return priceNum <= filters.maxPrice!
    })
  }

  // Apply sort
  if (filters.sort === "price-asc") {
    products.sort((a, b) => {
      const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ""))
      const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ""))
      return priceA - priceB
    })
  } else if (filters.sort === "price-desc") {
    products.sort((a, b) => {
      const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ""))
      const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ""))
      return priceB - priceA
    })
  } else if (filters.sort === "az") {
    products.sort((a, b) => a.title.localeCompare(b.title))
  } else if (filters.sort === "za") {
    products.sort((a, b) => b.title.localeCompare(a.title))
  }

  // Returning filtered and sorted data
  return {
    data: products,
    meta: {
      totalItems: products.length,
      totalPages: Math.ceil(products.length / (filters.limit || 50)),
      currentPage: filters.page || 1,
    },
  }
}
