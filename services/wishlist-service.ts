export interface WishlistItem {
  id: string
  productId: string
  title: string
  price: string
  image: string
}

export interface Wishlist {
  items: WishlistItem[]
}

// In-memory store - starts EMPTY
let wishlistStore: WishlistItem[] = []

export const fetchWishlist = async (): Promise<Wishlist> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return { items: [...wishlistStore] }
}

export const addToWishlist = async (
  productId: string,
  title: string,
  price: string,
  image: string,
): Promise<Wishlist> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  
  // Check if already exists
  const exists = wishlistStore.some(item => item.productId === productId)
  if (!exists) {
    wishlistStore.push({
      id: `wish-${Date.now()}`,
      productId,
      title,
      price,
      image,
    })
  }
  
  return { items: [...wishlistStore] }
}

export const removeFromWishlist = async (wishlistItemId: string): Promise<Wishlist> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  
  // Filter by both id and productId for backwards compatibility with existing code
  wishlistStore = wishlistStore.filter(item => item.id !== wishlistItemId && item.productId !== wishlistItemId)
  
  return { items: [...wishlistStore] }
}
