import { useMutation, useQueryClient } from "@tanstack/react-query"
import { addAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/services/address-service"
import type { Address } from "@/services/auth-service"

export const useAddAddress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (addressData: Omit<Address, "id">) => addAddress(addressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
    },
  })
}

export const useUpdateAddress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ addressId, addressData }: { addressId: string; addressData: Partial<Address> }) =>
      updateAddress(addressId, addressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
    },
  })
}

export const useDeleteAddress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (addressId: string) => deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
    },
  })
}

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (addressId: string) => setDefaultAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
    },
  })
}
