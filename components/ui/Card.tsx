import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glass?: boolean
  gradient?: boolean
}

export function Card({ children, className = '', hover = false, glass = false, gradient = false }: CardProps) {
  const baseClasses = 'rounded-lg p-6 shadow-premium'
  const hoverClasses = hover ? 'card-hover cursor-pointer' : ''
  const glassClasses = glass ? 'glass' : 'bg-slate-800 border border-slate-700'
  const gradientClasses = gradient ? 'bg-gradient-to-br from-slate-800 to-slate-900' : ''
  
  const classes = `${baseClasses} ${glassClasses} ${gradientClasses} ${hoverClasses} ${className}`
  
  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2 } : {}}
    >
      {children}
    </motion.div>
  )
}

interface MetricCardProps {
  icon: string
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  chart?: ReactNode
  color?: 'indigo' | 'emerald' | 'amber' | 'red'
  progress?: number
}

export function MetricCard({ 
  icon, 
  title, 
  value, 
  change, 
  trend = 'neutral',
  chart,
  color = 'indigo',
  progress
}: MetricCardProps) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400', 
    neutral: 'text-slate-400'
  }
  
  const colorClasses = {
    indigo: 'border-indigo-500/20 bg-indigo-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
    red: 'border-red-500/20 bg-red-500/5'
  }
  
  return (
    <Card hover className={`relative overflow-hidden ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{icon}</span>
            <div>
              <p className="text-sm text-slate-400 font-medium">{title}</p>
              <p className="text-2xl font-bold text-slate-50 mt-1">{value}</p>
            </div>
          </div>
          
          {change && (
            <div className={`flex items-center mt-2 text-sm ${trendColors[trend]}`}>
              {trend === 'up' && <span>↗</span>}
              {trend === 'down' && <span>↘</span>}
              <span className="ml-1">{change}</span>
            </div>
          )}
          
          {progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-bar">
                <motion.div 
                  className={`progress-fill bg-${color}-600`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          )}
        </div>
        
        {chart && (
          <div className="ml-4 w-16 h-12">
            {chart}
          </div>
        )}
      </div>
    </Card>
  )
}