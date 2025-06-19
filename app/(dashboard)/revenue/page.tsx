'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { RevenueEntry, MonthlyRevenue } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { 
  DollarSign, 
  Plus, 
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Edit,
  Trash2
} from 'lucide-react'

export default function RevenuePage() {
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [viewMode, setViewMode] = useState<'monthly' | 'sources'>('monthly')

  useEffect(() => {
    loadRevenueData()
  }, [selectedYear])

  const loadRevenueData = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('revenue_entries')
      .select('*')
      .eq('year', selectedYear)
      .order('month', { ascending: true })

    if (error) {
      console.error('Error loading revenue data:', error)
    } else {
      setRevenueEntries(data || [])
    }

    setLoading(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'long' })
  }

  const getMonthlyData = (): MonthlyRevenue[] => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1)
    
    return months.map(month => {
      const monthEntries = revenueEntries.filter(entry => entry.month === month)
      const actual = monthEntries.reduce((sum, entry) => sum + entry.amount, 0)
      const target = monthEntries.reduce((sum, entry) => sum + (entry.target_amount || 0), 0) || 38000 // Default target
      
      return {
        month: getMonthName(month),
        target,
        actual
      }
    })
  }

  const getTotalRevenue = () => {
    return revenueEntries.reduce((sum, entry) => sum + entry.amount, 0)
  }

  const getTotalTarget = () => {
    const monthlyData = getMonthlyData()
    return monthlyData.reduce((sum, month) => sum + month.target, 0)
  }

  const getAverageMonthly = () => {
    const total = getTotalRevenue()
    const monthsWithData = new Set(revenueEntries.map(entry => entry.month)).size
    return monthsWithData > 0 ? total / monthsWithData : 0
  }

  const getRevenueBySource = () => {
    const sourceMap = new Map()
    
    revenueEntries.forEach(entry => {
      const current = sourceMap.get(entry.income_source) || 0
      sourceMap.set(entry.income_source, current + entry.amount)
    })
    
    const total = getTotalRevenue()
    return Array.from(sourceMap.entries()).map(([source, amount]) => ({
      source,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    }))
  }

  const getYearProgress = () => {
    const currentMonth = new Date().getMonth() + 1
    const monthsElapsed = selectedYear === new Date().getFullYear() ? currentMonth : 12
    return (monthsElapsed / 12) * 100
  }

  const getTargetProgress = () => {
    const total = getTotalRevenue()
    const yearTarget = getTotalTarget()
    return yearTarget > 0 ? (total / yearTarget) * 100 : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  const monthlyData = getMonthlyData()
  const revenueBySource = getRevenueBySource()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center">
            💰 Revenue Tracking
          </h1>
          <p className="text-slate-400 mt-1">
            Monitor your income streams and track progress against targets
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Year Selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
          
          {/* View Toggle */}
          <div className="flex items-center bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('sources')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'sources' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Sources
            </button>
          </div>
          
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Revenue
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-50">{formatCurrency(getTotalRevenue())}</p>
              <p className="text-xs text-slate-500 mt-1">{selectedYear}</p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Annual Target</p>
              <p className="text-2xl font-bold text-slate-50">{formatCurrency(getTotalTarget())}</p>
              <div className="mt-2">
                <Progress value={getTargetProgress()} color="indigo" size="sm" />
                <p className="text-xs text-slate-400 mt-1">{Math.round(getTargetProgress())}% achieved</p>
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Monthly Average</p>
              <p className="text-2xl font-bold text-slate-50">{formatCurrency(getAverageMonthly())}</p>
              <p className="text-xs text-slate-500 mt-1">This year</p>
            </div>
            <BarChart3 className="h-8 w-8 text-amber-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Income Sources</p>
              <p className="text-2xl font-bold text-slate-50">{revenueBySource.length}</p>
              <p className="text-xs text-slate-500 mt-1">Active streams</p>
            </div>
            <PieChart className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Monthly View */}
      {viewMode === 'monthly' && (
        <div className="space-y-6">
          {/* Monthly Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-50">Monthly Performance</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-600 rounded"></div>
                  <span className="text-slate-400">Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-600 rounded"></div>
                  <span className="text-slate-400">Target</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-12 gap-2 h-40">
              {monthlyData.map((month, index) => {
                const maxValue = Math.max(...monthlyData.map(m => Math.max(m.actual, m.target)))
                const actualHeight = maxValue > 0 ? (month.actual / maxValue) * 100 : 0
                const targetHeight = maxValue > 0 ? (month.target / maxValue) * 100 : 0
                
                return (
                  <div key={month.month} className="flex flex-col items-center">
                    <div className="flex-1 flex flex-col justify-end gap-1">
                      <motion.div
                        className="w-6 bg-indigo-600 rounded-t"
                        style={{ height: `${actualHeight}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${actualHeight}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      />
                      <motion.div
                        className="w-6 bg-slate-600 rounded-t opacity-50"
                        style={{ height: `${targetHeight}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${targetHeight}%` }}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-slate-400 text-center">
                      {month.month.slice(0, 3)}
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      {formatCurrency(month.actual)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyData.map((month, index) => (
              <motion.div
                key={month.month}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-200">{month.month}</h4>
                  <div className="flex items-center gap-1">
                    {month.actual >= month.target ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Actual</span>
                    <span className="text-slate-200 font-medium">{formatCurrency(month.actual)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Target</span>
                    <span className="text-slate-400">{formatCurrency(month.target)}</span>
                  </div>
                  <Progress 
                    value={month.target > 0 ? (month.actual / month.target) * 100 : 0} 
                    color={month.actual >= month.target ? "emerald" : "amber"}
                    size="sm"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Sources View */}
      {viewMode === 'sources' && (
        <div className="space-y-6">
          {/* Revenue by Source */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-50">Revenue by Source</h3>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </div>
            
            {revenueBySource.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h4 className="text-slate-300 font-medium mb-2">No revenue entries yet</h4>
                <p className="text-slate-400 text-sm mb-4">Start tracking your income sources.</p>
                <Button variant="primary" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Entry
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {revenueBySource.map((source) => (
                  <div key={source.source} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-200">{source.source}</h4>
                        <span className="text-slate-300 font-medium">{formatCurrency(source.amount)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Progress value={source.percentage} color="emerald" size="sm" />
                        </div>
                        <span className="text-xs text-slate-400">{Math.round(source.percentage)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Recent Entries */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-50">Recent Entries</h3>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            
            <div className="space-y-3">
              {revenueEntries.slice(-5).reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{entry.income_source}</p>
                      <p className="text-xs text-slate-400">
                        {getMonthName(entry.month)} {entry.year}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-200">{formatCurrency(entry.amount)}</p>
                    <div className="flex items-center gap-2">
                      {entry.payment_received && (
                        <Badge variant="success" size="sm">Paid</Badge>
                      )}
                      {entry.is_recurring && (
                        <Badge variant="info" size="sm">Recurring</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}