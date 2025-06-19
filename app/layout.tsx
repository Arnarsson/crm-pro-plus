import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'EUREKA CRM',
  description: 'Next-generation CRM with AI-powered insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full bg-gray-900">
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  )
}
