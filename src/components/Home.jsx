import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { callClaude } from '../api'

const miniApps = [
  { path: '/breathe', icon: '🌬️', name: 'Breathe', desc: 'Calm your breath' },
  { path: '/journal', icon: '📓', name: 'Journal', desc: 'Write it out' },
  { path: '/mood', icon: '🌤️', name: 'Mood', desc: 'Check in with yourself' },
  { path: '/gratitude', icon: '🙏', name: 'Gratitude', desc: 'Fill your jar' },
  { path: '/worry', icon: '💭', name: 'Worry Sorter', desc: 'Untangle your thoughts' },
  { path: '/letters', icon: '💌', name: 'Letters', desc: 'Write to future you' },
  { path: '/affirmations', icon: '✨', name: 'Affirmations', desc: 'Words of kindness' },
  { path: '/calm', icon: '🎵', name: 'Calm Corner', desc: 'Soothing sounds' },
  { path: '/talk', icon: '💬', name: 'Talk to Me', desc: 'A gentle companion' },
  { path: '/cbt', icon: '🧠', name: 'Thought Diary', desc: 'Reframe heavy thoughts' },
  { path: '/sleep', icon: '🌙', name: 'Sleep Wind-Down', desc: 'Ease into rest' },
  { path: '/wins', icon: '🏆', name: 'Small Wins', desc: 'Celebrate yourself' },
  { path: '/meditation', icon: '🧘', name: 'Meditation', desc: 'Guided by your mood' },
  { path: '/grounding', icon: '🖐️', name: '5-4-3-2-1', desc: 'Ground yourself now' },
  { path: '/selfcare', icon: '📋', name: 'Self Care', desc: 'Gentle daily nudges' },
  { path: '/coping', icon: '💪', name: 'Coping Cards', desc: 'Your personal toolkit' },
  { path: '/memories', icon: '📸', name: 'Memory Jar', desc: 'Keep happy moments' },
  { path: '/garden', icon: '🌱', name: 'Growth Garden', desc: 'Watch yourself bloom' },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return { text: 'Good morning My Beloved', emoji: '🌸' }
  if (hour < 17) return { text: 'Good afternoon My Beloved', emoji: '☀️' }
  if (hour < 21) return { text: 'Good evening My Beloved', emoji: '🌙' }
  return { text: 'Good night My Beloved', emoji: '⭐' }
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

export default function Home() {
  const navigate = useNavigate()
  const greeting = getGreeting()
  const [quote, setQuote] = useState('')
  const [quoteLoading, setQuoteLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toDateString()
    const cached = localStorage.getItem('daily_quote')
    const cachedDate = localStorage.getItem('daily_quote_date')
    if (cached && cachedDate === today) {
      setQuote(cached)
      setQuoteLoading(false)
      return
    }
    callClaude(
      'Give me one short, warm, gentle motivational quote (1-2 sentences max) for someone having a hard day. Just the quote, no attribution, no quotation marks.',
      'You are a gentle, warm companion. Give only a short quote, nothing else.'
    ).then(text => {
      setQuote(text.trim())
      localStorage.setItem('daily_quote', text.trim())
      localStorage.setItem('daily_quote_date', today)
      setQuoteLoading(false)
    }).catch(() => {
      setQuote('You are doing better than you think. One breath at a time.')
      setQuoteLoading(false)
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: '#FAF3E0' }}>
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(160deg, #F5EDD6 0%, #FAF3E0 100%)',
          borderBottom: '1px solid #F0E6D0',
          padding: '52px 24px 44px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle warm blobs */}
        <div style={{
          position: 'absolute', top: -50, right: -50, width: 220, height: 220,
          borderRadius: '50%', background: 'rgba(212,119,10,0.07)', zIndex: 0
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -30, width: 180, height: 180,
          borderRadius: '50%', background: 'rgba(192,57,43,0.05)', zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: '2.8rem', marginBottom: 16 }}
          >
            {greeting.emoji}
          </motion.div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
            fontWeight: 700,
            color: '#C0392B',
            marginBottom: 8,
            letterSpacing: '-0.01em',
          }}>
            {greeting.text}
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: '#7A6A5A',
            fontSize: '0.88rem',
            marginBottom: 24,
            letterSpacing: '0.02em',
          }}>
            {formatDate()}
          </p>

          {/* Divider */}
          <div style={{ width: 48, height: 2, background: '#E8A020', margin: '0 auto 24px', borderRadius: 2 }} />

          {/* Quote card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              background: '#fff',
              borderLeft: '4px solid #D4770A',
              borderRadius: 12,
              padding: '16px 24px',
              maxWidth: 480,
              margin: '0 auto',
              textAlign: 'left',
              boxShadow: '0 2px 16px rgba(180,120,60,0.08)',
              border: '1px solid #F0E6D0',
              borderLeftColor: '#D4770A',
            }}
          >
            {quoteLoading ? (
              <span style={{ color: '#7A6A5A', fontStyle: 'italic', fontSize: '0.9rem' }}>
                Finding something kind for you…
              </span>
            ) : (
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontStyle: 'italic',
                color: '#2C2C2C',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                margin: 0,
              }}>{quote}</p>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Mini Apps Grid */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#D4770A',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: 20,
          paddingLeft: 4,
        }}>
          Your Space
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
          gap: 12,
        }}>
          {miniApps.map((app, i) => (
            <motion.button
              key={app.path}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.35 }}
              whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(180,120,60,0.14)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(app.path)}
              style={{
                background: '#fff',
                border: '1px solid #F0E6D0',
                borderRadius: 16,
                padding: '20px 14px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: '0 2px 12px rgba(180,120,60,0.07)',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Amber top accent line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, #D4770A, #E8A020)',
                borderRadius: '16px 16px 0 0',
              }} />

              {/* Icon circle */}
              <div style={{
                width: 50, height: 50, borderRadius: '50%',
                background: '#FAF3E0',
                border: '1.5px solid #F0E6D0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.45rem', margin: '0 auto 12px',
              }}>
                {app.icon}
              </div>

              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                color: '#C0392B',
                fontSize: '0.85rem',
                marginBottom: 4,
              }}>
                {app.name}
              </div>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                color: '#7A6A5A',
                fontSize: '0.72rem',
                lineHeight: 1.4,
              }}>
                {app.desc}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
