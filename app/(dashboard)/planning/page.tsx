'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { DailyTask, ObjectiveWithKeyResults } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { 
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  Target,
  Filter,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  BarChart3,
  Play,
  Pause,
  Edit,
  Trash2
} from 'lucide-react'

export default function PlanningPage() {
  const [tasks, setTasks] = useState<DailyTask[]>([])
  const [objectives, setObjectives] = useState<ObjectiveWithKeyResults[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    loadDailyData()
  }, [selectedDate])

  const loadDailyData = async () => {
    setLoading(true)

    const dateStr = selectedDate.toISOString().split('T')[0]

    const [tasksResult, objectivesResult] = await Promise.all([
      supabase
        .from('daily_tasks')
        .select('*')
        .eq('scheduled_date', dateStr)
        .order('priority', { ascending: true }),
      supabase
        .from('objectives')
        .select(`
          *,
          key_results (*)
        `)
        .eq('status', 'active')
        .limit(3)
    ])

    if (tasksResult.error) {
      console.error('Error loading tasks:', tasksResult.error)
    } else {
      setTasks(tasksResult.data || [])
    }

    if (objectivesResult.error) {
      console.error('Error loading objectives:', objectivesResult.error)
    } else {
      setObjectives(objectivesResult.data || [])
    }

    setLoading(false)
  }

  const toggleTaskComplete = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('daily_tasks')
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq('id', taskId)

    if (!error) {
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ))
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getCompletedTasks = () => tasks.filter(task => task.completed).length
  const getTaskCompletionRate = () => tasks.length > 0 ? Math.round((getCompletedTasks() / tasks.length) * 100) : 0

  const getTotalEstimatedHours = () => tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0)
  const getCompletedHours = () => tasks
    .filter(task => task.completed)
    .reduce((sum, task) => sum + (task.estimated_hours || 0), 0)

  const getTasksByCategory = () => {
    const categories = new Map()
    tasks.forEach(task => {
      const category = task.category || 'general'
      const current = categories.get(category) || { total: 0, completed: 0 }
      categories.set(category, {
        total: current.total + 1,
        completed: current.completed + (task.completed ? 1 : 0)
      })
    })
    return Array.from(categories.entries()).map(([category, stats]) => ({
      category,
      ...stats,
      percentage: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
    }))
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'red'
      case 2: return 'amber'
      case 3: return 'indigo'
      case 4: return 'emerald'
      case 5: return 'slate'
      default: return 'slate'
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Urgent'
      case 2: return 'High'
      case 3: return 'Medium'
      case 4: return 'Low'
      case 5: return 'Someday'
      default: return 'Medium'
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setSelectedDate(newDate)
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

  const tasksByCategory = getTasksByCategory()
  const isToday = selectedDate.toDateString() === new Date().toDateString()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center">
            📅 Daily Planning
          </h1>
          <p className="text-slate-400 mt-1">
            Plan your day and track progress towards your goals
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'day' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'week' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Week
            </button>
          </div>
          
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-slate-50">
              {formatDate(selectedDate)}
            </h2>
            {isToday && (
              <Badge variant="primary" size="sm" className="mt-1">Today</Badge>
            )}
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedDate(new Date())}
        >
          Today
        </Button>
      </div>

      {/* Daily Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold text-slate-50">{tasks.length}</p>
            </div>
            <CalendarDays className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-emerald-400">{getCompletedTasks()}</p>
              <div className="mt-2">
                <Progress value={getTaskCompletionRate()} color="emerald" size="sm" />
              </div>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Estimated Hours</p>
              <p className="text-2xl font-bold text-slate-50">{getTotalEstimatedHours()}h</p>
              <p className="text-xs text-slate-400 mt-1">{getCompletedHours()}h completed</p>
            </div>
            <Clock className="h-8 w-8 text-amber-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Categories</p>
              <p className="text-2xl font-bold text-slate-50">{tasksByCategory.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-50">Today's Tasks</h3>
              <div className="flex items-center gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-slate-200"
                >
                  <option value="all">All Categories</option>
                  {tasksByCategory.map(cat => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h4 className="text-slate-300 font-medium mb-2">No tasks scheduled</h4>
                <p className="text-slate-400 text-sm mb-4">Plan your day by adding some tasks.</p>
                <Button variant="primary" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Task
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks
                  .filter(task => filterCategory === 'all' || task.category === filterCategory)
                  .map((task, index) => (
                  <motion.div
                    key={task.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      task.completed 
                        ? 'bg-slate-700/30 border-slate-600' 
                        : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => toggleTaskComplete(task.id, e.target.checked)}
                      className="h-5 w-5 text-indigo-600 rounded border-slate-600 bg-slate-700 focus:ring-indigo-500"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                          {task.title}
                        </h4>
                        <Badge 
                          variant={getPriorityColor(task.priority) as any} 
                          size="sm"
                        >
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className={`text-sm ${task.completed ? 'text-slate-500' : 'text-slate-400'}`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.estimated_hours}h
                        </span>
                        <span className="capitalize">{task.category}</span>
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* OKR Progress */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-50 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Active OKRs
              </h3>
            </div>
            
            {objectives.length === 0 ? (
              <div className="text-center py-4">
                <Target className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-slate-400 text-sm">No active objectives</p>
              </div>
            ) : (
              <div className="space-y-4">
                {objectives.slice(0, 3).map((objective) => (
                  <div key={objective.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-slate-200 truncate">
                        {objective.title}
                      </h4>
                      <span className="text-xs text-slate-400">{Math.round(objective.progress)}%</span>
                    </div>
                    <Progress value={objective.progress} color="indigo" size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-50 mb-4">Categories</h3>
            
            {tasksByCategory.length === 0 ? (
              <div className="text-center py-4">
                <BarChart3 className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-slate-400 text-sm">No tasks today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasksByCategory.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300 capitalize">{category.category}</span>
                      <span className="text-xs text-slate-400">
                        {category.completed}/{category.total}
                      </span>
                    </div>
                    <Progress value={category.percentage} color="emerald" size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-slate-50 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Time Block
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Link to OKR
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}