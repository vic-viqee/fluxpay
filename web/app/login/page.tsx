'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar, Button, Input, Card, Alert } from '@/app/components'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error || 'Login failed. Please try again.')
      } else if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-1)', display: 'flex', flexDirection: 'column' }} className="animate-page-in">
      <Navbar variant="public" />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'var(--spacing-12)', paddingBottom: 'var(--spacing-12)', paddingLeft: 'var(--spacing-4)', paddingRight: 'var(--spacing-4)' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Card padding="lg" className="animate-scale-in">
            {/* Header */}
            <div style={{ marginBottom: 'var(--spacing-8)' }}>
              <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>Welcome Back</h1>
              <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>Log in to your FluxPay account</p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="danger" style={{ marginBottom: 'var(--spacing-6)' }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Link
                  href="/forgot-password"
                  style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', textDecoration: 'none', marginTop: 'var(--spacing-2)', display: 'block' }}
                  className="hover-lift"
                >
                  Forgot password?
                </Link>
              </div>

              <Button variant="primary" size="lg" fullWidth type="submit" disabled={loading} className="hover-lift">
                {loading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', margin: 'var(--spacing-6) 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>OR</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            </div>

            {/* Sign Up Link */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-3)', fontSize: 'var(--font-size-base)' }}>Don't have an account?</p>
              <Link href="/signup" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="lg" fullWidth className="hover-lift">
                  Create Account
                </Button>
              </Link>
            </div>
          </Card>

          {/* Footer Text */}
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-6)' }}>
            By logging in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
