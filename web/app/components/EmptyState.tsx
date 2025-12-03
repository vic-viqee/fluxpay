/**
 * EmptyState Component
 * Rendered when no data is available
 */

import React from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-12)',
        textAlign: 'center',
        minHeight: '300px',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-4)' }}>{icon}</div>
      <h3
        style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--spacing-2)',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            maxWidth: '300px',
            marginBottom: 'var(--spacing-6)',
          }}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
