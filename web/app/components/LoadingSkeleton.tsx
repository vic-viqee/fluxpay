/**
 * LoadingSkeleton Component
 * Animated placeholder for loading states
 */

import React from 'react'

interface LoadingSkeletonProps {
  count?: number
  width?: string | number
  height?: string | number
  circle?: boolean
  className?: string
  style?: React.CSSProperties
}

export function LoadingSkeleton({
  count = 1,
  width = '100%',
  height = '1rem',
  circle = false,
  className = '',
  style = {},
}: LoadingSkeletonProps) {
  return (
    <div className={className} style={style}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            borderRadius: circle ? '9999px' : 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface-2)',
            marginBottom: idx < count - 1 ? 'var(--spacing-2)' : 0,
            animation: 'shimmer 2s infinite',
            backgroundImage: `linear-gradient(
              90deg,
              var(--color-surface-2) 0%,
              var(--color-surface-3) 50%,
              var(--color-surface-2) 100%
            )`,
            backgroundSize: '200% 100%',
            backgroundPosition: '0% 0%',
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
      `}</style>
    </div>
  )
}
