export default function TestPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">CRM Pro Plus - Test Page</h1>
      <p className="text-slate-300">If you can see this, the app is working!</p>
      <div className="mt-8">
        <a href="/dashboard" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}
