'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{email?: string, password?: string}>({})
  const supabase = createClientComponentClient()

  const validateForm = () => {
    const newErrors: {email?: string, password?: string} = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.refresh() // Refresh to update session
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-slate-800">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/5 backdrop-blur-lg rounded-xl border border-gray-800">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
            EUREKA CRM
          </h1>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <Link href="/auth/signup" className="font-medium text-indigo-400 hover:text-indigo-300">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 bg-gray-900/50 border border-gray-700 placeholder-gray-400 text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <div className="text-red-400 text-sm mt-1">{errors.email}</div>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 bg-gray-900/50 border border-gray-700 placeholder-gray-400 text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <div className="text-red-400 text-sm mt-1">{errors.password}</div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}