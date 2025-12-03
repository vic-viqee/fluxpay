"use client"

import Link from 'next/link'
import React, { useState } from 'react'

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
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav style={{ backgroundColor: 'var(--color-surface-1)', borderBottom: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xs)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div className="container-max" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--spacing-4)', paddingBottom: 'var(--spacing-4)' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', textDecoration: 'none' }}>
          <div style={{ height: '2.25rem', width: '2.25rem', backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '0.875rem' }}>FP</span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>FluxPay</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {variant === 'public' ? (
            <>
              <ul className="flex items-center gap-8">
                <li>
                  <Link href="/features" className="text-neutral-700 hover:text-primary-600 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-neutral-700 hover:text-primary-600 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-neutral-700 hover:text-primary-600 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/testimonials" className="text-neutral-700 hover:text-primary-600 transition-colors">
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-neutral-700 hover:text-primary-600 transition-colors">
                    About
                  </Link>
                </li>
              </ul>

              <div className="flex items-center gap-4">
                <Link href="/login" className="text-neutral-700 hover:text-primary-600 transition-colors font-medium">
                  Log In
                </Link>
                <Link href="/signup" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <ul className="flex items-center gap-6">
                <li>
                  <Link href="/dashboard" className="text-neutral-700 hover:text-primary-600 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/payments" className="text-neutral-700 hover:text-primary-600 transition-colors">
                    Payments
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-neutral-700 hover:text-primary-600 transition-colors">
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
                    <Link href="/dashboard/settings" className="block px-4 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors">
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

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-3">
          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen((s) => !s)}
            className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
          >
            {/* hamburger icon */}
            <svg className="h-6 w-6 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100">
          <div className="container-max py-4">
            {variant === 'public' ? (
              <div className="flex flex-col gap-3">
                <Link href="/features" className="py-2 text-neutral-700 hover:text-primary-600">
                  Features
                </Link>
                <Link href="/pricing" className="py-2 text-neutral-700 hover:text-primary-600">
                  Pricing
                </Link>
                <Link href="/blog" className="py-2 text-neutral-700 hover:text-primary-600">
                  Blog
                </Link>
                <Link href="/testimonials" className="py-2 text-neutral-700 hover:text-primary-600">
                  Testimonials
                </Link>
                <Link href="/about" className="py-2 text-neutral-700 hover:text-primary-600">
                  About
                </Link>

                <div className="pt-2 flex flex-col gap-2">
                  <Link href="/login" className="py-2 text-neutral-700">
                    Log In
                  </Link>
                  <Link href="/signup" className="btn-primary w-full text-center">
                    Sign Up
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/dashboard" className="py-2 text-neutral-700 hover:text-primary-600">
                  Dashboard
                </Link>
                <Link href="/dashboard/payments" className="py-2 text-neutral-700 hover:text-primary-600">
                  Payments
                </Link>
                <Link href="/support" className="py-2 text-neutral-700 hover:text-primary-600">
                  Help
                </Link>

                <div className="pt-2">
                  <button onClick={onLogout} className="w-full text-left px-3 py-2 text-neutral-700 hover:bg-danger-50 hover:text-danger-700 rounded-md">
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
