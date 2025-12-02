'use client'

import { useState } from 'react'
import {
  Button,
  Input,
  Card,
  Alert,
  Badge,
  LoadingSpinner,
  Avatar,
  Modal,
  Navbar,
} from '@/app/components'

export default function ComponentsShowcase() {
  const [modalOpen, setModalOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar
        variant="public"
      />

      <div className="container-max py-12">
        <h1 className="text-4xl font-bold mb-12 text-neutral-900">Component Library</h1>

        {/* Buttons Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Buttons</h2>
          <Card>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="tertiary">Tertiary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" isLoading>
                Loading
              </Button>
              <Button variant="primary" size="sm">
                Small
              </Button>
              <Button variant="primary" size="lg">
                Large
              </Button>
              <Button fullWidth>Full Width</Button>
            </div>
          </Card>
        </section>

        {/* Inputs Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Form Inputs</h2>
          <Card className="space-y-4">
            <Input label="Regular Input" placeholder="Enter text" />
            <Input label="Email Input" type="email" placeholder="your@email.com" />
            <Input label="Password Input" type="password" placeholder="••••••••" />
            <Input label="With Error" error="This field is required" />
            <Input label="With Help Text" helpText="This is helpful information" />
          </Card>
        </section>

        {/* Alerts Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Alerts</h2>
          <div className="space-y-4">
            <Alert variant="success" title="Success!">
              Your changes have been saved successfully.
            </Alert>
            <Alert variant="danger" title="Error">
              Something went wrong. Please try again.
            </Alert>
            <Alert variant="warning" title="Warning">
              This action cannot be undone.
            </Alert>
            <Alert variant="info" title="Info">
              Here's some useful information for you.
            </Alert>
          </div>
        </section>

        {/* Badges Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Badges</h2>
          <Card className="flex flex-wrap gap-3">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="primary" size="sm">
              Small
            </Badge>
          </Card>
        </section>

        {/* Avatars Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Avatars</h2>
          <Card className="flex gap-8">
            <Avatar name="John Doe" size="sm" />
            <Avatar name="Jane Smith" size="md" status="online" />
            <Avatar name="Bob Wilson" size="lg" status="away" />
          </Card>
        </section>

        {/* Loading Spinner Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Loading Spinner</h2>
          <Card className="flex gap-8">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" text="Loading..." />
            <LoadingSpinner size="lg" color="secondary" />
          </Card>
        </section>

        {/* Modal Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Modal</h2>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Modal Example"
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button>Confirm</Button>
              </>
            }
          >
            <p>This is modal content. It demonstrates how the modal component works.</p>
          </Modal>
        </section>

        {/* Cards Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Cards</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card hover>
              <h3 className="font-bold mb-2">Card Title</h3>
              <p className="text-neutral-600">This is a basic card component.</p>
            </Card>
            <Card hover padding="lg">
              <h3 className="font-bold mb-2">Large Padding</h3>
              <p className="text-neutral-600">This card has more padding.</p>
            </Card>
            <Card hover={false} border={false}>
              <h3 className="font-bold mb-2">No Border</h3>
              <p className="text-neutral-600">This card has no border.</p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
