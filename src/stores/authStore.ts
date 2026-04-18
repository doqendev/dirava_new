import { create } from 'zustand'
import type {
  CustomerUserError,
  ShopifyCustomer,
  LoginFormData,
  RegisterFormData,
} from '@/types/customer'

interface AuthState {
  customer: ShopifyCustomer | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; errors?: CustomerUserError[] }>
  devLogin: () => Promise<void>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ success: boolean; errors?: CustomerUserError[]; requiresActivation?: boolean }>
  logout: () => Promise<void>
  recoverPassword: (
    email: string
  ) => Promise<{ success: boolean; errors?: CustomerUserError[] }>
  resetPassword: (
    resetUrl: string,
    password: string
  ) => Promise<{ success: boolean; errors?: CustomerUserError[] }>
  updateCustomer: (
    updates: Partial<{
      firstName: string
      lastName: string
      email: string
      phone: string
      acceptsMarketing: boolean
    }>
  ) => Promise<{ success: boolean; errors?: CustomerUserError[] }>
  initializeSession: () => Promise<void>
  fetchCustomer: () => Promise<void>
  isAuthenticated: () => boolean
  setError: (error: string | null) => void
  clearAuth: () => void
}

type AuthRouteErrorResponse = {
  error?: string
  errors?: CustomerUserError[]
}

type AuthSuccessResponse = {
  success?: boolean
  customer?: ShopifyCustomer
  authenticated?: boolean
  requiresActivation?: boolean
}

async function readJsonResponse<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T
  } catch {
    return null
  }
}

async function postJson<T>(
  url: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return {
    ok: response.ok,
    status: response.status,
    data: await readJsonResponse<T>(response),
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  customer: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initializeSession: async () => {
    if (get().isInitialized || get().isLoading) {
      return
    }

    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/auth/session', {
        cache: 'no-store',
      })
      const data = await readJsonResponse<AuthSuccessResponse>(response)

      set({
        customer: data?.authenticated ? data.customer ?? null : null,
        isLoading: false,
        isInitialized: true,
        error: null,
      })
    } catch (error) {
      console.error('Failed to initialize customer session:', error)
      set({
        customer: null,
        isLoading: false,
        isInitialized: true,
        error: null,
      })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })

    try {
      const { ok, data } = await postJson<AuthSuccessResponse & AuthRouteErrorResponse>(
        '/api/auth/login',
        { email, password } satisfies LoginFormData
      )

      if (!ok || !data?.customer) {
        const errorMessage = data?.error ?? 'Login failed. Please try again.'
        set({
          customer: null,
          isLoading: false,
          isInitialized: true,
          error: errorMessage,
        })
        return { success: false, errors: data?.errors }
      }

      set({
        customer: data.customer,
        isLoading: false,
        isInitialized: true,
        error: null,
      })
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      set({
        customer: null,
        isLoading: false,
        isInitialized: true,
        error: 'Login failed. Please try again.',
      })
      return { success: false }
    }
  },

  devLogin: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/auth/dev-login', {
        method: 'POST',
      })
      const data = await readJsonResponse<AuthSuccessResponse & AuthRouteErrorResponse>(response)

      if (!response.ok || !data?.customer) {
        set({
          customer: null,
          isLoading: false,
          isInitialized: true,
          error: data?.error ?? 'Development login failed.',
        })
        return
      }

      set({
        customer: data.customer,
        isLoading: false,
        isInitialized: true,
        error: null,
      })
    } catch (error) {
      console.error('Development login failed:', error)
      set({
        customer: null,
        isLoading: false,
        isInitialized: true,
        error: 'Development login failed.',
      })
    }
  },

  register: async (email, password, firstName, lastName) => {
    set({ isLoading: true, error: null })

    try {
      const { ok, data } = await postJson<AuthSuccessResponse & AuthRouteErrorResponse>(
        '/api/auth/register',
        { email, password, firstName, lastName } satisfies RegisterFormData
      )

      if (!ok || !data) {
        const errorMessage = data?.error ?? 'Registration failed. Please try again.'
        set({
          customer: null,
          isLoading: false,
          isInitialized: true,
          error: errorMessage,
        })
        return { success: false, errors: data?.errors }
      }

      if (data.requiresActivation) {
        set({
          customer: null,
          isLoading: false,
          isInitialized: true,
          error: null,
        })
        return {
          success: true,
          requiresActivation: true,
        }
      }

      if (!data.customer) {
        set({
          customer: null,
          isLoading: false,
          isInitialized: true,
          error: 'Registration failed. Please try again.',
        })
        return { success: false }
      }

      set({
        customer: data.customer,
        isLoading: false,
        isInitialized: true,
        error: null,
      })
      return { success: true }
    } catch (error) {
      console.error('Registration failed:', error)
      set({
        customer: null,
        isLoading: false,
        isInitialized: true,
        error: 'Registration failed. Please try again.',
      })
      return { success: false }
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Failed to logout cleanly:', error)
    } finally {
      get().clearAuth()
    }
  },

  recoverPassword: async (email) => {
    set({ isLoading: true, error: null })

    try {
      const { ok, data } = await postJson<AuthRouteErrorResponse>('/api/auth/recover', {
        email,
      })

      set({ isLoading: false, isInitialized: true })

      if (!ok) {
        const errorMessage = data?.error ?? 'Failed to send the password reset email.'
        set({ error: errorMessage })
        return { success: false, errors: data?.errors }
      }

      return { success: true }
    } catch (error) {
      console.error('Password recovery failed:', error)
      set({
        isLoading: false,
        isInitialized: true,
        error: 'Failed to send the password reset email.',
      })
      return { success: false }
    }
  },

  resetPassword: async (resetUrl, password) => {
    set({ isLoading: true, error: null })

    try {
      const { ok, data } = await postJson<AuthSuccessResponse & AuthRouteErrorResponse>(
        '/api/auth/reset-password',
        { resetUrl, password }
      )

      if (!ok || !data?.customer) {
        const errorMessage = data?.error ?? 'Failed to reset the password.'
        set({
          customer: null,
          isLoading: false,
          isInitialized: true,
          error: errorMessage,
        })
        return { success: false, errors: data?.errors }
      }

      set({
        customer: data.customer,
        isLoading: false,
        isInitialized: true,
        error: null,
      })
      return { success: true }
    } catch (error) {
      console.error('Password reset failed:', error)
      set({
        customer: null,
        isLoading: false,
        isInitialized: true,
        error: 'Failed to reset the password.',
      })
      return { success: false }
    }
  },

  updateCustomer: async (updates) => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/account/customer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await readJsonResponse<AuthSuccessResponse & AuthRouteErrorResponse>(response)

      if (!response.ok || !data?.customer) {
        const errorMessage = data?.error ?? 'Failed to update the profile.'
        set({
          isLoading: false,
          isInitialized: true,
          error: errorMessage,
        })
        return { success: false, errors: data?.errors }
      }

      set({
        customer: data.customer,
        isLoading: false,
        isInitialized: true,
        error: null,
      })
      return { success: true }
    } catch (error) {
      console.error('Customer update failed:', error)
      set({
        isLoading: false,
        isInitialized: true,
        error: 'Failed to update the profile.',
      })
      return { success: false }
    }
  },

  fetchCustomer: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch('/api/account/customer', {
        cache: 'no-store',
      })
      const data = await readJsonResponse<AuthSuccessResponse & AuthRouteErrorResponse>(response)

      if (!response.ok || !data?.customer) {
        set({
          customer: null,
          isLoading: false,
          isInitialized: true,
          error: null,
        })
        return
      }

      set({
        customer: data.customer,
        isLoading: false,
        isInitialized: true,
        error: null,
      })
    } catch (error) {
      console.error('Failed to fetch customer:', error)
      set({
        customer: null,
        isLoading: false,
        isInitialized: true,
        error: null,
      })
    }
  },

  isAuthenticated: () => get().customer !== null,

  setError: (error) => set({ error }),

  clearAuth: () => {
    set({
      customer: null,
      isLoading: false,
      isInitialized: true,
      error: null,
    })
  },
}))
