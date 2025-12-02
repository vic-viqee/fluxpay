'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Navbar, Button, Input, Card, Alert, Badge } from '@/app/components'

export default function SignUp() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: '',
    location: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName) newErrors.fullName = 'Full name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.businessName) newErrors.businessName = 'Business name is required'
    if (!formData.businessType) newErrors.businessType = 'Business type is required'
    if (!formData.location) newErrors.location = 'Location is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep2()) {
      // TODO: Implement signup logic
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex flex-col">
      <Navbar variant="public" />

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Create Account</h1>
              <div className="flex gap-2 mt-4">
                <Badge variant={step === 1 ? 'primary' : 'secondary'}>
                  Step 1: Personal
                </Badge>
                <Badge variant={step === 2 ? 'primary' : 'secondary'}>
                  Step 2: Business
                </Badge>
              </div>
            </div>

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <form className="space-y-6">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  error={errors.fullName}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+254712345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={errors.phone}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  error={errors.password}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  error={errors.confirmPassword}
                />

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  type="button"
                  onClick={handleNext}
                >
                  Continue
                </Button>
              </form>
            )}

            {/* Step 2: Business Info */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Business Name"
                  type="text"
                  placeholder="Your Business"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  error={errors.businessName}
                />

                <div>
                  <label className="label">Business Type</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) =>
                      setFormData({ ...formData, businessType: e.target.value })
                    }
                    className="input"
                  >
                    <option value="">Select a type</option>
                    <option value="retail">Retail</option>
                    <option value="services">Services</option>
                    <option value="education">Education</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.businessType && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.businessType}
                    </p>
                  )}
                </div>

                <Input
                  label="Location"
                  type="text"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  error={errors.location}
                />

                <Alert variant="info">
                  We'll automatically create a virtual till for your business. You can create more later.
                </Alert>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="lg"
                    fullWidth
                    type="button"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    type="submit"
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            )}

            {/* Login Link */}
            <div className="text-center">
              <p className="text-neutral-600 mb-2">Already have an account?</p>
              <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                Log in here
              </Link>
            </div>
          </Card>

          {/* Footer Text */}
          <p className="text-center text-neutral-600 text-sm mt-6">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
