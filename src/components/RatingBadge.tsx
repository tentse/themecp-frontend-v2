import { getRatingColor } from '@/utils/rating'

interface RatingBadgeProps {
  rating: number | null
  label?: string
  className?: string
}

export default function RatingBadge({ rating, label, className = '' }: RatingBadgeProps) {
  const color = getRatingColor(rating)
  const text = label ?? (rating != null ? String(rating) : 'Unrated')

  return (
    <span
      className={`inline-block rounded px-2 py-0.5 font-medium ${className}`}
      style={{ backgroundColor: color, color: rating != null && rating >= 2400 ? '#fff' : '#000' }}
    >
      {text}
    </span>
  )
}
