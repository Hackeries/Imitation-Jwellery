import type { Address } from "./auth-service"

export const addAddress = async (addressData: Omit<Address, "id">): Promise<Address> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    id: `addr-${Date.now()}`,
    ...addressData,
  }
}

export const updateAddress = async (addressId: string, addressData: Partial<Address>): Promise<Address> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    id: addressId,
    name: addressData.name || "",
    address: addressData.address || "",
    cityZip: addressData.cityZip || "",
    isDefault: addressData.isDefault || false,
  }
}

export const deleteAddress = async (addressId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
}

export const setDefaultAddress = async (addressId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
}
