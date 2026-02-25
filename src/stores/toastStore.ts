import { create } from 'zustand'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

interface ToastState {
  toasts: Toast[]
  add: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

const MAX_TOASTS = 3

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  add: (toast) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newToast = { ...toast, id }

    set((state) => ({
      toasts: [...state.toasts.slice(-(MAX_TOASTS - 1)), newToast],
    }))

    // Auto-dismiss
    const duration = toast.duration ?? 4000
    if (duration > 0) {
      setTimeout(() => {
        get().dismiss(id)
      }, duration)
    }
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  dismissAll: () => set({ toasts: [] }),
}))
