/**
 * ToastProvider & useToast Hook
 * Provides simple toast/notification UI
 */

'use client'

import React, { createContext, useState, useCallback, ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => string
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9)
    const toast: Toast = { id, message, type, duration }

    setToasts((prev) => [...prev, toast])

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

/**
 * Toast Container Component
 */
function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  const bgColor: Record<ToastType, string> = {
    success: 'var(--color-success)',
    error: 'var(--color-danger)',
    info: 'var(--color-primary)',
    warning: 'var(--color-warning)',
  }

  const borderColor: Record<ToastType, string> = {
    success: 'var(--color-success-light)',
    error: 'var(--color-danger-light)',
    info: 'var(--color-primary-light)',
    warning: 'var(--color-warning-light)',
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 'var(--spacing-4)',
        right: 'var(--spacing-4)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-2)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          style={{
            backgroundColor: bgColor[toast.type],
            color: 'white',
            padding: 'var(--spacing-3) var(--spacing-4)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            minWidth: '300px',
            maxWidth: '500px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            animation: 'slideInRight 0.3s ease-in-out',
            pointerEvents: 'all',
          }}
        >
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: 0,
              marginLeft: 'var(--spacing-3)',
              lineHeight: 1,
            }}
            aria-label="Close toast"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
