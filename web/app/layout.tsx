import './globals.css'
import { SessionProvider } from '@/app/components/SessionProvider'
import { ToastProvider } from '@/app/components/ToastProvider'

export const metadata = {
  title: 'FluxPay',
  description: 'FluxPay web (Next.js + Tailwind)'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <SessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
