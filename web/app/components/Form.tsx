import React from 'react'

interface FormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
  className?: string
  layout?: 'vertical' | 'horizontal'
}

export const Form: React.FC<FormProps> = ({
  onSubmit,
  children,
  className = '',
  layout = 'vertical',
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className={`
        ${layout === 'vertical' ? 'space-y-6' : 'space-y-4'}
        ${className}
      `}
    >
      {children}
    </form>
  )
}

interface FormGroupProps {
  children: React.ReactNode
  className?: string
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, className = '' }) => {
  return <div className={`space-y-2 ${className}`}>{children}</div>
}

interface FormRowProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3
  gap?: 'sm' | 'md' | 'lg'
}

export const FormRow: React.FC<FormRowProps> = ({ children, columns = 2, gap = 'md' }) => {
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }

  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
  }

  return (
    <div className={`grid ${colsClasses[columns]} ${gapClasses[gap]}`}>
      {children}
    </div>
  )
}
