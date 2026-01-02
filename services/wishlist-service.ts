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

export const fetchWishlist = async (): Promise<Wishlist> => {
  await new Promise((resolve) => setTimeout(resolve, 400))

  return {
    items: [
      { id: "1", productId: "1", title: "Heart Gold Pendant", price: "Rs. 299.00", image: "/img/bracelet-img.webp" },
      { id: "2", productId: "2", title: "Classic Fan Pendant", price: "Rs. 399.00", image: "/img/bracelets.webp" },
    ],
  }
}

export const addToWishlist = async (
  productId: string,
  title: string,
  price: string,
  image: string,
): Promise<Wishlist> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Simulate adding to existing wishlist
  const mockWishlist = {
    items: [
      { id: "1", productId: "1", title: "Heart Gold Pendant", price: "Rs. 299.00", image: "/img/bracelet-img.webp" },
      { id: "2", productId: "2", title: "Classic Fan Pendant", price: "Rs. 399.00", image: "/img/bracelets.webp" },
    ],
  }

  // Add new item if not already present
  const itemExists = mockWishlist.items.some((item) => item.productId === productId)
  if (!itemExists) {
    mockWishlist.items.push({ id: productId, productId, title, price, image })
  }

  return { items: mockWishlist.items }
}

export const removeFromWishlist = async (wishlistItemId: string): Promise<Wishlist> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Simulate removing the item from wishlist
  const mockWishlist = {
    items: [
      { id: "1", productId: "1", title: "Heart Gold Pendant", price: "Rs. 299.00", image: "/img/bracelet-img.webp" },
      { id: "2", productId: "2", title: "Classic Fan Pendant", price: "Rs. 399.00", image: "/img/bracelets.webp" },
    ],
  }
  
  // Filter out the removed item
  const updatedItems = mockWishlist.items.filter((item) => item.id !== wishlistItemId)
  
  return { items: updatedItems }
}
