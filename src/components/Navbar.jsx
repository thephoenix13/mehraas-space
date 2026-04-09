import { NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/breathe', icon: '🌬️', label: 'Breathe' },
  { path: '/journal', icon: '📓', label: 'Journal' },
  { path: '/mood', icon: '🌤️', label: 'Mood' },
  { path: '/talk', icon: '💬', label: 'Talk' },
]

export default function Navbar() {
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(250,243,224,0.96)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid #F0E6D0',
      padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      zIndex: 100,
      boxShadow: '0 -2px 16px rgba(180,120,60,0.08)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        maxWidth: 500,
        margin: '0 auto'
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
              padding: '4px 12px',
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
                  color: isActive ? '#C0392B' : '#7A6A5A',
                  letterSpacing: '0.02em'
                }}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
