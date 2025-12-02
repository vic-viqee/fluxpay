import Link from 'next/link'
import React from 'react'

interface NavbarProps {
  variant?: 'public' | 'authenticated'
  userMenuOpen?: boolean
  onUserMenuToggle?: () => void
  userName?: string
  onLogout?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  variant = 'public',
  userMenuOpen = false,
  onUserMenuToggle,
  userName,
  onLogout,
}) => {
  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="container-max flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FP</span>
          </div>
          <span className="text-xl font-bold text-primary-500">FluxPay</span>
        </Link>

        {/* Public Navbar */}
        {variant === 'public' && (
          <>
            <ul className="hidden md:flex items-center gap-8">
              <li>
                <Link
                  href="/features"
                  className="text-neutral-700 hover:text-primary-500 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-neutral-700 hover:text-primary-500 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-neutral-700 hover:text-primary-500 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/testimonials"
                  className="text-neutral-700 hover:text-primary-500 transition-colors"
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-neutral-700 hover:text-primary-500 transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>

            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-neutral-700 hover:text-primary-500 transition-colors font-medium"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="btn-primary text-sm"
              >
                Sign Up
              </Link>
            </div>
          </>
        )}

        {/* Authenticated Navbar */}
        {variant === 'authenticated' && (
          <div className="flex items-center gap-6">
            <ul className="hidden md:flex items-center gap-6">
              <li>
                <Link
                  href="/dashboard"
                  className="text-neutral-700 hover:text-primary-500 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/payments"
                  className="text-neutral-700 hover:text-primary-500 transition-colors"
                >
                  Payments
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-neutral-700 hover:text-primary-500 transition-colors"
                >
                  Help
                </Link>
              </li>
            </ul>

            <div className="relative">
              <button
                onClick={onUserMenuToggle}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-medium text-neutral-700">{userName || 'User'}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                  <Link
                    href="/dashboard/settings"
                    className="block px-4 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-neutral-700 hover:bg-danger-50 hover:text-danger-700 transition-colors border-t border-neutral-200"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
