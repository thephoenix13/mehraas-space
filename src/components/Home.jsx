import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const BEAUTIFUL_THOUGHTS = [
  "Sea otters hold hands while sleeping so they don't drift apart from each other.",
  "Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still perfectly edible.",
  "Trees in a forest share nutrients through underground fungal networks — they genuinely look out for each other.",
  "Otters have a favourite pebble they keep in a little pocket of skin under their arm their whole life.",
  "Baby elephants suck their trunks for comfort, just like human babies suck their thumbs.",
  "The smell of rain even has a beautiful name — petrichor — from the Greek words for stone and the fluid that flows through the veins of the gods.",
  "A group of flamingos is called a flamboyance.",
  "Cows have best friends and become stressed when separated from them.",
  "Squirrels accidentally plant thousands of trees every year by forgetting where they buried their acorns.",
  "Dolphins have individual names for each other and call out to specific friends.",
  "Sunflowers turn to face each other on cloudy days when there is no sun to follow.",
  "Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.",
  "A day on Venus is longer than a year on Venus.",
  "Butterflies taste with their feet.",
  "There are more possible chess games than atoms in the observable universe — the possibilities are genuinely infinite.",
  "The northern lights make a faint, whispering sound that people who live near them have reported hearing.",
  "Wombats produce cube-shaped droppings — the only animal in the world to do so.",
  "Bananas are technically berries, but strawberries are not.",
  "A group of cats is called a clowder, and a group of kittens is called a kindle.",
  "When you look at a star, you're seeing light that left it years, sometimes thousands of years, ago. You are literally looking into the past.",
  "Penguins propose to their mates with a pebble. If she accepts, they are partners for life.",
  "The heart of a blue whale beats so slowly you could count the seconds between each beat.",
  "Clouds aren't white — they reflect all wavelengths of sunlight equally, so they appear white to us.",
  "Octopuses have three hearts, blue blood, and can taste with their arms.",
  "In Switzerland, it is illegal to own just one guinea pig — they must have a companion so they are never lonely.",
  "The word 'kindness' shares its root with 'kin' — being kind was originally about treating others as family.",
  "Some trees can live for thousands of years. The oldest known living tree has been growing since before the Roman Empire.",
  "Humpback whales compose new songs every year, and the songs spread across oceans as whales teach each other.",
  "A small act of kindness releases oxytocin in both the giver and the receiver — and even in people who simply witness it.",
  "The Milky Way galaxy is so large that light travelling at 300,000 km per second would take 100,000 years to cross it.",
]

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
  const [thought, setThought] = useState('')

  useEffect(() => {
    const today = new Date().toDateString()
    const cachedDate = localStorage.getItem('daily_thought_date')
    const cachedIdx = localStorage.getItem('daily_thought_idx')
    if (cachedDate === today && cachedIdx !== null) {
      setThought(BEAUTIFUL_THOUGHTS[parseInt(cachedIdx)])
      return
    }
    const idx = Math.floor(Math.random() * BEAUTIFUL_THOUGHTS.length)
    setThought(BEAUTIFUL_THOUGHTS[idx])
    localStorage.setItem('daily_thought_idx', String(idx))
    localStorage.setItem('daily_thought_date', today)
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
            marginBottom: 10,
            letterSpacing: '0.02em',
          }}>
            {formatDate()}
          </p>

          <p style={{
            fontFamily: "'Playfair Display', serif",
            color: '#D4770A',
            fontSize: '0.82rem',
            fontStyle: 'italic',
            marginBottom: 24,
            lineHeight: 1.6,
          }}>
            Focus on Today. Focus on Now. Let the Future come to you. Good things are coming soon.
          </p>

          {/* Divider */}
          <div style={{ width: 48, height: 2, background: '#E8A020', margin: '0 auto 24px', borderRadius: 2 }} />

          {/* Beautiful thought card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '16px 24px',
              maxWidth: 480,
              margin: '0 auto',
              textAlign: 'left',
              boxShadow: '0 2px 16px rgba(180,120,60,0.08)',
              border: '1px solid #F0E6D0',
              borderLeftColor: '#D4770A',
              borderLeft: '4px solid #D4770A',
            }}
          >
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', fontWeight: 700, color: '#D4770A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              ✨ A little wonder for today
            </div>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              color: '#2C2C2C',
              fontSize: '0.92rem',
              lineHeight: 1.75,
              margin: 0,
            }}>{thought}</p>
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
