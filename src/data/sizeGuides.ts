import type { SizeGuide, SizeGuideType } from '@/types/sizeGuide'

export const sizeGuides: Record<SizeGuideType, SizeGuide> = {
  tshirt: {
    productType: 'T-Shirt',
    unit: 'cm',
    columns: ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'],
    rows: [
      { size: 'XS', chest: '86-91', length: '66', shoulder: '40', sleeve: '18' },
      { size: 'S', chest: '91-96', length: '69', shoulder: '42', sleeve: '19' },
      { size: 'M', chest: '96-101', length: '72', shoulder: '44', sleeve: '20' },
      { size: 'L', chest: '101-106', length: '74', shoulder: '46', sleeve: '21' },
      { size: 'XL', chest: '106-111', length: '76', shoulder: '48', sleeve: '22' },
      { size: '2XL', chest: '111-116', length: '78', shoulder: '50', sleeve: '23' },
    ],
    notes: [
      'Measurements are in centimeters',
      'For a relaxed fit, size up',
      'Chest measurements include 2-3cm tolerance',
    ],
  },
  hoodie: {
    productType: 'Hoodie',
    unit: 'cm',
    columns: ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'],
    rows: [
      { size: 'XS', chest: '96-101', length: '62', shoulder: '46', sleeve: '60' },
      { size: 'S', chest: '101-106', length: '65', shoulder: '48', sleeve: '62' },
      { size: 'M', chest: '106-111', length: '68', shoulder: '50', sleeve: '64' },
      { size: 'L', chest: '111-116', length: '71', shoulder: '52', sleeve: '66' },
      { size: 'XL', chest: '116-121', length: '74', shoulder: '54', sleeve: '68' },
      { size: '2XL', chest: '121-126', length: '77', shoulder: '56', sleeve: '70' },
    ],
    notes: [
      'Measurements are in centimeters',
      'Hoodies have an oversized fit',
      'Length is measured from shoulder to hem',
    ],
  },
  pants: {
    productType: 'Pants',
    unit: 'cm',
    columns: ['Size', 'Waist', 'Hips', 'Inseam', 'Length'],
    rows: [
      { size: 'XS', waist: '66-71', hips: '86-91', inseam: '76', length: '102' },
      { size: 'S', waist: '71-76', hips: '91-96', inseam: '78', length: '104' },
      { size: 'M', waist: '76-81', hips: '96-101', inseam: '80', length: '106' },
      { size: 'L', waist: '81-86', hips: '101-106', inseam: '81', length: '108' },
      { size: 'XL', waist: '86-91', hips: '106-111', inseam: '82', length: '110' },
      { size: '2XL', waist: '91-96', hips: '111-116', inseam: '83', length: '112' },
    ],
    notes: [
      'Measurements are in centimeters',
      'Waist is measured at natural waistline',
      'Inseam is from crotch to ankle',
    ],
  },
  jacket: {
    productType: 'Jacket',
    unit: 'cm',
    columns: ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'],
    rows: [
      { size: 'XS', chest: '98-103', length: '64', shoulder: '44', sleeve: '62' },
      { size: 'S', chest: '103-108', length: '67', shoulder: '46', sleeve: '64' },
      { size: 'M', chest: '108-113', length: '70', shoulder: '48', sleeve: '66' },
      { size: 'L', chest: '113-118', length: '73', shoulder: '50', sleeve: '68' },
      { size: 'XL', chest: '118-123', length: '76', shoulder: '52', sleeve: '70' },
      { size: '2XL', chest: '123-128', length: '79', shoulder: '54', sleeve: '72' },
    ],
    notes: [
      'Measurements are in centimeters',
      'Allow room for layering',
      'Jacket length is measured from collar to hem',
    ],
  },
  shorts: {
    productType: 'Shorts',
    unit: 'cm',
    columns: ['Size', 'Waist', 'Hips', 'Inseam', 'Length'],
    rows: [
      { size: 'XS', waist: '66-71', hips: '86-91', inseam: '15', length: '38' },
      { size: 'S', waist: '71-76', hips: '91-96', inseam: '16', length: '40' },
      { size: 'M', waist: '76-81', hips: '96-101', inseam: '17', length: '42' },
      { size: 'L', waist: '81-86', hips: '101-106', inseam: '18', length: '44' },
      { size: 'XL', waist: '86-91', hips: '106-111', inseam: '19', length: '46' },
      { size: '2XL', waist: '91-96', hips: '111-116', inseam: '20', length: '48' },
    ],
    notes: [
      'Measurements are in centimeters',
      'Length measured from waist to hem',
    ],
  },
  dress: {
    productType: 'Dress',
    unit: 'cm',
    columns: ['Size', 'Chest', 'Waist', 'Hips', 'Length'],
    rows: [
      { size: 'XS', chest: '80-84', waist: '62-66', hips: '86-90', length: '85' },
      { size: 'S', chest: '84-88', waist: '66-70', hips: '90-94', length: '87' },
      { size: 'M', chest: '88-92', waist: '70-74', hips: '94-98', length: '89' },
      { size: 'L', chest: '92-96', waist: '74-78', hips: '98-102', length: '91' },
      { size: 'XL', chest: '96-100', waist: '78-82', hips: '102-106', length: '93' },
      { size: '2XL', chest: '100-104', waist: '82-86', hips: '106-110', length: '95' },
    ],
    notes: [
      'Measurements are in centimeters',
      'Length measured from shoulder to hem',
    ],
  },
  default: {
    productType: 'Apparel',
    unit: 'cm',
    columns: ['Size', 'Chest', 'Waist', 'Length'],
    rows: [
      { size: 'XS', chest: '86-91', waist: '66-71', length: '66' },
      { size: 'S', chest: '91-96', waist: '71-76', length: '69' },
      { size: 'M', chest: '96-101', waist: '76-81', length: '72' },
      { size: 'L', chest: '101-106', waist: '81-86', length: '74' },
      { size: 'XL', chest: '106-111', waist: '86-91', length: '76' },
      { size: '2XL', chest: '111-116', waist: '91-96', length: '78' },
    ],
    notes: [
      'Measurements are in centimeters',
      'This is a general size guide',
      'Individual products may vary slightly',
    ],
  },
}

export function getSizeGuide(productType: string): SizeGuide {
  const type = productType.toLowerCase()

  if (type.includes('t-shirt') || type.includes('tshirt') || type.includes('tee')) {
    return sizeGuides.tshirt
  }
  if (type.includes('hoodie') || type.includes('sweatshirt')) {
    return sizeGuides.hoodie
  }
  if (type.includes('pant') || type.includes('trouser') || type.includes('jean')) {
    return sizeGuides.pants
  }
  if (type.includes('jacket') || type.includes('coat') || type.includes('bomber')) {
    return sizeGuides.jacket
  }
  if (type.includes('short')) {
    return sizeGuides.shorts
  }
  if (type.includes('dress') || type.includes('skirt')) {
    return sizeGuides.dress
  }

  return sizeGuides.default
}
