import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  icon?: React.ReactNode
  variant?: 'default' | 'compact'
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helpText, icon, variant = 'default', className = '', ...props },
    ref
  ) => {
    const inputSize = variant === 'compact' ? 'py-1 px-3 text-sm' : 'py-2 px-4'

    return (
      <div className="w-full">
        {label && <label className="label">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
          <input
            ref={ref}
            className={`input ${inputSize} ${icon ? 'pl-10' : ''} ${
              error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-400' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
        {helpText && !error && <p className="mt-1 text-sm text-neutral-500">{helpText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
