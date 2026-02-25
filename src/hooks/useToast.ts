import { useToastStore } from '@/stores/toastStore'

export function useToast() {
  const { add, dismiss, dismissAll } = useToastStore()

  return {
    toast: add,
    success: (message: string) => add({ type: 'success', message }),
    error: (message: string) => add({ type: 'error', message }),
    info: (message: string) => add({ type: 'info', message }),
    warning: (message: string) => add({ type: 'warning', message }),
    dismiss,
    dismissAll,
  }
}
