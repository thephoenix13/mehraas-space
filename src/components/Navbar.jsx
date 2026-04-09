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
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(201,184,232,0.3)',
      padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      zIndex: 100,
      boxShadow: '0 -4px 20px rgba(180,150,200,0.1)'
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
              borderRadius: 12,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              background: isActive ? 'rgba(201,184,232,0.2)' : 'transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{item.icon}</span>
                <span style={{
                  fontSize: '0.65rem',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#7c6ab0' : '#a89ebb',
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
