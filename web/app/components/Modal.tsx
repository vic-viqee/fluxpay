import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  footer?: React.ReactNode
  closeButton?: boolean
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  closeButton = true,
}) => {
  if (!isOpen) return null

  const sizeStyles = {
    sm: { maxWidth: '24rem' },
    md: { maxWidth: '28rem' },
    lg: { maxWidth: '32rem' },
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={sizeStyles[size]}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || closeButton) && (
          <div className="modal-header">
            {title && <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>{title}</h2>}
            {!title && <div />}
            {closeButton && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                }}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="modal-body">{children}</div>

        {/* Footer */}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
