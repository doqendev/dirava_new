export interface SizeRow {
  size: string
  chest?: string
  waist?: string
  hips?: string
  length?: string
  shoulder?: string
  sleeve?: string
  inseam?: string
  [key: string]: string | undefined
}

export interface SizeGuide {
  productType: string
  unit: 'cm' | 'inches'
  columns: string[]
  rows: SizeRow[]
  notes?: string[]
}

export type SizeGuideType = 'tshirt' | 'hoodie' | 'pants' | 'jacket' | 'shorts' | 'dress' | 'default'
