'use client';
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Clock, AlertCircle, Target, Users, Zap, Brain } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  objective: string;
  stakeholder: string;
  deadline: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delegated';
  urgent: boolean;
  important: boolean;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  rice_score?: number;
  weekly_focus: boolean;
  notes?: string;
  linkedContacts?: Contact[];
}

function calculateRICEScore(task: Task): number {
  return (task.reach * task.impact * task.confidence) / task.effort;
}

function getUrgencyColor(task: Task): string {
  if (task.urgent && task.important) return '#EF4444'; // Red - Do First
  if (!task.urgent && task.important) return '#10B981'; // Green - Schedule
  if (task.urgent && !task.important) return '#F59E0B'; // Yellow - Delegate
  return '#6B7280'; // Gray - Delete
}

function getStatusIcon(status: Task['status']) {
  switch (status) {
    case 'Not Started': return Clock;
    case 'In Progress': return Circle;
    case 'Completed': return CheckCircle;
    case 'Delegated': return Users;
    default: return Circle;
  }
}

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

function TaskList({ tasks, onTaskClick }: TaskListProps) {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => onTaskClick(task)}
          className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 cursor-pointer border border-slate-700 hover:border-indigo-500/50 transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">{task.title}</h3>
              {task.description && (
                <p className="text-gray-400 text-sm mb-2">{task.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-500/20 text-indigo-300">
                  <Target className="w-3 h-3 mr-1" />
                  {task.objective.split('–')[0].trim()}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300">
                  <Users className="w-3 h-3 mr-1" />
                  {task.stakeholder}
                </span>
                {task.weekly_focus && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300">
                    <Zap className="w-3 h-3 mr-1" />
                    Weekly Focus
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  RICE: {calculateRICEScore(task).toFixed(1)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Due: {new Date(task.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={task.status} />
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getUrgencyColor(task) }} 
                title={`${task.urgent ? 'Urgent' : 'Not Urgent'}, ${task.important ? 'Important' : 'Not Important'}`}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface StatusBadgeProps {
  status: Task['status'];
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    'Not Started': { color: '#F59E0B', text: 'Not Started' },
    'In Progress': { color: '#10B981', text: 'In Progress' },
    'Completed': { color: '#6366F1', text: 'Completed' },
    'Delegated': { color: '#A855F7', text: 'Delegated' },
  };

  const config = statusConfig[status];
  const Icon = getStatusIcon(status);

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
    >
      <Icon size={12} />
      {config.text}
    </span>
  );
}

interface VisualizationProps {
  tasks: Task[];
  selectedTask: Task | null;
}

function Visualization({ tasks, selectedTask }: VisualizationProps) {
  return (
    <Canvas camera={{ position: [0, 0, 18], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} />
      {tasks.map((task, i) => {
        const angle = (i / tasks.length) * Math.PI * 2;
        const radius = 7;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const isSelected = selectedTask?.id === task.id;
        const riceScore = calculateRICEScore(task);
        
        return (
          <group key={task.id} position={[x, y, 0]}>
            <Sphere args={[1 + (riceScore / 50) * 0.5, 32, 32]}>
              <meshStandardMaterial 
                color={getUrgencyColor(task)} 
                emissive={getUrgencyColor(task)} 
                emissiveIntensity={isSelected ? 0.5 : 0.2} 
              />
            </Sphere>
            <Text
              position={[0, 0, 1.6]}
              fontSize={0.5}
              color="#fff"
              anchorX="center"
              anchorY="middle"
              outlineColor="#000"
              outlineWidth={0.02}
            >
              {task.title}
            </Text>
            <Text
              position={[0, -0.8, 1.6]}
              fontSize={0.3}
              color="#aaa"
              anchorX="center"
              anchorY="middle"
              outlineColor="#000"
              outlineWidth={0.01}
            >
              RICE: {riceScore.toFixed(1)}
            </Text>
          </group>
        );
      })}
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </Canvas>
  );
}

interface QuantumTaskBoardProps {
  initialTasks?: Task[];
}

export function QuantumTaskBoard({ initialTasks }: QuantumTaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState<'list' | '3d'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialTasks) {
      setTasks(initialTasks);
      setLoading(false);
    } else {
      fetchTasks();
    }
  }, [initialTasks]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-16rem)] rounded-2xl glass-premium relative overflow-hidden flex items-center justify-center">
        <motion.div
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-16rem)] rounded-2xl glass-premium relative overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'list'
              ? 'bg-indigo-500 text-white'
              : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setView('3d')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === '3d'
              ? 'bg-indigo-500 text-white'
              : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
          }`}
        >
          3D View
        </button>
      </div>
      
      <div className="w-full h-full">
        {view === 'list' ? (
          <div className="p-6 overflow-y-auto h-full">
            <TaskList tasks={tasks} onTaskClick={setSelectedTask} />
          </div>
        ) : (
          <Visualization tasks={tasks} selectedTask={selectedTask} />
        )}
      </div>
    </div>
  );
}

export default QuantumTaskBoard; 