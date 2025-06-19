'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Contact, Deal } from '@/types/database'
import { MetricCard } from '@/components/ui/Card'
import { Progress, CircularProgress } from '@/components/ui/Progress'
import { Button } from '@/components/ui/Button'
import { Badge, StatusBadge } from '@/components/ui/Badge'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target,
  Calendar,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Plus,
  Activity,
  Briefcase
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalContacts: number
  activeDeals: number
  wonDeals: number
  pipelineValue: number
  wonRevenue: number
  recentContacts: Contact[]
  recentDeals: Deal[]
}

// Mock OKR data - will be replaced with real data later
const mockOKRs = [
  {
    id: '1',
    title: 'Secure Revenue Foundation',
    progress: 80,
    keyResults: [
      { title: '11 teaching days in Bigum', completed: true },
      { title: 'Apply for parental benefits', completed: false },
      { title: 'Land one more client in SVC', completed: false }
    ]
  },
  {
    id: '2', 
    title: 'Build Brand Presence',
    progress: 50,
    keyResults: [
      { title: '8 LinkedIn posts', completed: false },
      { title: '100h relationship work', completed: false },
      { title: '100h learning to code', completed: true }
    ]
  }
]

// Mock revenue data
const mockRevenueData = [
  { month: 'Jan', target: 38000, actual: 22000 },
  { month: 'Feb', target: 38000, actual: 22000 },
  { month: 'Mar', target: 38000, actual: 38000 },
  { month: 'Apr', target: 38000, actual: 8000 },
  { month: 'May', target: 38000, actual: 24000 },
  { month: 'Jun', target: 38000, actual: 17000 }
]

const todaysTasks = [
  { id: '1', text: 'Call Christopher DTU', completed: true },
  { id: '2', text: 'LinkedIn post about AI', completed: false },
  { id: '3', text: 'Review proposals', completed: false },
  { id: '4', text: 'Follow up with Dragør Kommune', completed: false }
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    activeDeals: 0,
    wonDeals: 0,
    pipelineValue: 0,
    wonRevenue: 0,
    recentContacts: [],
    recentDeals: [],
  })
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)

    // Get user first
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    const [contactsResult, dealsResult] = await Promise.all([
      supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('deals')
        .select(`
          *,
          contact:contacts(first_name, last_name, company)
        `)
        .order('created_at', { ascending: false })
        .limit(5)
    ])

    if (contactsResult.data && dealsResult.data) {
      const contacts = contactsResult.data
      const deals = dealsResult.data

      const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
      const wonDeals = deals.filter(d => d.stage === 'closed_won')
      
      const pipelineValue = activeDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
      const wonRevenue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)

      setStats({
        totalContacts: contacts.length,
        activeDeals: activeDeals.length,
        wonDeals: wonDeals.length,
        pipelineValue,
        wonRevenue,
        recentContacts: contacts.slice(0, 5),
        recentDeals: deals.slice(0, 5),
      })
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

  const getCompletedTasks = () => todaysTasks.filter(task => task.completed).length
  const getTaskCompletionRate = () => Math.round((getCompletedTasks() / todaysTasks.length) * 100)

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-50 mb-2">
          🎯 Good afternoon, {(user?.email || 'User').split('@')[0]}!
        </h1>
        <p className="text-slate-400">Ready to crush your goals? Here's your Q1 2025 progress.</p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon="💰"
          title="Revenue This Month"
          value={formatCurrency(17000)}
          change="+12%"
          trend="up"
          color="emerald"
          progress={45}
        />
        
        <MetricCard
          icon="🎯"
          title="OKR Progress"
          value="65%"
          color="indigo"
          progress={65}
        />
        
        <MetricCard
          icon="👥"
          title="Total Contacts"
          value={stats.totalContacts || 1923}
          change="+100 today"
          color="indigo"
        />
        
        <MetricCard
          icon="💼"
          title="Active Deals"
          value={stats.activeDeals}
          change={`${formatCurrency(stats.pipelineValue)} pipeline`}
          color="amber"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Focus */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-50 flex items-center">
                📅 Today's Focus
              </h3>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {todaysTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    className="h-4 w-4 text-indigo-600 rounded border-slate-600 bg-slate-700 focus:ring-indigo-500"
                    readOnly
                  />
                  <span className={`text-sm ${task.completed ? 'line-through text-slate-400' : 'text-slate-300'}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Daily Progress</span>
                <span>{getCompletedTasks()}/{todaysTasks.length} tasks</span>
              </div>
              <Progress value={getTaskCompletionRate()} color="emerald" />
            </div>
          </div>
        </motion.div>

        {/* Current OKRs */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-50 flex items-center">
                🎯 Q1 2025 Objectives
              </h3>
              <Link href="/okrs">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            
            <div className="space-y-6">
              {mockOKRs.map((okr) => (
                <div key={okr.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-200">{okr.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">{okr.progress}%</span>
                      <div className="w-20">
                        <Progress value={okr.progress} color="indigo" size="sm" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {okr.keyResults.map((kr, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm p-2 rounded bg-slate-700/30">
                        {kr.completed ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-slate-400" />
                        )}
                        <span className={kr.completed ? 'text-slate-300' : 'text-slate-400'}>
                          {kr.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Revenue Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-50 flex items-center">
              📈 Revenue Trend (Last 6 Months)
            </h3>
            <Link href="/revenue">
              <Button variant="ghost" size="sm">
                View Details
              </Button>
            </Link>
          </div>
          
          {/* Simple revenue chart */}
          <div className="grid grid-cols-6 gap-4 h-32">
            {mockRevenueData.map((month, index) => (
              <div key={month.month} className="flex flex-col items-center">
                <div className="flex-1 flex flex-col justify-end">
                  <motion.div
                    className="w-8 bg-indigo-600 rounded-t"
                    style={{ height: `${(month.actual / 38000) * 100}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(month.actual / 38000) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-400">{month.month}</div>
                <div className="text-xs text-slate-300">{formatCurrency(month.actual)}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-50 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Recent Contacts
              </h3>
              <Link href="/contacts">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            
            {stats.recentContacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h4 className="text-slate-300 font-medium mb-2">No contacts yet</h4>
                <p className="text-slate-400 text-sm mb-4">Get started by adding your first contact.</p>
                <Link href="/contacts">
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {contact.first_name[0]}{contact.last_name[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200">
                        {contact.first_name} {contact.last_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {contact.company || contact.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Deals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-50 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Recent Deals
              </h3>
              <Link href="/deals">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            
            {stats.recentDeals.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h4 className="text-slate-300 font-medium mb-2">No deals yet</h4>
                <p className="text-slate-400 text-sm mb-4">Start tracking your sales opportunities.</p>
                <Link href="/deals">
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentDeals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {deal.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {deal.contact?.first_name} {deal.contact?.last_name} • {formatCurrency(deal.value || 0)}
                      </p>
                    </div>
                    <StatusBadge status={deal.stage} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}