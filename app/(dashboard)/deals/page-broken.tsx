'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Deal, Contact } from '@/types/database'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/Button'
import { Badge, RiceBadge, StatusBadge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  User, 
  TrendingUp,
  BarChart3,
  Filter,
  SortDesc,
  Target,
  Star,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react'
// import { DealModal } from '@/components/DealModal'

const STAGES = [
  { id: 'lead', name: 'Leads', color: 'bg-slate-700', icon: '🎯', count: 0 },
  { id: 'qualified', name: 'Qualified', color: 'bg-indigo-700', icon: '✅', count: 0 },
  { id: 'proposal', name: 'Proposal', color: 'bg-amber-700', icon: '📄', count: 0 },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-700', icon: '🤝', count: 0 },
  { id: 'closed_won', name: 'Won', color: 'bg-emerald-700', icon: '🏆', count: 0 },
  { id: 'closed_lost', name: 'Lost', color: 'bg-red-700', icon: '❌', count: 0 },
]

export default function DealsPage() {
  const [deals, setDeals] = useState<(Deal & { contact?: Contact })[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'rice'>('kanban')
  const [sortBy, setSortBy] = useState<'created_at' | 'value' | 'rice_score'>('rice_score')

  useEffect(() => {
    loadData()
  }, [sortBy])
  
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const loadData = async () => {
    setLoading(true)
    
    const orderBy = sortBy === 'rice_score' ? { rice_score: { ascending: false, nullsLast: true } } :
                   sortBy === 'value' ? { value: { ascending: false, nullsLast: true } } :
                   { created_at: { ascending: false } }
    
    const [dealsResult, contactsResult] = await Promise.all([
      supabase
        .from('deals')
        .select(`
          *,
          contact:contacts(*)
        `)
        .order(Object.keys(orderBy)[0], Object.values(orderBy)[0]),
      supabase
        .from('contacts')
        .select('*')
        .order('first_name')
    ])

    if (!dealsResult.error && dealsResult.data) {
      setDeals(dealsResult.data)
    }

    if (!contactsResult.error && contactsResult.data) {
      setContacts(contactsResult.data)
    }

    setLoading(false)
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const dealId = result.draggableId
    const newStage = result.destination.droppableId

    const { error } = await supabase
      .from('deals')
      .update({ stage: newStage })
      .eq('id', dealId)

    if (!error) {
      setDeals(deals.map(deal => 
        deal.id === dealId ? { ...deal, stage: newStage } : deal
      ))
    }
  }

  const handleCreateDeal = () => {
    setSelectedDeal(null)
    setIsModalOpen(true)
  }

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedDeal(null)
    loadData()
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '0 DKK'
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getStageDeals = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId)
  }

  const getTotalValue = (stageId: string) => {
    return getStageDeals(stageId).reduce((sum, deal) => sum + (deal.value || 0), 0)
  }

  const getAverageRiceScore = () => {
    const dealsWithRice = deals.filter(deal => deal.rice_score !== null && deal.rice_score !== undefined)
    if (dealsWithRice.length === 0) return 0
    return dealsWithRice.reduce((sum, deal) => sum + (deal.rice_score || 0), 0) / dealsWithRice.length
  }

  const getHighPriorityDeals = () => {
    return deals.filter(deal => (deal.rice_score || 0) >= 80).length
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
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('rice')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'rice' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              RICE
            </button>
          </div>
          
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="rice_score">RICE Score</option>
            <option value="value">Deal Value</option>
            <option value="created_at">Date Created</option>
          </select>
          
          <Button variant="primary" onClick={handleCreateDeal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Pipeline</p>
              <p className="text-2xl font-bold text-slate-50">{formatCurrency(getTotalPipelineValue())}</p>
              <p className="text-xs text-slate-500 mt-1">{deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length} active deals</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">High Priority</p>
              <p className="text-2xl font-bold text-amber-400">{getHighPriorityDeals()}</p>
              <p className="text-xs text-slate-500 mt-1">RICE score ≥ 80</p>
            </div>
            <Star className="h-8 w-8 text-amber-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg RICE Score</p>
              <p className="text-2xl font-bold text-indigo-400">{Math.round(getAverageRiceScore())}</p>
              <p className="text-xs text-slate-500 mt-1">Portfolio average</p>
            </div>
            <Target className="h-8 w-8 text-indigo-400" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Conversion Rate</p>
              <p className="text-2xl font-bold text-emerald-400">
                {deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'closed_won').length / deals.length) * 100) : 0}%
              </p>
              <p className="text-xs text-slate-500 mt-1">Won deals</p>
            </div>
            <BarChart3 className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const stageDeals = getStageDeals(stage.id)
              const totalValue = getTotalValue(stage.id)

              return (
                <motion.div
                  key={stage.id}
                  className="flex-shrink-0 w-80"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: STAGES.indexOf(stage) * 0.1 }}
                >
                  <div className={`rounded-lg ${stage.color} border border-slate-600 p-4`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{stage.icon}</span>
                        <h3 className="font-semibold text-slate-50">{stage.name}</h3>
                      </div>
                      <Badge variant="secondary" size="sm">
                        {stageDeals.length}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-400 mb-4">
                      {formatCurrency(totalValue)}
                    </div>

                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`min-h-[300px] space-y-3 ${
                            snapshot.isDraggingOver ? 'bg-indigo-900/20 rounded-lg' : ''
                          }`}
                        >
                          {stageDeals.map((deal, index) => (
                            <Draggable key={deal.id} draggableId={deal.id} index={index}>
                              {(provided, snapshot) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`card cursor-pointer hover:bg-slate-700 transition-colors ${
                                    snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500' : ''
                                  }`}
                                  onClick={() => handleEditDeal(deal)}
                                  whileHover={{ scale: 1.02 }}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-medium text-slate-200 text-sm">{deal.title}</h4>
                                    {deal.rice_score && (
                                      <Badge 
                                        variant={deal.rice_score >= 80 ? 'success' : deal.rice_score >= 60 ? 'warning' : 'secondary'} 
                                        size="sm"
                                      >
                                        {Math.round(deal.rice_score)}
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-2 text-sm">
                                    {deal.contact && (
                                      <div className="flex items-center text-slate-400">
                                        <User className="h-3 w-3 mr-1" />
                                        {deal.contact.first_name} {deal.contact.last_name}
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center text-slate-300">
                                      <DollarSign className="h-3 w-3 mr-1" />
                                      {formatCurrency(deal.value)}
                                    </div>
                                    
                                    {deal.expected_close && (
                                      <div className="flex items-center text-slate-400">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(deal.expected_close).toLocaleDateString()}
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between pt-2">
                                      <Progress value={deal.probability} color="indigo" size="sm" />
                                      <span className="text-xs text-slate-500 ml-2">
                                        {deal.probability}%
                                      </span>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </DragDropContext>
      )}

      {/* RICE Priority View */}
      {viewMode === 'rice' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-50">RICE Prioritization</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Reach × Impact × Confidence ÷ Effort</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {deals
              .filter(deal => deal.rice_score !== null)
              .sort((a, b) => (b.rice_score || 0) - (a.rice_score || 0))
              .map((deal, index) => (
                <motion.div
                  key={deal.id}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleEditDeal(deal)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-lg font-bold text-slate-400">#{index + 1}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-200">{deal.title}</h4>
                      <p className="text-sm text-slate-400">
                        {deal.contact?.first_name} {deal.contact?.last_name} • {formatCurrency(deal.value)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-slate-400">R</div>
                        <div className="text-slate-200">{deal.reach || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400">I</div>
                        <div className="text-slate-200">{deal.impact || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400">C</div>
                        <div className="text-slate-200">{deal.confidence || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-slate-400">E</div>
                        <div className="text-slate-200">{deal.effort || 0}</div>
                      </div>
                    </div>
                    
                    <RiceBadge
                      reach={deal.reach || 0}
                      impact={deal.impact || 0}
                      confidence={deal.confidence || 0}
                      effort={deal.effort || 1}
                    />
                    
                    <StatusBadge status={deal.stage} />
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Deal</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Stage</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">RICE</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-300">Probability</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal, index) => (
                  <motion.tr
                    key={deal.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-slate-200">{deal.title}</div>
                        {deal.expected_close && (
                          <div className="text-xs text-slate-400">
                            Due: {new Date(deal.expected_close).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {deal.contact ? `${deal.contact.first_name} ${deal.contact.last_name}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {formatCurrency(deal.value)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={deal.stage} />
                    </td>
                    <td className="py-3 px-4">
                      {deal.rice_score ? (
                        <Badge 
                          variant={deal.rice_score >= 80 ? 'success' : deal.rice_score >= 60 ? 'warning' : 'secondary'}
                          size="sm"
                        >
                          {Math.round(deal.rice_score)}
                        </Badge>
                      ) : (
                        <span className="text-slate-500 text-sm">Not scored</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <Progress value={deal.probability} color="indigo" size="sm" />
                        </div>
                        <span className="text-xs text-slate-400">{deal.probability}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditDeal(deal)}
                          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

{/*
      <DealModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        deal={selectedDeal}
        contacts={contacts}
      />
*/}
    </div>
  )
}