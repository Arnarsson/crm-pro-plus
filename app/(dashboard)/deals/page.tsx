'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Deal, Contact } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  User, 
  TrendingUp,
  Target
} from 'lucide-react'

export default function DealsPage() {
  const [deals, setDeals] = useState<(Deal & { contact?: Contact })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        contact:contacts(*)
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setDeals(data)
    }

    setLoading(false)
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '0 DKK'
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getTotalPipelineValue = () => {
    return deals
      .filter(deal => !['closed_won', 'closed_lost'].includes(deal.stage))
      .reduce((sum, deal) => sum + (deal.value || 0), 0)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center">
            💼 Deals Pipeline
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your sales opportunities with RICE prioritization
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Pipeline</p>
              <p className="text-2xl font-bold text-slate-50">{formatCurrency(getTotalPipelineValue())}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Deals</p>
              <p className="text-2xl font-bold text-slate-50">{deals.length}</p>
            </div>
            <Target className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Won Deals</p>
              <p className="text-2xl font-bold text-emerald-400">
                {deals.filter(d => d.stage === 'closed_won').length}
              </p>
            </div>
            <Target className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-50 mb-6">All Deals</h3>
        {deals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No deals yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal, index) => (
              <motion.div
                key={deal.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex-1">
                  <h4 className="font-medium text-slate-200">{deal.title}</h4>
                  <p className="text-sm text-slate-400">
                    {deal.contact?.first_name} {deal.contact?.last_name} • {formatCurrency(deal.value)}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <StatusBadge status={deal.stage} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}