import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}
const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-5 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ComponentProps<'button'> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button className={cn('btn', buttonVariants[variant], buttonSizes[size], className)} {...props} />
  )
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn('field h-11 w-full rounded-pill px-4 text-foreground', className)}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn('field w-full rounded-card px-4 py-3 text-foreground', className)}
      {...props}
    />
  )
}

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return <label className={cn('text-sm font-medium text-foreground', className)} {...props} />
}

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-card border border-border bg-card p-5 shadow-soft-sm', className)}
      {...props}
    />
  )
}

export function Badge({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}
