import { useId } from 'react'
import { cn } from '@/lib/utils'

interface DotPatternProps {
  className?: string
  gap?: number
  size?: number
}

export function DotPattern({ className, gap = 16, size = 1 }: DotPatternProps) {
  const patternId = useId()
  const id = `dot-pattern-${patternId.replace(/:/g, '')}`

  return (
    <svg
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full fill-neutral-400/20', className)}
    >
      <defs>
        <pattern
          id={id}
          width={gap}
          height={gap}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          x={0}
          y={0}
        >
          <circle cx={gap / 2} cy={gap / 2} r={size} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  )
}
