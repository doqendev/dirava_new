// Policy page types
export interface PolicySection {
  heading: string
  content: string | string[]
}

export interface Policy {
  slug: string
  title: string
  description: string
  lastUpdated: string
  sections: PolicySection[]
}

// FAQ types
export interface FAQItem {
  question: string
  answer: string
}

// Contact form types
export interface ContactFormData {
  name: string
  email: string
  subject: string
  orderNumber: string
  message: string
}

export type ContactStatus = 'idle' | 'loading' | 'success' | 'error'
