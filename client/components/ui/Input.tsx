import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  multiline?: boolean
  rows?: number
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', multiline, rows = 4, ...props }, ref) => {
    const Component = multiline ? 'textarea' : 'input'
    const inputProps = multiline ? { rows } : { type }
    
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <Component
          {...inputProps}
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            multiline && 'resize-y min-h-[100px]',
            className
          )}
          ref={ref as any}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

