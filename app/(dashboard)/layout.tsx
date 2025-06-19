'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { 
  Home, 
  Users, 
  TrendingUp, 
  Calendar, 
  LogOut,
  Menu,
  X,
  Target,
  CalendarDays,
  DollarSign,
  BarChart3,
  Settings,
  Search,
  Plus,
  User,
  Sparkles,
  Linkedin,
  Network
} from 'lucide-react'
import { EurekaChat } from '@/components/ai/EurekaChat'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, emoji: '🏠' },
  { name: 'Contacts', href: '/contacts', icon: Users, emoji: '👥' },
  { name: 'LinkedIn Import', href: '/import/linkedin', icon: Linkedin, emoji: '🔗' },
  { name: 'Network Map', href: '/relationships/network', icon: Network, emoji: '🕸️' },
  { name: 'Deals', href: '/deals', icon: TrendingUp, emoji: '💼' },
  { name: 'OKRs', href: '/okrs', icon: Target, emoji: '🎯' },
  { name: 'Planning', href: '/planning', icon: CalendarDays, emoji: '📅' },
  { name: 'Revenue', href: '/revenue', icon: DollarSign, emoji: '💰' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, emoji: '📊' },
  { name: 'Settings', href: '/settings', icon: Settings, emoji: '⚙️' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <motion.div
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <motion.div 
          className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm`}
          initial={{ opacity: 0 }}
          animate={{ opacity: sidebarOpen ? 1 : 0 }}
          onClick={() => setSidebarOpen(false)} 
        />
        
        <motion.div 
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-slate-800 border-r border-slate-700`}
          initial={{ x: '-100%' }}
          animate={{ x: sidebarOpen ? 0 : '-100%' }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full text-slate-300 hover:text-white focus-ring"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-aurora">EUREKA</h1>
                  <p className="text-xs text-gray-500">AI Business Assistant</p>
                </div>
              </div>
            </div>
            
            <nav className="mt-5 px-3 space-y-1">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="text-lg mr-3">{item.emoji}</span>
                    <span>{item.name}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 border-t border-slate-700 p-4">
            <button
              onClick={handleSignOut}
              className="w-full nav-item text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium">Sign out</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-slate-800 border-r border-slate-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-aurora">EUREKA</h1>
                  <p className="text-xs text-gray-500">AI Business Assistant</p>
                </div>
              </div>
            </div>
            
            <nav className="mt-5 flex-1 px-3 space-y-1">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                  >
                    <span className="text-lg mr-3">{item.emoji}</span>
                    <span>{item.name}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>
          
          <div className="flex-shrink-0 border-t border-slate-700 p-4">
            <button
              onClick={handleSignOut}
              className="w-full nav-item text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="text-sm font-medium">Sign out</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Premium Header */}
        <header className="sticky top-0 z-10 glass border-b border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 focus-ring"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Greeting */}
            <div className="hidden md:block">
              <motion.h1 
                className="text-2xl font-semibold text-slate-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                🎯 Good {getTimeOfDay()}, {user?.email?.split('@')[0]}!
              </motion.h1>
              <p className="text-slate-400 text-sm">Ready to crush your goals?</p>
            </div>
            
            {/* Header actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 focus-ring">
                <Search className="h-5 w-5" />
              </button>
              
              {/* Quick add */}
              <button className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 focus-ring">
                <Plus className="h-5 w-5" />
              </button>
              
              {/* User profile */}
              <button className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 focus-ring">
                <User className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      {/* EUREKA AI Assistant */}
      <EurekaChat />
    </div>
  )
}