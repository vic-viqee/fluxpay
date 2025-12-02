import React, { useState } from 'react'

interface DropdownOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: DropdownOption[]
  label?: string
  placeholder?: string
  error?: string
  helpText?: string
  icon?: React.ReactNode
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { options, label, placeholder, error, helpText, icon, className = '', ...props },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && <label className="label">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
          <select
            ref={ref}
            className={`input ${icon ? 'pl-10' : ''} appearance-none cursor-pointer ${
              error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-400' : ''
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
            ▼
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
        {helpText && !error && <p className="mt-1 text-sm text-neutral-500">{helpText}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

interface DropdownProps {
  options: DropdownOption[]
  onSelect: (value: string | number) => void
  children: React.ReactNode
  align?: 'left' | 'right'
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  onSelect,
  children,
  align = 'left',
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(!open)} className="focus:outline-none">
        {children}
      </button>

      {open && (
        <div
          className={`
            absolute top-full mt-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 min-w-48
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          {options.map((opt, idx) => (
            <button
              key={opt.value}
              onClick={() => {
                onSelect(opt.value)
                setOpen(false)
              }}
              disabled={opt.disabled}
              className={`
                w-full text-left px-4 py-2 text-sm
                ${idx !== 0 ? 'border-t border-neutral-100' : ''}
                ${opt.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-50 cursor-pointer'}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}
    </div>
  )
}
