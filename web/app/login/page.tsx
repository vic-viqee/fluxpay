'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Navbar, Button, Input, Card, Alert } from '@/app/components'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    // TODO: Implement actual login logic
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col">
      <Navbar variant="public" />

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Welcome Back</h1>
              <p className="text-neutral-600">Log in to your FluxPay account</p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="danger">
                {error}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="text-sm text-primary-500 hover:text-primary-600 mt-2 block"
                >
                  Forgot password?
                </Link>
              </div>

              <Button variant="primary" size="lg" fullWidth type="submit">
                Log In
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-sm text-neutral-500">OR</span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-neutral-600 mb-3">Don't have an account?</p>
              <Link href="/signup" className="block">
                <Button variant="secondary" size="lg" fullWidth>
                  Create Account
                </Button>
              </Link>
            </div>
          </Card>

          {/* Footer Text */}
          <p className="text-center text-neutral-600 text-sm mt-6">
            By logging in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
