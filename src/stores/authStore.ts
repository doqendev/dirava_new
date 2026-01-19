import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { shopifyClient } from '@/lib/shopify/client'
import {
  CUSTOMER_CREATE,
  CUSTOMER_ACCESS_TOKEN_CREATE,
  CUSTOMER_ACCESS_TOKEN_DELETE,
  CUSTOMER_RECOVER,
  CUSTOMER_RESET_BY_URL,
  CUSTOMER_UPDATE,
} from '@/lib/shopify/customerMutations'
import { GET_CUSTOMER } from '@/lib/shopify/customerQueries'
import { UPDATE_CART_BUYER } from '@/lib/shopify/mutations'
import type {
  ShopifyCustomer,
  ShopifyCustomerAccessToken,
  CustomerUserError,
} from '@/types/customer'

// Mock customer for development/testing
const MOCK_CUSTOMER: ShopifyCustomer = {
  id: 'gid://shopify/Customer/dev-test-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890',
  acceptsMarketing: true,
  defaultAddress: {
    id: 'gid://shopify/MailingAddress/dev-addr-1',
    firstName: 'Test',
    lastName: 'User',
    company: 'Neo-Stage Collective',
    address1: '123 Test Street',
    address2: 'Suite 100',
    city: 'Los Angeles',
    province: 'California',
    provinceCode: 'CA',
    country: 'United States',
    countryCodeV2: 'US',
    zip: '90001',
    phone: '+1234567890',
    formatted: ['123 Test Street', 'Suite 100', 'Los Angeles CA 90001', 'United States'],
  },
  addresses: {
    edges: [
      {
        node: {
          id: 'gid://shopify/MailingAddress/dev-addr-1',
          firstName: 'Test',
          lastName: 'User',
          company: 'Neo-Stage Collective',
          address1: '123 Test Street',
          address2: 'Suite 100',
          city: 'Los Angeles',
          province: 'California',
          provinceCode: 'CA',
          country: 'United States',
          countryCodeV2: 'US',
          zip: '90001',
          phone: '+1234567890',
          formatted: ['123 Test Street', 'Suite 100', 'Los Angeles CA 90001', 'United States'],
        },
      },
      {
        node: {
          id: 'gid://shopify/MailingAddress/dev-addr-2',
          firstName: 'Test',
          lastName: 'User',
          company: null,
          address1: '456 Backup Ave',
          address2: null,
          city: 'San Francisco',
          province: 'California',
          provinceCode: 'CA',
          country: 'United States',
          countryCodeV2: 'US',
          zip: '94102',
          phone: null,
          formatted: ['456 Backup Ave', 'San Francisco CA 94102', 'United States'],
        },
      },
    ],
  },
}

interface AuthState {
  customer: ShopifyCustomer | null
  accessToken: string | null
  expiresAt: string | null
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; errors?: CustomerUserError[] }>
  devLogin: () => void // Development login with mock data
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ success: boolean; errors?: CustomerUserError[]; requiresActivation?: boolean }>
  logout: () => Promise<void>
  recoverPassword: (email: string) => Promise<{ success: boolean; errors?: CustomerUserError[] }>
  resetPassword: (
    resetUrl: string,
    password: string
  ) => Promise<{ success: boolean; errors?: CustomerUserError[] }>
  updateCustomer: (
    updates: Partial<{ firstName: string; lastName: string; email: string; phone: string; acceptsMarketing: boolean }>
  ) => Promise<{ success: boolean; errors?: CustomerUserError[] }>
  fetchCustomer: () => Promise<void>
  isAuthenticated: () => boolean
  setError: (error: string | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      customer: null,
      accessToken: null,
      expiresAt: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })

        try {
          // Create access token
          const response = await shopifyClient.request<{
            customerAccessTokenCreate: {
              customerAccessToken: ShopifyCustomerAccessToken | null
              customerUserErrors: CustomerUserError[]
            }
          }>(CUSTOMER_ACCESS_TOKEN_CREATE, {
            input: { email, password },
          })

          const { customerAccessToken, customerUserErrors } =
            response.customerAccessTokenCreate

          if (customerUserErrors.length > 0) {
            set({ isLoading: false, error: customerUserErrors[0]?.message ?? 'An error occurred' })
            return { success: false, errors: customerUserErrors }
          }

          if (!customerAccessToken) {
            set({ isLoading: false, error: 'Failed to create access token' })
            return { success: false }
          }

          // Store token
          set({
            accessToken: customerAccessToken.accessToken,
            expiresAt: customerAccessToken.expiresAt,
          })

          // Fetch customer data
          await get().fetchCustomer()

          // Associate cart with customer
          await associateCartWithCustomer(customerAccessToken.accessToken)

          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          console.error('Login failed:', error)
          set({ isLoading: false, error: 'Login failed. Please try again.' })
          return { success: false }
        }
      },

      // Development login - bypasses Shopify auth with mock data
      devLogin: () => {
        const futureDate = new Date()
        futureDate.setFullYear(futureDate.getFullYear() + 1)

        set({
          customer: MOCK_CUSTOMER,
          accessToken: 'dev-mock-token-12345',
          expiresAt: futureDate.toISOString(),
          isLoading: false,
          error: null,
        })
      },

      register: async (email, password, firstName, lastName) => {
        set({ isLoading: true, error: null })

        try {
          // Create customer
          const response = await shopifyClient.request<{
            customerCreate: {
              customer: { id: string; email: string } | null
              customerUserErrors: CustomerUserError[]
            }
          }>(CUSTOMER_CREATE, {
            input: { email, password, firstName, lastName },
          })

          const { customer, customerUserErrors } = response.customerCreate

          if (customerUserErrors.length > 0) {
            set({ isLoading: false, error: customerUserErrors[0]?.message ?? 'An error occurred' })
            return { success: false, errors: customerUserErrors }
          }

          if (!customer) {
            set({ isLoading: false, error: 'Failed to create account' })
            return { success: false }
          }

          // Try auto-login after registration
          const loginResult = await get().login(email, password)

          // If login fails, the store likely requires email activation
          // Return success with a flag indicating activation may be needed
          if (!loginResult.success) {
            set({ isLoading: false, error: null })
            return {
              success: true,
              requiresActivation: true,
            }
          }

          return loginResult
        } catch (error) {
          console.error('Registration failed:', error)
          set({ isLoading: false, error: 'Registration failed. Please try again.' })
          return { success: false }
        }
      },

      logout: async () => {
        const { accessToken } = get()

        if (accessToken) {
          try {
            await shopifyClient.request(CUSTOMER_ACCESS_TOKEN_DELETE, {
              customerAccessToken: accessToken,
            })
          } catch (error) {
            console.error('Failed to delete access token:', error)
          }
        }

        get().clearAuth()
      },

      recoverPassword: async (email) => {
        set({ isLoading: true, error: null })

        try {
          const response = await shopifyClient.request<{
            customerRecover: {
              customerUserErrors: CustomerUserError[]
            }
          }>(CUSTOMER_RECOVER, { email })

          const { customerUserErrors } = response.customerRecover

          set({ isLoading: false })

          if (customerUserErrors.length > 0) {
            set({ error: customerUserErrors[0]?.message ?? 'An error occurred' })
            return { success: false, errors: customerUserErrors }
          }

          return { success: true }
        } catch (error) {
          console.error('Password recovery failed:', error)
          set({ isLoading: false, error: 'Failed to send recovery email.' })
          return { success: false }
        }
      },

      resetPassword: async (resetUrl, password) => {
        set({ isLoading: true, error: null })

        try {
          const response = await shopifyClient.request<{
            customerResetByUrl: {
              customer: { id: string } | null
              customerAccessToken: ShopifyCustomerAccessToken | null
              customerUserErrors: CustomerUserError[]
            }
          }>(CUSTOMER_RESET_BY_URL, { resetUrl, password })

          const { customerAccessToken, customerUserErrors } =
            response.customerResetByUrl

          if (customerUserErrors.length > 0) {
            set({ isLoading: false, error: customerUserErrors[0]?.message ?? 'An error occurred' })
            return { success: false, errors: customerUserErrors }
          }

          if (customerAccessToken) {
            // Auto-login with new token
            set({
              accessToken: customerAccessToken.accessToken,
              expiresAt: customerAccessToken.expiresAt,
            })
            await get().fetchCustomer()
          }

          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          console.error('Password reset failed:', error)
          set({ isLoading: false, error: 'Failed to reset password.' })
          return { success: false }
        }
      },

      updateCustomer: async (updates) => {
        const { accessToken } = get()
        if (!accessToken) {
          return { success: false }
        }

        set({ isLoading: true, error: null })

        try {
          const response = await shopifyClient.request<{
            customerUpdate: {
              customer: ShopifyCustomer | null
              customerUserErrors: CustomerUserError[]
            }
          }>(CUSTOMER_UPDATE, {
            customerAccessToken: accessToken,
            customer: updates,
          })

          const { customer, customerUserErrors } = response.customerUpdate

          if (customerUserErrors.length > 0) {
            set({ isLoading: false, error: customerUserErrors[0]?.message ?? 'An error occurred' })
            return { success: false, errors: customerUserErrors }
          }

          if (customer) {
            // Refetch full customer data to avoid shallow merge issues with nested objects
            await get().fetchCustomer()
          }

          set({ isLoading: false })
          return { success: true }
        } catch (error) {
          console.error('Customer update failed:', error)
          set({ isLoading: false, error: 'Failed to update profile.' })
          return { success: false }
        }
      },

      fetchCustomer: async () => {
        const { accessToken } = get()
        if (!accessToken) return

        try {
          const response = await shopifyClient.request<{
            customer: ShopifyCustomer | null
          }>(GET_CUSTOMER, { customerAccessToken: accessToken })

          if (response.customer) {
            set({ customer: response.customer })
          } else {
            // Token might be invalid/expired
            get().clearAuth()
          }
        } catch (error) {
          console.error('Failed to fetch customer:', error)
          get().clearAuth()
        }
      },

      isAuthenticated: () => {
        const { accessToken, expiresAt } = get()
        if (!accessToken || !expiresAt) return false

        // Check if token is expired
        const expiry = new Date(expiresAt)
        return expiry > new Date()
      },

      setError: (error) => set({ error }),

      clearAuth: () => {
        set({
          customer: null,
          accessToken: null,
          expiresAt: null,
          isLoading: false,
          error: null,
        })
      },
    }),
    {
      name: 'neo-stage-auth',
      partialize: (state) => ({
        customer: state.customer,
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
      }),
    }
  )
)

// Helper function to associate cart with customer
async function associateCartWithCustomer(customerAccessToken: string) {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return

    // Import cartStore dynamically to avoid circular dependencies
    const { useCartStore } = await import('./cartStore')
    const cartId = useCartStore.getState().cartId
    if (!cartId) return

    await shopifyClient.request(UPDATE_CART_BUYER, {
      cartId,
      buyerIdentity: { customerAccessToken },
    })
  } catch (error) {
    console.error('Failed to associate cart with customer:', error)
  }
}
