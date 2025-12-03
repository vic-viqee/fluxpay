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
        <div style={{ display: 'none' }} className="md:flex items-center gap-8" id="desktop-nav">
          {variant === 'public' ? (
            <>
              <ul style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)', listStyle: 'none', padding: 0, margin: 0 }}>
                <li>
                  <Link href="/features" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/blog" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/testimonials" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link href="/about" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                    About
                  </Link>
                </li>
              </ul>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                <Link href="/login" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: '500', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                  Log In
                </Link>
                <Link href="/signup" className="btn-primary" style={{ fontSize: 'var(--font-size-sm)', textDecoration: 'none' }}>
                  Sign Up
                </Link>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-6)' }}>
              <ul style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-6)', listStyle: 'none', padding: 0, margin: 0 }}>
                <li>
                  <Link href="/dashboard" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/payments" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                    Payments
                  </Link>
                </li>
                <li>
                  <Link href="/support" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                    Help
                  </Link>
                </li>
              </ul>

              <div style={{ position: 'relative' }}>
                <button
                  onClick={onUserMenuToggle}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', paddingLeft: 'var(--spacing-3)', paddingRight: 'var(--spacing-3)', paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', borderRadius: 'var(--radius-lg)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', transition: 'background-color 200ms ease-in-out' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-2)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                >
                  <div style={{ height: '2rem', width: '2rem', backgroundColor: 'var(--color-primary)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 'var(--font-size-sm)', fontWeight: '700' }}>
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-secondary)' }}>{userName || 'User'}</span>
                </button>

                {userMenuOpen && (
                  <div style={{ position: 'absolute', right: 0, marginTop: 'var(--spacing-2)', width: '12rem', backgroundColor: 'var(--color-surface-1)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)', zIndex: 50 }}>
                    <Link href="/dashboard/settings" style={{ display: 'block', padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'background-color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-2)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}>
                      Settings
                    </Link>
                    <button
                      onClick={onLogout}
                      style={{ width: '100%', textAlign: 'left', padding: 'var(--spacing-4)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderTop: '1px solid var(--color-border)', borderBottom: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', transition: 'all 200ms ease-in-out', borderRadius: 0 }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-danger-light)'
                        (e.currentTarget as HTMLElement).style.color = 'var(--color-danger)'
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                        (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'
                      }}
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'flex',
            padding: 'var(--spacing-2)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 200ms ease-in-out',
          }}
          className="md:hidden"
          onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-2)'}
          onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
        >
          <svg style={{ height: '1.5rem', width: '1.5rem', color: 'var(--color-text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div style={{ backgroundColor: 'var(--color-surface-1)', borderTop: '1px solid var(--color-border)' }} className="md:hidden animate-slide-down">
          <div className="container-max" style={{ paddingTop: 'var(--spacing-4)', paddingBottom: 'var(--spacing-4)' }}>
            {variant === 'public' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                <Link href="/features" style={{ paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                  Features
                </Link>
                <Link href="/pricing" style={{ paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                  Pricing
                </Link>
                <Link href="/blog" style={{ paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                  Blog
                </Link>
                <Link href="/testimonials" style={{ paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                  Testimonials
                </Link>
                <Link href="/about" style={{ paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                  About
                </Link>
                <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                  <Link href="/login" style={{ paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                    Log In
                  </Link>
                  <Link href="/signup" className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
                    Sign Up
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                <Link href="/dashboard" style={{ paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                  Dashboard
                </Link>
                <Link href="/dashboard/payments" style={{ paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                  Payments
                </Link>
                <Link href="/support" style={{ paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                  Help
                </Link>
                <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)' }}>
                  <Link href="/dashboard/settings" style={{ paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'color 200ms ease-in-out', display: 'block' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}>
                    Settings
                  </Link>
                  <button
                    onClick={onLogout}
                    style={{ paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)', color: 'var(--color-text-secondary)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 200ms ease-in-out', width: '100%', textAlign: 'left', fontSize: 'var(--font-size-base)' }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-danger)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'}
                  >
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
