export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Cart {
  items: CartItem[]
  total: number
}

// In-memory store - starts EMPTY
let cartStore: CartItem[] = []

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

export const fetchCart = async (): Promise<Cart> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return {
    items: [...cartStore],
    total: calculateTotal(cartStore),
  }
}

export const addToCart = async (
  productId: string,
  name: string,
  price: number,
  image: string,
  quantity = 1,
): Promise<Cart> => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const existingIndex = cartStore.findIndex(item => item.productId === productId)
  
  if (existingIndex >= 0) {
    cartStore[existingIndex].quantity += quantity
  } else {
    cartStore.push({
      id: `cart-${Date.now()}`,
      productId,
      name,
      price,
      quantity,
      image,
    })
  }

  return {
    items: [...cartStore],
    total: calculateTotal(cartStore),
  }
}

export const removeFromCart = async (cartItemId: string): Promise<Cart> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  
  cartStore = cartStore.filter(item => item.id !== cartItemId)
  
  return {
    items: [...cartStore],
    total: calculateTotal(cartStore),
  }
}

export const updateCartQuantity = async (cartItemId: string, quantity: number): Promise<Cart> => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    cartStore = cartStore.filter(item => item.id !== cartItemId)
  } else {
    const item = cartStore.find(item => item.id === cartItemId)
    if (item) {
      item.quantity = quantity
    }
  }

  return {
    items: [...cartStore],
    total: calculateTotal(cartStore),
  }
}
