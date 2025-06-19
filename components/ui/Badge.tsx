import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({ 
  children, 
  variant = 'secondary', 
  size = 'md',
  className = '' 
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'
  
  const variants = {
    primary: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    secondary: 'bg-slate-700 text-slate-200 border border-slate-600',
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  return (
    <span className={classes}>
      {children}
    </span>
  )
}

interface RiceBadgeProps {
  reach: number
  impact: number
  confidence: number
  effort: number
  className?: string
}

export function RiceBadge({ reach, impact, confidence, effort, className = '' }: RiceBadgeProps) {
  const score = (reach * impact * confidence) / effort
  
  const getVariant = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    if (score >= 40) return 'info'
    return 'danger'
  }
  
  const getLabel = (score: number) => {
    if (score >= 80) return 'High Priority'
    if (score >= 60) return 'Medium Priority'
    if (score >= 40) return 'Low Priority'
    return 'Very Low Priority'
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={getVariant(score)} size="sm">
        RICE: {Math.round(score)}
      </Badge>
      <span className="text-xs text-slate-400">
        {getLabel(score)}
      </span>
    </div>
  )
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
      case 'closed_won':
        return 'success'
      case 'in_progress':
      case 'active':
        return 'warning'
      case 'pending':
      case 'draft':
        return 'info'
      case 'cancelled':
      case 'closed_lost':
        return 'danger'
      default:
        return 'secondary'
    }
  }
  
  return (
    <Badge variant={getVariant(status)} size="sm" className={className}>
      {status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
    </Badge>
  )
}