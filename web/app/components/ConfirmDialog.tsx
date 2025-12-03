/**
 * ConfirmDialog Component
 * Modal for destructive or important actions
 */

'use client'

import React, { useState } from 'react'
import { Button } from './Button'

interface ConfirmDialogProps {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  isDangerous?: boolean
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  isOpen: boolean
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
  isOpen,
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: 'var(--color-surface-1)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--spacing-6)',
          maxWidth: '400px',
          width: '90%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-2)',
          }}
        >
          {title}
        </h2>

        {message && (
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-6)',
              lineHeight: '1.5',
            }}
          >
            {message}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-3)',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDangerous ? 'danger' : 'primary'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * useConfirmDialog Hook
 * Simplified usage of ConfirmDialog
 */
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<Partial<ConfirmDialogProps>>({})

  const confirm = (options: Omit<ConfirmDialogProps, 'isOpen'>) => {
    return new Promise<boolean>((resolve) => {
      setConfig({
        ...options,
        onConfirm: async () => {
          await options.onConfirm()
          resolve(true)
          setIsOpen(false)
        },
        onCancel: () => {
          options.onCancel?.()
          resolve(false)
          setIsOpen(false)
        },
      })
      setIsOpen(true)
    })
  }

  return {
    isOpen,
    confirm,
    ConfirmDialog: (
      <ConfirmDialog
        {...(config as ConfirmDialogProps)}
        isOpen={isOpen}
        onCancel={() => setIsOpen(false)}
      />
    ),
  }
}
