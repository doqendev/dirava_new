'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useToastStore, type Toast } from '@/stores/toastStore'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles = {
  success: 'border-neon-green/50 text-neon-green',
  error: 'border-neon-pink/50 text-neon-pink',
  info: 'border-neon-cyan/50 text-neon-cyan',
  warning: 'border-neon-orange/50 text-neon-orange',
}

function ToastItem({ toast }: { toast: Toast }) {
  const { dismiss } = useToastStore()
  const Icon = icons[toast.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg',
        'bg-bg-primary/95 backdrop-blur-md border',
        'shadow-lg min-w-[280px] max-w-[380px]',
        styles[toast.type]
      )}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm text-white">{toast.message}</p>
      <button
        onClick={() => dismiss(toast.id)}
        className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const { toasts } = useToastStore()

  return (
    <div
      className={cn(
        'fixed z-[100] flex flex-col gap-2',
        'bottom-24 right-4 lg:bottom-6 lg:right-6'
      )}
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
