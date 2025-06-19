'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const supabase = createClientComponentClient()

  const validateForm = () => {
    const newErrors: {
      email?: string
      password?: string
      confirmPassword?: string
    } = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/auth/verify-email')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-slate-800">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/5 backdrop-blur-lg rounded-xl border border-gray-800">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
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
                autoComplete="new-password"
                className="appearance-none relative block w-full px-3 py-2 bg-gray-900/50 border border-gray-700 placeholder-gray-400 text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <div className="text-red-400 text-sm mt-1">{errors.password}</div>
              )}
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 bg-gray-900/50 border border-gray-700 placeholder-gray-400 text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && (
                <div className="text-red-400 text-sm mt-1">{errors.confirmPassword}</div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}