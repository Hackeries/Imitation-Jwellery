import { addAddress as addAddressToAuth, deleteAddress as deleteAddressFromAuth, setDefaultAddress as setDefaultAddressInAuth, fetchUserProfile, updateUserProfile, type Address, type User } from "./auth-service"

export const addAddress = async (addressData: Omit<Address, "id">): Promise<User> => {
  return addAddressToAuth(addressData)
}

export const updateAddress = async (addressId: string, addressData: Partial<Address>): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  
  const currentUser = await fetchUserProfile()
  
  const updatedAddresses = currentUser.addresses.map((addr) =>
    addr.id === addressId ? { ...addr, ...addressData } : addr
  )
  
  return updateUserProfile({ addresses: updatedAddresses })
}

export const deleteAddress = async (addressId: string): Promise<User> => {
  return deleteAddressFromAuth(addressId)
}

export const setDefaultAddress = async (addressId: string): Promise<User> => {
  return setDefaultAddressInAuth(addressId)
}
