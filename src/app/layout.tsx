import './globals.css'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/contexts/ToastContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Creditcoin Playground',
  description: 'Smart Contract Playground for Creditcoin Testnet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <div className="min-h-screen relative">
            {/* Animated Background Particles */}
            <div className="bg-particles">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}