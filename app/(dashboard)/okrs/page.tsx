'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { ObjectiveWithKeyResults, Objective, KeyResult } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Progress, CircularProgress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { 
  Target, 
  Plus, 
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  BarChart3,
  Filter,
  Settings
} from 'lucide-react'

export default function OKRsPage() {
  const [objectives, setObjectives] = useState<ObjectiveWithKeyResults[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuarter, setSelectedQuarter] = useState('Q1 2025')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')

  useEffect(() => {
    loadObjectives()
  }, [selectedQuarter])

  const loadObjectives = async () => {
    setLoading(true)

    const { data: objectivesData, error } = await supabase
      .from('objectives')
      .select(`
        *,
        key_results (*)
      `)
      .eq('quarter', selectedQuarter)
      .order('priority', { ascending: true })

    if (error) {
      console.error('Error loading objectives:', error)
    } else {
      setObjectives(objectivesData || [])
    }

    setLoading(false)
  }

  const getOverallProgress = () => {
    if (objectives.length === 0) return 0
    const totalProgress = objectives.reduce((sum, obj) => sum + obj.progress, 0)
    return Math.round(totalProgress / objectives.length)
  }

  const getCompletedObjectives = () => {
    return objectives.filter(obj => obj.status === 'completed').length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'active': return 'primary'
      case 'draft': return 'warning'
      case 'cancelled': return 'danger'
      default: return 'secondary'
    }
  }

  const getPriorityIcon = (priority: number) => {
    const icons = ['🔥', '⚡', '📌', '💡', '📝']
    return icons[priority - 1] || '📝'
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
            🎯 Objectives & Key Results
          </h1>
          <p className="text-slate-400 mt-1">
            Track your quarterly objectives and measure progress with key results
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Quarter Selector */}
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Q1 2025">Q1 2025</option>
            <option value="Q4 2024">Q4 2024</option>
            <option value="Q3 2024">Q3 2024</option>
          </select>
          
          {/* View Toggle */}
          <div className="flex items-center bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
          
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            New Objective
          </Button>
        </div>
      </div>

      {/* Quarter Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="card text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-4">
            <CircularProgress 
              value={getOverallProgress()} 
              size={80} 
              color="indigo"
              showValue={true}
            />
          </div>
          <h3 className="text-lg font-semibold text-slate-50 mb-1">Overall Progress</h3>
          <p className="text-slate-400 text-sm">{selectedQuarter}</p>
        </motion.div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Objectives</p>
              <p className="text-2xl font-bold text-slate-50">{objectives.length}</p>
            </div>
            <Target className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-emerald-400">{getCompletedObjectives()}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Key Results</p>
              <p className="text-2xl font-bold text-slate-50">
                {objectives.reduce((sum, obj) => sum + obj.key_results.length, 0)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Objectives Grid/List */}
      {objectives.length === 0 ? (
        <motion.div
          className="card text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Target className="mx-auto h-16 w-16 text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No objectives yet for {selectedQuarter}</h3>
          <p className="text-slate-400 mb-6">Create your first objective to start tracking your quarterly goals.</p>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Objective
          </Button>
        </motion.div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
          {objectives.map((objective, index) => (
            <motion.div
              key={objective.id}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Objective Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{getPriorityIcon(objective.priority)}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-50 mb-1">
                      {objective.title}
                    </h3>
                    {objective.description && (
                      <p className="text-slate-400 text-sm mb-2">{objective.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(objective.status)} size="sm">
                        {objective.status}
                      </Badge>
                      <span className="text-xs text-slate-500">Priority {objective.priority}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(objective.progress)}%</span>
                </div>
                <Progress value={objective.progress} color="indigo" />
              </div>

              {/* Key Results */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Key Results ({objective.key_results.length})
                </h4>
                
                {objective.key_results.length === 0 ? (
                  <div className="text-center py-4 bg-slate-700/30 rounded-lg">
                    <p className="text-slate-400 text-sm mb-2">No key results defined</p>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Key Result
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {objective.key_results.slice(0, 3).map((kr) => (
                      <div key={kr.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                        {kr.completed ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${kr.completed ? 'line-through text-slate-400' : 'text-slate-300'}`}>
                            {kr.title}
                          </p>
                          {kr.target_value && (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1">
                                <Progress value={kr.progress} color="emerald" size="sm" />
                              </div>
                              <span className="text-xs text-slate-400">
                                {kr.current_value}/{kr.target_value} {kr.unit}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {objective.key_results.length > 3 && (
                      <button className="w-full text-center py-2 text-sm text-slate-400 hover:text-slate-300">
                        View {objective.key_results.length - 3} more key results
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Due Date */}
              {objective.target_completion_date && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>Target: {new Date(objective.target_completion_date).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Actions FAB */}
      <motion.div
        className="fixed bottom-6 right-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button variant="primary" className="rounded-full w-14 h-14 shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </motion.div>
    </div>
  )
}