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
  const sizeStyles = {
    sm: { width: '2rem', height: '2rem', fontSize: '0.75rem' },
    md: { width: '3rem', height: '3rem', fontSize: '0.875rem' },
    lg: { width: '4rem', height: '4rem', fontSize: '1rem' },
  }

  const statusColorMap = {
    online: '#10b981',
    offline: '#d1d5db',
    away: '#f59e0b',
  }

  const initials = name
    ? name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
    : 'U'

  return (
    <div className={className} style={{ position: 'relative', display: 'inline-flex' }}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          style={{
            ...sizeStyles[size],
            borderRadius: '9999px',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            ...sizeStyles[size],
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
          }}
        >
          {initials}
        </div>
      )
      }

      {
        status && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '0.75rem',
              height: '0.75rem',
              borderRadius: '9999px',
              border: '2px solid white',
              backgroundColor: statusColorMap[status],
            }}
          />
        )
      }
    </div >
  )
}
