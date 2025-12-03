import React from 'react'

interface BadgeProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'info'
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  children,
  className = '',
  size = 'md',
}) => {
  const variantClasses = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    tertiary: 'badge-tertiary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
  }

  return (
    <span className={`badge ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  )
}
