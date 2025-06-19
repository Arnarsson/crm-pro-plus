'use client'

import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-slate-800">
      <div className="max-w-md w-full space-y-8 p-8 bg-white/5 backdrop-blur-lg rounded-xl border border-gray-800">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent">
            Check Your Email
          </h1>
          <p className="mt-4 text-center text-gray-400">
            We've sent you an email with a link to verify your account. Please check your inbox and click the link to continue.
          </p>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Return to login
          </Link>
        </div>
      </div>
    </div>
  )
} 