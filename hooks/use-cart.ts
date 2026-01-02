import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchCart, addToCart, removeFromCart, updateCartQuantity, type Cart } from "@/services/cart-service"

export const useCart = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
    staleTime: 1000 * 60, // 1 minute
  })
}

export const useAddToCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      name,
      price,
      image,
      quantity,
    }: { productId: string; name: string; price: number; image: string; quantity?: number }) =>
      addToCart(productId, name, price, image, quantity),
    onMutate: async (newItem) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ["cart"] })

      // Get previous data
      const previousCart = queryClient.getQueryData<Cart>(["cart"])

      // Optimistically update cache
      if (previousCart) {
        // Create immutable copies
        const updatedItems = [...previousCart.items]
        const existingItemIndex = updatedItems.findIndex((item) => item.productId === newItem.productId)
        
        if (existingItemIndex !== -1) {
          // Update existing item immutably
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + (newItem.quantity || 1),
          }
        } else {
          // Add new item
          updatedItems.push({
            id: newItem.productId,
            productId: newItem.productId,
            name: newItem.name,
            price: newItem.price,
            quantity: newItem.quantity || 1,
            image: newItem.image,
          })
        }
        
        const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        queryClient.setQueryData(["cart"], { items: updatedItems, total: newTotal })
      }

      return { previousCart }
    },
    onError: (_err, _newItem, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart)
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data)
      queryClient.invalidateQueries({ queryKey: ["cart-count"] })
    },
  })
}

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (cartItemId: string) => removeFromCart(cartItemId),
    onMutate: async (cartItemId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] })
      const previousCart = queryClient.getQueryData<Cart>(["cart"])

      if (previousCart) {
        // Create immutable copies
        const updatedItems = previousCart.items.filter((item) => item.id !== cartItemId)
        const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        queryClient.setQueryData(["cart"], { items: updatedItems, total: newTotal })
      }

      return { previousCart }
    },
    onError: (_err, _cartItemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart)
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data)
      queryClient.invalidateQueries({ queryKey: ["cart-count"] })
    },
  })
}

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) =>
      updateCartQuantity(cartItemId, quantity),
    onMutate: async ({ cartItemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] })
      const previousCart = queryClient.getQueryData<Cart>(["cart"])

      if (previousCart) {
        // Create immutable copies
        const updatedItems = previousCart.items.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        )
        const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        queryClient.setQueryData(["cart"], { items: updatedItems, total: newTotal })
      }

      return { previousCart }
    },
    onError: (_err, _data, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart)
      }
    },
    onSuccess: (data) => {
      // Set the returned cart data to ensure sync
      queryClient.setQueryData(["cart"], data)
    },
  })
}

export const useCartCount = () => {
  const { data: cart } = useCart()
  return {
    data: cart?.items.length || 0,
  }
}
