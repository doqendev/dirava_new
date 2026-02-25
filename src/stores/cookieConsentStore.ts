import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CookiePreferences {
  necessary: true
  analytics: boolean
  marketing: boolean
}

interface CookieConsentState {
  consentGiven: boolean
  preferences: CookiePreferences
  consentDate: string | null

  // Actions
  acceptAll: () => void
  rejectAll: () => void
  savePreferences: (preferences: Partial<Omit<CookiePreferences, 'necessary'>>) => void
  resetConsent: () => void
}

export const useCookieConsentStore = create<CookieConsentState>()(
  persist(
    (set) => ({
      consentGiven: false,
      preferences: {
        necessary: true,
        analytics: false,
        marketing: false,
      },
      consentDate: null,

      acceptAll: () =>
        set({
          consentGiven: true,
          preferences: {
            necessary: true,
            analytics: true,
            marketing: true,
          },
          consentDate: new Date().toISOString(),
        }),

      rejectAll: () =>
        set({
          consentGiven: true,
          preferences: {
            necessary: true,
            analytics: false,
            marketing: false,
          },
          consentDate: new Date().toISOString(),
        }),

      savePreferences: (preferences) =>
        set((state) => ({
          consentGiven: true,
          preferences: {
            necessary: true,
            analytics: preferences.analytics ?? state.preferences.analytics,
            marketing: preferences.marketing ?? state.preferences.marketing,
          },
          consentDate: new Date().toISOString(),
        })),

      resetConsent: () =>
        set({
          consentGiven: false,
          preferences: {
            necessary: true,
            analytics: false,
            marketing: false,
          },
          consentDate: null,
        }),
    }),
    {
      name: 'mizoke-cookie-consent',
    }
  )
)
