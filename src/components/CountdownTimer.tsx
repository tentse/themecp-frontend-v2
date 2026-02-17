import { useEffect, useRef, useState } from 'react'
import { formatCountdown } from '@/utils/time'

interface CountdownTimerProps {
  targetTimestamp: number // Unix ms when timer expires
  onExpire?: () => void
  className?: string
}

export default function CountdownTimer({
  targetTimestamp,
  onExpire,
  className = '',
}: CountdownTimerProps) {
  const [display, setDisplay] = useState(() => formatCountdown(targetTimestamp))
  const expiredRef = useRef(false)

  useEffect(() => {
    const update = () => {
      const formatted = formatCountdown(targetTimestamp)
      setDisplay(formatted)
      if (formatted === "Time's up!" && onExpire && !expiredRef.current) {
        expiredRef.current = true
        onExpire()
      }
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetTimestamp, onExpire])

  return <span className={className}>{display}</span>
}
