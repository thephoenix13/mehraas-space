import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { callClaude } from '../api'

const miniApps = [
  { path: '/breathe', icon: '🌬️', name: 'Breathe', desc: 'Calm your breath', color: '#e8dffa' },
  { path: '/journal', icon: '📓', name: 'Journal', desc: 'Write it out', color: '#fce4ec' },
  { path: '/mood', icon: '🌤️', name: 'Mood', desc: 'Check in with yourself', color: '#d4e8d4' },
  { path: '/gratitude', icon: '🙏', name: 'Gratitude', desc: 'Fill your jar', color: '#fff0e6' },
  { path: '/worry', icon: '💭', name: 'Worry Sorter', desc: 'Untangle your thoughts', color: '#e8dffa' },
  { path: '/letters', icon: '💌', name: 'Letters', desc: 'Write to future you', color: '#fce4ec' },
  { path: '/affirmations', icon: '✨', name: 'Affirmations', desc: 'Words of kindness', color: '#fffde7' },
  { path: '/calm', icon: '🎵', name: 'Calm Corner', desc: 'Soothing sounds', color: '#d4e8d4' },
  { path: '/talk', icon: '💬', name: 'Talk to Me', desc: 'A gentle companion', color: '#f5f0ff' },
  { path: '/cbt', icon: '🧠', name: 'Thought Diary', desc: 'Reframe heavy thoughts', color: '#e8dffa' },
  { path: '/sleep', icon: '🌙', name: 'Sleep Wind-Down', desc: 'Ease into rest', color: '#c5cae9' },
  { path: '/wins', icon: '🏆', name: 'Small Wins', desc: 'Celebrate yourself', color: '#fffde7' },
  { path: '/meditation', icon: '🧘', name: 'Meditation', desc: 'Guided by your mood', color: '#d4e8d4' },
  { path: '/grounding', icon: '🖐️', name: '5-4-3-2-1', desc: 'Ground yourself now', color: '#e8dffa' },
  { path: '/selfcare', icon: '📋', name: 'Self Care', desc: 'Gentle daily nudges', color: '#d4e8d4' },
  { path: '/coping', icon: '💪', name: 'Coping Cards', desc: 'Your personal toolkit', color: '#fce4ec' },
  { path: '/memories', icon: '📸', name: 'Memory Jar', desc: 'Keep happy moments', color: '#fce4ec' },
  { path: '/garden', icon: '🌱', name: 'Growth Garden', desc: 'Watch yourself bloom', color: '#c8e6c9' },
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
      setQuote('You are doing better than you think. One breath at a time. 🌸')
      setQuoteLoading(false)
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80 }}>
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          background: 'linear-gradient(160deg, #e8dffa 0%, #fce4ec 60%, #d4e8d4 100%)',
          padding: '48px 24px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 200, height: 200,
          borderRadius: '50%', background: 'rgba(255,255,255,0.3)', zIndex: 0
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -30, width: 160, height: 160,
          borderRadius: '50%', background: 'rgba(255,255,255,0.2)', zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: '3rem', marginBottom: 12 }}
          >
            {greeting.emoji}
          </motion.div>
          <h1 style={{
            fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
            fontWeight: 800,
            color: '#4a4060',
            marginBottom: 6
          }}>
            {greeting.text}
          </h1>
          <p style={{ color: '#7a6e8a', fontSize: '0.9rem', marginBottom: 20 }}>
            {formatDate()}
          </p>

          {/* Quote box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(8px)',
              borderRadius: 16,
              padding: '16px 24px',
              maxWidth: 480,
              margin: '0 auto',
              fontStyle: 'italic',
              color: '#5a5070',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              boxShadow: '0 4px 16px rgba(180,150,200,0.15)'
            }}
          >
            {quoteLoading ? (
              <span style={{ color: '#b0a0c8' }}>Finding something kind for you...</span>
            ) : quote}
          </motion.div>
        </div>
      </motion.div>

      {/* Mini Apps Grid */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 16px' }}>
        <h2 style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#a89ebb',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 20,
          paddingLeft: 4
        }}>
          Your Space
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 14
        }}>
          {miniApps.map((app, i) => (
            <motion.button
              key={app.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(180,150,200,0.22)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(app.path)}
              style={{
                background: 'white',
                border: 'none',
                borderRadius: 20,
                padding: '20px 16px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(180,150,200,0.12)',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Card color accent */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                background: app.color,
                borderRadius: '20px 20px 0 0'
              }} />
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: app.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', margin: '0 auto 12px'
              }}>
                {app.icon}
              </div>
              <div style={{ fontWeight: 700, color: '#4a4060', fontSize: '0.9rem', marginBottom: 4 }}>
                {app.name}
              </div>
              <div style={{ color: '#a89ebb', fontSize: '0.75rem', lineHeight: 1.4 }}>
                {app.desc}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
