import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/services/address-service";
import type { Address } from "@/services/auth-service";

// add new address
export const useAddAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressData: Omit<Address, "id">) => addAddress(addressData),

    // update profile data after success
    onSuccess: (data) => {
      queryClient.setQueryData(["user", "profile"], data);
    },
  });
};

// update existing address
export const useUpdateAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      addressId,
      addressData,
    }: {
      addressId: string;
      addressData: Partial<Address>;
    }) => updateAddress(addressId, addressData),

    // refresh profile after update
    onSuccess: (data) => {
      queryClient.setQueryData(["user", "profile"], data);
    },
  });
};

// delete address
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => deleteAddress(addressId),

    // sync profile after delete
    onSuccess: (data) => {
      queryClient.setQueryData(["user", "profile"], data);
    },
  });
};

// mark address as default
export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => setDefaultAddress(addressId),

    // update default address in profile
    onSuccess: (data) => {
      queryClient.setQueryData(["user", "profile"], data);
    },
  });
};
