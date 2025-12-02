'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Navbar, Button, Input, Card, Alert } from '@/app/components'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    // TODO: Implement password reset logic
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col">
      <Navbar variant="public" />

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Reset Password</h1>
              <p className="text-neutral-600">Enter your email to receive reset instructions</p>
            </div>

            {!submitted ? (
              <>
                {/* Info Alert */}
                <Alert variant="info">
                  We'll send you an email with instructions to reset your password.
                </Alert>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <Button variant="primary" size="lg" fullWidth type="submit">
                    Send Reset Link
                  </Button>
                </form>
              </>
            ) : (
              <>
                {/* Success Alert */}
                <Alert variant="success" title="Check Your Email">
                  We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
                </Alert>

                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => setSubmitted(false)}
                >
                  Send Again
                </Button>
              </>
            )}

            {/* Back to Login */}
            <div className="text-center">
              <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                ← Back to Login
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
