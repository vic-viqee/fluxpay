import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
  border?: boolean
  variant?: 'default' | 'elevated' | 'outline' | 'highlighted'
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  border = true,
  variant = 'default',
}) => {
  const paddingStyle =
    padding === 'sm' ? 'var(--spacing-4)' : padding === 'md' ? 'var(--spacing-6)' : 'var(--spacing-8)'

  const variantClasses = {
    default: 'card',
    elevated: 'card card-elevated',
    outline: 'card card-outline',
    highlighted: 'card card-highlighted',
  }

  return (
    <div
      className={`${variantClasses[variant]} ${hover ? 'transition-all' : ''} ${className}`}
      style={{
        padding: paddingStyle,
      }}
    >
      {children}
    </div>
  )
}
