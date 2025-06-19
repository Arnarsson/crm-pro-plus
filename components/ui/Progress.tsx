import { motion } from 'framer-motion'

interface ProgressProps {
  value: number
  max?: number
  color?: 'indigo' | 'emerald' | 'amber' | 'red'
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  label?: string
}

export function Progress({ 
  value, 
  max = 100, 
  color = 'indigo', 
  size = 'md', 
  showValue = false,
  label 
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  }
  
  const colors = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    red: 'bg-red-600'
  }
  
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      
      <div className={`w-full bg-slate-700 rounded-full ${heights[size]}`}>
        <motion.div
          className={`${heights[size]} rounded-full ${colors[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: 'indigo' | 'emerald' | 'amber' | 'red'
  showValue?: boolean
}

export function CircularProgress({ 
  value, 
  max = 100, 
  size = 120, 
  strokeWidth = 8,
  color = 'indigo',
  showValue = true
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  
  const colors = {
    indigo: '#6366F1',
    emerald: '#10B981',
    amber: '#F59E0B',
    red: '#EF4444'
  }
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#374151"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[color]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-slate-50">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  )
}