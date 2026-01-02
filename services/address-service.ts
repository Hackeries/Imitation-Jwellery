import type { Address, User } from "./auth-service"

// Mock user for simulation
const mockUser: User = {
  id: "user-1",
  name: "Olivia Grace",
  email: "olivia@gmail.com",
  phone: "+91 1234567890",
  addresses: [
    {
      id: "addr-1",
      name: "Olivia Grace",
      address: "123 Main Street, Apartment 4B",
      cityZip: "Mumbai, 400001",
      isDefault: true,
    },
    {
      id: "addr-2",
      name: "Olivia Grace",
      address: "456 Park Avenue",
      cityZip: "Delhi, 110001",
      isDefault: false,
    },
  ],
}

export const addAddress = async (addressData: Omit<Address, "id">): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const newAddress = {
    id: `addr-${Date.now()}`,
    ...addressData,
  }

  return {
    ...mockUser,
    addresses: [...mockUser.addresses, newAddress],
  }
}

export const updateAddress = async (addressId: string, addressData: Partial<Address>): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    ...mockUser,
    addresses: mockUser.addresses.map((addr) =>
      addr.id === addressId ? { ...addr, ...addressData } : addr
    ),
  }
}

export const deleteAddress = async (addressId: string): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return {
    ...mockUser,
    addresses: mockUser.addresses.filter((addr) => addr.id !== addressId),
  }
}

export const setDefaultAddress = async (addressId: string): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return {
    ...mockUser,
    addresses: mockUser.addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    })),
  }
}
