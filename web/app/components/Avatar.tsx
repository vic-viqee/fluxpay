import React from 'react'

interface AvatarProps {
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg'
  status?: 'online' | 'offline' | 'away'
  className?: string
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
  }

  const statusClasses = {
    online: 'bg-success-500',
    offline: 'bg-neutral-300',
    away: 'bg-warning-500',
  }

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <div className={`relative inline-flex ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} bg-primary-500 text-white rounded-full flex items-center justify-center font-bold`}
        >
          {initials}
        </div>
      )}

      {status && (
        <div
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${statusClasses[status]}`}
        />
      )}
    </div>
  )
}
