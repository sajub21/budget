import { create } from 'zustand'
import { UserWithRelations } from '@/types'

interface AuthStore {
  user: UserWithRelations | null
  isLoading: boolean
  
  setUser: (user: UserWithRelations | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => set({ user: null, isLoading: false }),
}))
