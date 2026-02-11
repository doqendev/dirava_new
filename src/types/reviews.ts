export interface ReviewRating {
  averageRating: number // 0-5
  reviewCount: number
  ratingBreakdown?: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export interface Review {
  id: string
  author: string
  rating: number // 1-5
  title?: string
  content: string
  createdAt: string
  verified?: boolean
}
