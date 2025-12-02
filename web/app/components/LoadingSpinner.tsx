import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
  color?: 'primary' | 'secondary' | 'neutral'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullScreen = false,
  color = 'primary',
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  }

  const colorClasses = {
    primary: 'border-neutral-200 border-t-primary-500',
    secondary: 'border-neutral-200 border-t-secondary-500',
    neutral: 'border-neutral-300 border-t-neutral-600',
  }

  const spinner = (
    <div className="flex flex-col items-center gap-4">
      <div className={`spinner ${sizeClasses[size]} ${colorClasses[color]}`} />
      {text && <p className="text-neutral-600 text-sm font-medium">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
