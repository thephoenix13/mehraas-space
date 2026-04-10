import { NavLink } from 'react-router-dom'
import { useTheme } from '../ThemeContext'

const navItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/breathe', icon: '🌬️', label: 'Breathe' },
  { path: '/journal', icon: '📓', label: 'Journal' },
  { path: '/mood', icon: '🌤️', label: 'Mood' },
  { path: '/talk', icon: '💬', label: 'Talk' },
]

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--color-header-bg)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--color-card-border)',
      padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      zIndex: 100,
      boxShadow: '0 -2px 16px rgba(180,120,60,0.08)',
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        maxWidth: 560,
        margin: '0 auto',
        padding: '0 8px',
      }}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '4px 10px',
              borderRadius: 10,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              background: isActive ? 'rgba(192,57,43,0.08)' : 'transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>{item.icon}</span>
                <span style={{
                  fontSize: '0.65rem',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#C0392B' : 'var(--color-text-muted)',
                  letterSpacing: '0.02em'
                }}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '4px 10px', borderRadius: 10, background: 'transparent',
            border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>{isDark ? '☀️' : '🌙'}</span>
          <span style={{
            fontSize: '0.65rem', fontFamily: 'Inter, sans-serif', fontWeight: 500,
            color: 'var(--color-text-muted)', letterSpacing: '0.02em'
          }}>{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </nav>
  )
}
