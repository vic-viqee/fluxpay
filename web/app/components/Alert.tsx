import React from 'react'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'success' | 'danger' | 'warning' | 'info'
  title?: string
  children: React.ReactNode
  icon?: React.ReactNode
  closable?: boolean
  onClose?: () => void
  className?: string
}

export const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  children,
  icon,
  closable = false,
  onClose,
  className = '',
  ...props
}) => {
  const variantClasses = {
    success: 'alert-success',
    danger: 'alert-danger',
    warning: 'alert-warning',
    info: 'alert-info',
  }

  const iconMap = {
    success: '✓',
    danger: '✕',
    warning: '⚠',
    info: 'ⓘ',
  }

  return (
    <div className={`alert ${variantClasses[variant]} ${className}`} {...props}>
      <div className="flex gap-3">
        <div className="text-lg">{icon || iconMap[variant]}</div>
        <div className="flex-1">
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <div>{children}</div>
        </div>
        {closable && (
          <button
            onClick={onClose}
            className="text-lg leading-none opacity-70 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
