export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface StockInfo {
  status: StockStatus
  quantity: number | null
  label: string
}

const LOW_STOCK_THRESHOLD = 5

export function getStockStatus(
  availableForSale: boolean,
  quantityAvailable?: number | null
): StockInfo {
  if (!availableForSale) {
    return {
      status: 'out_of_stock',
      quantity: 0,
      label: 'Out of Stock',
    }
  }

  // If quantity is null/undefined, assume in stock (Shopify sometimes doesn't track inventory)
  if (quantityAvailable === null || quantityAvailable === undefined) {
    return {
      status: 'in_stock',
      quantity: null,
      label: 'In Stock',
    }
  }

  if (quantityAvailable <= 0) {
    return {
      status: 'out_of_stock',
      quantity: 0,
      label: 'Out of Stock',
    }
  }

  if (quantityAvailable <= LOW_STOCK_THRESHOLD) {
    return {
      status: 'low_stock',
      quantity: quantityAvailable,
      label: `Only ${quantityAvailable} left!`,
    }
  }

  return {
    status: 'in_stock',
    quantity: quantityAvailable,
    label: 'In Stock',
  }
}

export function getStockStatusColor(status: StockStatus): string {
  switch (status) {
    case 'in_stock':
      return '#22c55e' // green-500
    case 'low_stock':
      return '#f97316' // orange-500
    case 'out_of_stock':
      return '#ef4444' // red-500
    default:
      return '#6b7280' // gray-500
  }
}
