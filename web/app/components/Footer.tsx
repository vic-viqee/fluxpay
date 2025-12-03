import Link from 'next/link'

interface FooterProps {
  variant?: 'light' | 'dark'
}

export const Footer: React.FC<FooterProps> = ({ variant = 'dark' }) => {
  const isDark = variant === 'dark'

  return (
    <footer style={{
      backgroundColor: isDark ? '#111827' : 'var(--color-surface-2)',
      color: isDark ? 'white' : 'var(--color-text-primary)',
      paddingTop: 'clamp(1.5rem, 5vw, 3rem)',
      paddingBottom: 'clamp(1.5rem, 5vw, 3rem)',
    }}>
      <div className="container-max">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--spacing-8)',
          marginBottom: 'var(--spacing-8)',
        }}>
          {/* Product Column */}
          <div>
            <h3 style={{
              fontWeight: '700',
              marginBottom: 'var(--spacing-4)',
              fontSize: 'var(--font-size-lg)',
              color: isDark ? 'white' : 'var(--color-text-primary)',
            }}>
              Product
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-2)',
            }}>
              <li>
                <Link href="/features" style={{
                  color: isDark ? '#9ca3af' : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 200ms ease-in-out',
                }} className="hover-lift" onMouseEnter={(e) => {
                  if (isDark) (e.currentTarget as HTMLElement).style.color = 'white'
                  else (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                }} onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isDark ? '#9ca3af' : 'var(--color-text-secondary)'
                }}>
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" style={{
                  color: isDark ? '#9ca3af' : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 200ms ease-in-out',
                }} className="hover-lift" onMouseEnter={(e) => {
                  if (isDark) (e.currentTarget as HTMLElement).style.color = 'white'
                  else (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                }} onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isDark ? '#9ca3af' : 'var(--color-text-secondary)'
                }}>
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/documentation" style={{
                  color: isDark ? '#9ca3af' : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 200ms ease-in-out',
                }} className="hover-lift" onMouseEnter={(e) => {
                  if (isDark) (e.currentTarget as HTMLElement).style.color = 'white'
                  else (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                }} onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isDark ? '#9ca3af' : 'var(--color-text-secondary)'
                }}>
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 style={{
              fontWeight: '700',
              marginBottom: 'var(--spacing-4)',
              fontSize: 'var(--font-size-lg)',
              color: isDark ? 'white' : 'var(--color-text-primary)',
            }}>
              Company
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-2)',
            }}>
              <li>
                <Link href="/about" style={{
                  color: isDark ? '#9ca3af' : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 200ms ease-in-out',
                }} className="hover-lift" onMouseEnter={(e) => {
                  if (isDark) (e.currentTarget as HTMLElement).style.color = 'white'
                  else (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                }} onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isDark ? '#9ca3af' : 'var(--color-text-secondary)'
                }}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" style={{
                  color: isDark ? '#9ca3af' : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 200ms ease-in-out',
                }} className="hover-lift" onMouseEnter={(e) => {
                  if (isDark) (e.currentTarget as HTMLElement).style.color = 'white'
                  else (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                }} onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isDark ? '#9ca3af' : 'var(--color-text-secondary)'
                }}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" style={{
                  color: isDark ? '#9ca3af' : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 200ms ease-in-out',
                }} className="hover-lift" onMouseEnter={(e) => {
                  if (isDark) (e.currentTarget as HTMLElement).style.color = 'white'
                  else (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                }} onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isDark ? '#9ca3af' : 'var(--color-text-secondary)'
                }}>
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 style={{
              fontWeight: '700',
              marginBottom: 'var(--spacing-4)',
              fontSize: 'var(--font-size-lg)',
              color: isDark ? 'white' : 'var(--color-text-primary)',
            }}>
              Resources
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-2)',
            }}>
              <li>
                <Link href="/documentation" style={{
                  color: isDark ? '#9ca3af' : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 200ms ease-in-out',
                }} className="hover-lift" onMouseEnter={(e) => {
                  if (isDark) (e.currentTarget as HTMLElement).style.color = 'white'
                  else (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                }} onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isDark ? '#9ca3af' : 'var(--color-text-secondary)'
                }}>
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/guides" style={{
                  color: isDark ? '#9ca3af' : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 200ms ease-in-out',
                }} className="hover-lift" onMouseEnter={(e) => {
                  if (isDark) (e.currentTarget as HTMLElement).style.color = 'white'
                  else (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                }} onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isDark ? '#9ca3af' : 'var(--color-text-secondary)'
                }}>
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/contact" style={{
                  color: isDark ? '#9ca3af' : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 200ms ease-in-out',
                }} className="hover-lift" onMouseEnter={(e) => {
                  if (isDark) (e.currentTarget as HTMLElement).style.color = 'white'
                  else (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                }} onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isDark ? '#9ca3af' : 'var(--color-text-secondary)'
                }}>
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 style={{
              fontWeight: '700',
              marginBottom: 'var(--spacing-4)',
              fontSize: 'var(--font-size-lg)',
              color: isDark ? 'white' : 'var(--color-text-primary)',
            }}>
              Legal
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-2)',
            }}>
              <li>
                <Link href="/privacy" style={{
                  color: isDark ? '#9ca3af' : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 200ms ease-in-out',
                }} className="hover-lift" onMouseEnter={(e) => {
                  if (isDark) (e.currentTarget as HTMLElement).style.color = 'white'
                  else (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                }} onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isDark ? '#9ca3af' : 'var(--color-text-secondary)'
                }}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" style={{
                  color: isDark ? '#9ca3af' : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 200ms ease-in-out',
                }} className="hover-lift" onMouseEnter={(e) => {
                  if (isDark) (e.currentTarget as HTMLElement).style.color = 'white'
                  else (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                }} onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isDark ? '#9ca3af' : 'var(--color-text-secondary)'
                }}>
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/security" style={{
                  color: isDark ? '#9ca3af' : 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 200ms ease-in-out',
                }} className="hover-lift" onMouseEnter={(e) => {
                  if (isDark) (e.currentTarget as HTMLElement).style.color = 'white'
                  else (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
                }} onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = isDark ? '#9ca3af' : 'var(--color-text-secondary)'
                }}>
                  Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider and Copyright */}
        <div style={{
          borderTop: `1px solid ${isDark ? '#374151' : 'var(--color-border)'}`,
          paddingTop: 'var(--spacing-8)',
          textAlign: 'center',
          color: isDark ? '#9ca3af' : 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
        }}>
          <p>&copy; 2025 FluxPay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
