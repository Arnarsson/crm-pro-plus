import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="max-w-lg w-full text-center px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">CRM Pro+</h1>
          <p className="text-slate-300 text-lg mb-2">Premium Business Management Platform</p>
          <p className="text-slate-400">OKR tracking • Revenue management • Daily planning</p>
        </div>
        
        <div className="card space-y-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-50">Get Started</h2>
          
          <div className="space-y-4">
            <Link 
              href="/auth/signup"
              className="block w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Create Account
            </Link>
            
            <Link 
              href="/auth/login"
              className="block w-full bg-slate-700 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Built with Next.js 15, TypeScript, Tailwind CSS & Supabase
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
          <div className="space-y-2">
            <p className="flex items-center justify-center md:justify-start">
              <span className="mr-2">🎯</span> OKR Management System
            </p>
            <p className="flex items-center justify-center md:justify-start">
              <span className="mr-2">💰</span> Revenue Tracking & Forecasting
            </p>
          </div>
          <div className="space-y-2">
            <p className="flex items-center justify-center md:justify-start">
              <span className="mr-2">📅</span> Daily Planning & Tasks
            </p>
            <p className="flex items-center justify-center md:justify-start">
              <span className="mr-2">💼</span> RICE Deal Prioritization
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-xs text-slate-500">
          <p>Premium dark mode • Glass morphism • Smooth animations</p>
        </div>
      </div>
    </div>
  )
}
