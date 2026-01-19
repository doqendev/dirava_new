'use client'

import { useState, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// Context for accordion state
interface AccordionContextType {
  expandedItem: string | null
  toggleItem: (value: string) => void
}

const AccordionContext = createContext<AccordionContextType | null>(null)

function useAccordion() {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion')
  }
  return context
}

// Main Accordion component
interface AccordionProps {
  children: React.ReactNode
  className?: string
  defaultValue?: string
}

export function Accordion({ children, className, defaultValue }: AccordionProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(defaultValue || null)

  const toggleItem = (value: string) => {
    setExpandedItem((prev) => (prev === value ? null : value))
  }

  return (
    <AccordionContext.Provider value={{ expandedItem, toggleItem }}>
      <div className={cn('space-y-3', className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

// Accordion Item
interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  const { expandedItem } = useAccordion()
  const isExpanded = expandedItem === value

  return (
    <div
      className={cn(
        'border border-border-subtle rounded-lg overflow-hidden',
        'bg-bg-card/50 backdrop-blur-sm',
        isExpanded && 'border-neon-cyan/30',
        className
      )}
      data-state={isExpanded ? 'open' : 'closed'}
    >
      {children}
    </div>
  )
}

// Accordion Trigger (button)
interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  value: string
}

export function AccordionTrigger({ children, className, value }: AccordionTriggerProps) {
  const { expandedItem, toggleItem } = useAccordion()
  const isExpanded = expandedItem === value
  const contentId = `accordion-content-${value}`

  return (
    <button
      type="button"
      onClick={() => toggleItem(value)}
      className={cn(
        'w-full flex items-center justify-between gap-4',
        'px-4 py-4 text-left',
        'text-white font-medium',
        'hover:bg-white/5 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-inset',
        className
      )}
      aria-expanded={isExpanded}
      aria-controls={contentId}
    >
      <span className="flex-1">{children}</span>
      <motion.span
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0"
      >
        <ChevronDown className="w-5 h-5 text-neon-cyan" />
      </motion.span>
    </button>
  )
}

// Accordion Content
interface AccordionContentProps {
  children: React.ReactNode
  className?: string
  value: string
}

export function AccordionContent({ children, className, value }: AccordionContentProps) {
  const { expandedItem } = useAccordion()
  const isExpanded = expandedItem === value
  const contentId = `accordion-content-${value}`

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          id={contentId}
          role="region"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className={cn('px-4 pb-4 text-white/70', className)}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
