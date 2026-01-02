import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchWishlist, addToWishlist, removeFromWishlist, type Wishlist } from "@/services/wishlist-service"

export const useWishlist = () => {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    select: (data) => data?.items || [], // Extract items array from wishlist response
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useAddToWishlist = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      title,
      price,
      image,
    }: { productId: string; title: string; price: string; image: string }) =>
      addToWishlist(productId, title, price, image),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] })
      const previousWishlist = queryClient.getQueryData<Wishlist>(["wishlist"])

      if (previousWishlist) {
        // Work with the raw Wishlist object structure { items: [...] }
        const updatedItems = [
          ...previousWishlist.items,
          {
            id: newItem.productId,
            productId: newItem.productId,
            title: newItem.title,
            price: newItem.price,
            image: newItem.image,
          },
        ]
        queryClient.setQueryData(["wishlist"], { items: updatedItems })
      }

      return { previousWishlist }
    },
    onError: (_err, _newItem, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist)
      }
    },
    onSuccess: (data) => {
      // Set the returned data from API to ensure sync
      queryClient.setQueryData(["wishlist"], data)
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] })
    },
  })
}

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (wishlistItemId: string) => removeFromWishlist(wishlistItemId),
    onMutate: async (wishlistItemId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] })
      const previousWishlist = queryClient.getQueryData<Wishlist>(["wishlist"])

      if (previousWishlist) {
        // Work with the raw Wishlist object structure { items: [...] }
        const updatedItems = previousWishlist.items.filter((item) => item.id !== wishlistItemId)
        queryClient.setQueryData(["wishlist"], { items: updatedItems })
      }

      return { previousWishlist }
    },
    onError: (_err, _wishlistItemId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist)
      }
    },
    onSuccess: (data) => {
      // Set the returned data from API to ensure sync
      queryClient.setQueryData(["wishlist"], data)
      queryClient.invalidateQueries({ queryKey: ["wishlist-count"] })
    },
  })
}

export const useWishlistCount = () => {
  const { data: wishlistItems = [] } = useWishlist()
  return {
    data: wishlistItems.length,
  }
}

export const useIsWishlisted = (productId: number) => {
  const { data: wishlistItems = [] } = useWishlist()
  return {
    data: wishlistItems.some((item) => item.productId === String(productId)),
  }
}

export const isWishlisted = (productId: string, wishlist?: Wishlist) => {
  return wishlist?.items.some((item) => item.productId === productId) || false
}
