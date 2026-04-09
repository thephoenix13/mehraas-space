import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { callClaude } from '../api'

const MOODS = [
  { score: 1, emoji: '😔', label: 'Struggling', color: '#c9b8e8' },
  { score: 2, emoji: '😟', label: 'Low', color: '#f5c6d0' },
  { score: 3, emoji: '😌', label: 'Okay', color: '#ffe0b2' },
  { score: 4, emoji: '🙂', label: 'Good', color: '#b2c9b2' },
  { score: 5, emoji: '😊', label: 'Great', color: '#81c784' },
]

const todayKey = () => new Date().toISOString().split('T')[0]
const shortDate = d => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export default function MoodTracker() {
  const navigate = useNavigate()
  const [moods, setMoods] = useState(() => JSON.parse(localStorage.getItem('mood_entries') || '[]'))
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [view, setView] = useState('checkin') // checkin | graph

  const todayEntry = moods.find(m => m.date === todayKey())

  const handleSave = async () => {
    if (!selected) return
    setAiLoading(true)
    const mood = MOODS.find(m => m.score === selected)
    let response = ''
    try {
      response = await callClaude(
        `The person is feeling ${mood.label} today (score ${mood.score}/5). ${note ? `They also wrote: "${note}"` : ''} Please respond with a warm, validating, and kind message in 2-3 sentences.`
      )
    } catch {
      response = 'Your feelings are valid, whatever they may be. Thank you for checking in with yourself today. 💜'
    }
    setAiResponse(response)
    setAiLoading(false)

    const entry = { date: todayKey(), score: selected, label: mood.label, emoji: mood.emoji, note, response }
    const filtered = moods.filter(m => m.date !== todayKey())
    const updated = [entry, ...filtered].sort((a, b) => b.date.localeCompare(a.date))
    setMoods(updated)
    localStorage.setItem('mood_entries', JSON.stringify(updated))
    setSaved(true)
  }

  const chartData = [...moods].reverse().slice(-7).map(m => ({
    date: shortDate(m.date), score: m.score, emoji: m.emoji
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const d = payload[0].payload
      return (
        <div style={{ background: 'white', borderRadius: 12, padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '1.2rem' }}>{d.emoji}</div>
          <div style={{ fontSize: '0.8rem', color: '#7a6e8a' }}>{d.date}</div>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'linear-gradient(160deg, #d4e8d4, #f5f0ff)' }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/')} style={{
          background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 12,
          padding: '8px 16px', cursor: 'pointer', color: '#7a6e8a',
          fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
        }}>← Home</button>
        <div style={{ display: 'flex', gap: 8 }}>
          {['checkin', 'graph'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 14px', borderRadius: 50, border: 'none', cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.8rem',
              background: view === v ? 'rgba(178,201,178,0.8)' : 'rgba(255,255,255,0.6)',
              color: view === v ? 'white' : '#7a6e8a'
            }}>{v === 'checkin' ? 'Check In' : '📊 History'}</button>
          ))}
        </div>
      </div>

      <div className="page-container">
        <AnimatePresence mode="wait">
          {view === 'checkin' && (
            <motion.div key="checkin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>🌤️ How are you feeling?</h1>
                <p>There's no wrong answer here</p>
              </div>

              {todayEntry && !saved ? (
                <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>{todayEntry.emoji}</div>
                  <p style={{ fontWeight: 600, color: '#4a4060' }}>You checked in today: {todayEntry.label}</p>
                  {todayEntry.response && (
                    <p style={{ color: '#7a6e8a', marginTop: 12, fontStyle: 'italic', fontSize: '0.9rem' }}>"{todayEntry.response}"</p>
                  )}
                  <button onClick={() => setSaved(false)} style={{
                    marginTop: 12, background: 'none', border: 'none', color: '#a89ebb',
                    textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem'
                  }}>Update today's mood</button>
                </div>
              ) : null}

              {!saved && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 28 }}>
                    {MOODS.map(mood => (
                      <motion.button
                        key={mood.score}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelected(mood.score)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                          background: selected === mood.score ? mood.color : 'white',
                          border: selected === mood.score ? `2px solid ${mood.color}` : '2px solid transparent',
                          borderRadius: 16, padding: '12px 10px', cursor: 'pointer',
                          boxShadow: selected === mood.score ? `0 4px 16px ${mood.color}80` : '0 2px 8px rgba(0,0,0,0.06)',
                          transition: 'all 0.2s ease', minWidth: 60
                        }}
                      >
                        <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{mood.emoji}</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: selected === mood.score ? '#4a4060' : '#a89ebb' }}>
                          {mood.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>

                  <div className="card" style={{ marginBottom: 20 }}>
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Anything you'd like to add? (optional)"
                      rows={3}
                      style={{ marginBottom: 0 }}
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={!selected || aiLoading}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '1rem', padding: '14px' }}
                  >
                    {aiLoading ? 'Getting your response...' : 'Save Check-In'}
                  </button>
                </>
              )}

              {aiLoading && (
                <div className="ai-loading" style={{ justifyContent: 'center', marginTop: 20 }}>
                  <div className="dots-loading"><span/><span/><span/></div>
                  <span>Sending you some warmth...</span>
                </div>
              )}

              <AnimatePresence>
                {saved && aiResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                    style={{ marginTop: 20, background: 'linear-gradient(135deg, #f5f0ff, #fce4ec)', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: 12 }}>💜</div>
                    <p style={{ color: '#5a5070', lineHeight: 1.7, fontStyle: 'italic' }}>{aiResponse}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {view === 'graph' && (
            <motion.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>📊 Mood History</h1>
                <p>Your last 7 days at a glance</p>
              </div>
              {chartData.length < 2 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                  <p style={{ color: '#a89ebb' }}>Check in a few more times to see your mood graph 🌱</p>
                </div>
              ) : (
                <div className="card" style={{ padding: 24 }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0ebf8" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a89ebb' }} />
                      <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} tick={{ fontSize: 11, fill: '#a89ebb' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone" dataKey="score" stroke="#c9b8e8"
                        strokeWidth={3} dot={{ fill: '#c9b8e8', r: 6 }}
                        activeDot={{ r: 8, fill: '#7c6ab0' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
                {moods.slice(0, 7).map(m => (
                  <div key={m.date} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{m.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#4a4060', fontSize: '0.9rem' }}>{m.label}</div>
                      {m.note && <div style={{ color: '#a89ebb', fontSize: '0.8rem' }}>{m.note}</div>}
                    </div>
                    <div style={{ color: '#c0b8d0', fontSize: '0.75rem' }}>{shortDate(m.date)}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
