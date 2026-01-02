export interface LoginCredentials {
  mobile: string
  otp: string
}

export interface Address {
  id: string
  name: string
  address: string
  cityZip: string
  isDefault: boolean
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  addresses: Address[]
}

// In-memory store for user - starts with default
let userStore: User = {
  id: "user-1",
  name: "Olivia Grace",
  email: "olivia@gmail.com",
  phone: "+91 1234567890",
  addresses: [],
}

export const loginUser = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  // Mock delay for API simulation
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Mock successful login
  return {
    user: { ...userStore },
    token: "mock-jwt-token",
  }
}

export const fetchUserProfile = async (): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { ...userStore }
}

export const updateUserProfile = async (updates: Partial<User>): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  
  // Actually update the store
  userStore = {
    ...userStore,
    ...updates,
  }
  
  return { ...userStore }
}

export const addAddress = async (address: Omit<Address, 'id'>): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  
  userStore.addresses.push({
    ...address,
    id: `addr-${Date.now()}`,
  })
  
  return { ...userStore }
}

export const deleteAddress = async (addressId: string): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  
  userStore.addresses = userStore.addresses.filter(a => a.id !== addressId)
  
  return { ...userStore }
}

export const setDefaultAddress = async (addressId: string): Promise<User> => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  
  userStore.addresses = userStore.addresses.map(a => ({
    ...a,
    isDefault: a.id === addressId,
  }))
  
  return { ...userStore }
}
