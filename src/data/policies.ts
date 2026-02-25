import type { Policy } from '@/types/content'

export const policies: Policy[] = [
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
    lastUpdated: '2024-01-15',
    sections: [
      {
        heading: 'Information We Collect',
        content: [
          'Personal information you provide when creating an account (name, email address, shipping address)',
          'Payment information processed securely through our payment providers',
          'Order history and product preferences',
          'Device and browser information for site optimization',
          'Cookies and similar tracking technologies to enhance your experience',
        ],
      },
      {
        heading: 'How We Use Your Information',
        content: [
          'Process and fulfill your orders',
          'Send order confirmations and shipping updates',
          'Provide customer support and respond to inquiries',
          'Send promotional emails (with your consent)',
          'Improve our website and product offerings',
          'Prevent fraud and enhance security',
        ],
      },
      {
        heading: 'Information Sharing',
        content:
          'We do not sell your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website, processing payments, and delivering products. These partners are bound by confidentiality agreements and are only permitted to use your information as necessary to provide services to us.',
      },
      {
        heading: 'Data Security',
        content:
          'We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.',
      },
      {
        heading: 'Your Rights',
        content: [
          'Access the personal information we hold about you',
          'Request correction of inaccurate information',
          'Request deletion of your personal data',
          'Opt-out of marketing communications at any time',
          'Request a copy of your data in a portable format',
        ],
      },
      {
        heading: 'Contact Us',
        content:
          'If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at privacy@mizoke.com or through our Contact page.',
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    description: 'The terms and conditions governing your use of our website and services.',
    lastUpdated: '2024-01-15',
    sections: [
      {
        heading: 'Acceptance of Terms',
        content:
          'By accessing and using Mizoke, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.',
      },
      {
        heading: 'Use of Website',
        content: [
          'You must be at least 18 years old or have parental consent to make purchases',
          'You are responsible for maintaining the confidentiality of your account',
          'You agree to provide accurate and complete information',
          'You may not use our website for any illegal or unauthorized purpose',
          'We reserve the right to refuse service to anyone for any reason',
        ],
      },
      {
        heading: 'Products and Pricing',
        content:
          'All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice. We make every effort to display accurate pricing, but errors may occur. In the event of a pricing error, we reserve the right to cancel any orders placed at the incorrect price.',
      },
      {
        heading: 'Orders and Payment',
        content: [
          'All orders are subject to acceptance and availability',
          'Payment must be received before order processing',
          'We accept major credit cards and other payment methods as displayed at checkout',
          'You are responsible for any applicable taxes and duties',
        ],
      },
      {
        heading: 'Intellectual Property',
        content:
          'All content on this website, including images, text, logos, and designs, is the property of Mizoke or our licensors. You may not reproduce, distribute, or use any content without our express written permission. Anime characters and franchises are trademarks of their respective owners.',
      },
      {
        heading: 'Limitation of Liability',
        content:
          'Mizoke shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or products. Our total liability shall not exceed the amount you paid for the products in question.',
      },
      {
        heading: 'Changes to Terms',
        content:
          'We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the website after changes constitutes acceptance of the new terms.',
      },
    ],
  },
  {
    slug: 'shipping',
    title: 'Shipping Policy',
    description: 'Information about shipping methods, delivery times, and costs.',
    lastUpdated: '2024-01-15',
    sections: [
      {
        heading: 'Processing Time',
        content:
          'Orders are typically processed within 1-3 business days. During high-volume periods or special drops, processing may take up to 5 business days. Pre-order items will be shipped according to their estimated release dates.',
      },
      {
        heading: 'Europe (Domestic)',
        content:
          'Standard Shipping (5-12 business days): €5.99 or FREE on orders over €45',
      },
      {
        heading: 'United Kingdom',
        content:
          'Standard Shipping (5-10 business days): £4.99 or FREE on orders over £40',
      },
      {
        heading: 'Canada',
        content:
          'Standard Shipping (7-14 business days): $9.99 CAD or FREE on orders over $73 CAD',
      },
      {
        heading: 'Australia',
        content:
          'Standard Shipping (10-20 business days): $11 AUD or FREE on orders over $80 AUD',
      },
      {
        heading: 'Rest of World',
        content:
          'Asia Pacific: 14-28 business days. Other regions: 14-35 business days. Shipping costs vary by country and are calculated at checkout based on your location and order weight.',
      },
      {
        heading: 'United States',
        content:
          'Shipping to the United States is currently suspended due to ongoing tariff changes. We apologize for any inconvenience and are monitoring the situation closely. Please check back for updates or sign up for our newsletter to be notified when US shipping resumes.',
      },
      {
        heading: 'Customs and Duties',
        content:
          'International orders may be subject to customs fees, import duties, and taxes. These charges are the responsibility of the recipient and are not included in our shipping prices. We are not responsible for delays caused by customs processing.',
      },
      {
        heading: 'Order Tracking',
        content:
          'Once your order ships, you will receive an email with tracking information. You can also track your order by logging into your account or visiting our Order Tracking page. Please allow 24-48 hours for tracking information to update.',
      },
      {
        heading: 'Shipping Restrictions',
        content:
          'Some products may have shipping restrictions to certain regions. If we are unable to ship to your location, you will be notified during checkout. We currently do not ship to P.O. boxes for express or overnight orders.',
      },
      {
        heading: 'Lost or Damaged Packages',
        content:
          'If your package is lost or arrives damaged, please contact us within 7 days of the expected delivery date. We will work with the carrier to resolve the issue and may offer a replacement or refund at our discretion.',
      },
    ],
  },
  {
    slug: 'returns',
    title: 'Returns & Refunds',
    description: 'Our policies for returns, exchanges, and refunds.',
    lastUpdated: '2024-01-15',
    sections: [
      {
        heading: 'Return Policy',
        content:
          'We want you to love your purchase! If you are not completely satisfied, you may return most items within 30 days of delivery for a full refund or exchange. Items must be unused, unworn, and in their original packaging with all tags attached.',
      },
      {
        heading: 'Non-Returnable Items',
        content: [
          'Limited edition or exclusive drop items (marked as "Final Sale")',
          'Opened collectibles and figures',
          'Personalized or custom items',
          'Items marked as clearance or final sale',
          'Gift cards',
        ],
      },
      {
        heading: 'How to Initiate a Return',
        content: [
          'Log into your account and go to Order History',
          'Select the order and items you wish to return',
          'Choose your reason for return and submit the request',
          'You will receive the return address and instructions via email',
          'Pack items securely and ship using a tracked service at your own cost',
        ],
      },
      {
        heading: 'Exchanges',
        content:
          'If you would like to exchange an item for a different size or color, please indicate this when initiating your return. Subject to availability, we will ship the exchange item once we receive your return. If the exchange item is unavailable, we will issue a refund.',
      },
      {
        heading: 'Refund Processing',
        content:
          'Refunds are processed within 5-7 business days after we receive your return. The refund will be credited to your original payment method. Please allow an additional 3-5 business days for the refund to appear on your statement.',
      },
      {
        heading: 'Return Shipping',
        content:
          'Return shipping costs are the responsibility of the customer. We recommend using a tracked shipping service to ensure your return reaches us safely. If the return is due to our error (wrong item, defective product), we will cover the return shipping costs.',
      },
      {
        heading: 'Damaged or Defective Items',
        content:
          'If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos of the damage. We will arrange for a free return and send a replacement or issue a full refund at your preference.',
      },
    ],
  },
  {
    slug: 'accessibility',
    title: 'Accessibility',
    description: 'Our commitment to making our website accessible to everyone.',
    lastUpdated: '2024-01-15',
    sections: [
      {
        heading: 'Our Commitment',
        content:
          'Mizoke is committed to ensuring digital accessibility for people of all abilities. We are continually improving the user experience for everyone and applying relevant accessibility standards to guarantee we provide equal access to all users.',
      },
      {
        heading: 'Accessibility Standards',
        content:
          'We strive to conform to Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. Our website is designed to be compatible with assistive technologies including screen readers, keyboard navigation, and screen magnifiers.',
      },
      {
        heading: 'Accessibility Features',
        content: [
          'Keyboard navigation support throughout the website',
          'Alternative text for images',
          'Sufficient color contrast ratios',
          'Resizable text without loss of functionality',
          'Clear and consistent navigation',
          'Form labels and error identification',
          'Skip navigation links',
          'ARIA landmarks and labels',
        ],
      },
      {
        heading: 'Ongoing Efforts',
        content:
          'We regularly test our website using assistive technologies and accessibility evaluation tools. Our team receives training on accessibility best practices, and we include accessibility considerations in our design and development processes.',
      },
      {
        heading: 'Known Limitations',
        content:
          'While we strive for full accessibility, some third-party content or features may not be fully accessible. We are working with our vendors to improve accessibility across all aspects of our website.',
      },
      {
        heading: 'Feedback',
        content:
          'We welcome your feedback on the accessibility of Mizoke. If you encounter any accessibility barriers or have suggestions for improvement, please contact us at accessibility@mizoke.com or use our Contact page. We take all feedback seriously and will work to address any issues.',
      },
      {
        heading: 'Alternative Access',
        content:
          'If you are unable to access any content or feature on our website, please contact our customer service team. We will work with you to provide the information or service you need through an alternative method.',
      },
    ],
  },
]

export function getPolicyBySlug(slug: string): Policy | undefined {
  return policies.find((policy) => policy.slug === slug)
}

export function getAllPolicySlugs(): string[] {
  return policies.map((policy) => policy.slug)
}
