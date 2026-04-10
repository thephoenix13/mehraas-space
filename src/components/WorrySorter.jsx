import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaude } from '../api'

export default function WorrySorter() {
  const navigate = useNavigate()
  const [worry, setWorry] = useState('')
  const [inControl, setInControl] = useState(null)
  const [reframe, setReframe] = useState('')
  const [loading, setLoading] = useState(false)
  const [worries, setWorries] = useState(() => JSON.parse(localStorage.getItem('sorted_worries') || '[]'))
  const [view, setView] = useState('write')

  const handleSort = async () => {
    if (!worry.trim()) return
    setLoading(true)
    try {
      const text = await callClaude(`Someone is feeling worried about: "${worry}". Please gently reframe this worry with kindness, compassion, and logic in 2-3 sentences. Acknowledge their feelings first, then offer a gentle perspective shift.`)
      setReframe(text)
      setView('result')
    } catch {
      setReframe("It makes sense that this is weighing on you. Worries often feel bigger than they are, especially when we're already carrying a lot. You've handled hard things before, and you can navigate this too.")
      setView('result')
    }
    setLoading(false)
  }

  const saveWorry = () => {
    const entry = { id: Date.now(), worry, reframe, inControl, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
    const updated = [entry, ...worries]
    setWorries(updated)
    localStorage.setItem('sorted_worries', JSON.stringify(updated))
    setWorry(''); setReframe(''); setInControl(null); setView('write')
  }

  const controlOpts = [
    { val: true, label: '✅ Yes, I can act', color: '#7A9E7A' },
    { val: false, label: '🌊 Out of my hands', color: '#7A8E9E' },
    { val: 'partial', label: '🌗 Partly', color: '#D4770A' },
  ]

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--color-bg)' }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/')} className="back-btn">← Home</button>
        <button onClick={() => setView(view === 'past' ? 'write' : 'past')} className="back-btn">📋 Past Worries</button>
      </div>

      <div className="page-container">
        <AnimatePresence mode="wait">
          {view === 'write' && (
            <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header"><h1>💭 Worry Sorter</h1><p>Let's gently untangle what's on your mind</p></div>
              <div className="card" style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'var(--color-text)', marginBottom: 10, fontSize: '0.93rem' }}>What's worrying you?</label>
                <textarea value={worry} onChange={e => setWorry(e.target.value)} placeholder="Write your worry here, no matter how big or small…" rows={5} style={{ marginBottom: 18 }} autoFocus />

                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'var(--color-text)', marginBottom: 12, fontSize: '0.93rem' }}>Is this in your control?</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
                  {controlOpts.map(opt => (
                    <button key={String(opt.val)} onClick={() => setInControl(opt.val)} style={{
                      flex: 1, padding: '10px 6px', borderRadius: 12,
                      border: inControl === opt.val ? `2px solid ${opt.color}` : '1.5px solid var(--color-card-border)',
                      cursor: 'pointer', background: inControl === opt.val ? opt.color + '20' : 'var(--color-card)',
                      color: inControl === opt.val ? 'var(--color-text)' : 'var(--color-text-muted)',
                      fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.73rem',
                      lineHeight: 1.3, transition: 'all 0.2s ease',
                    }}>{opt.label}</button>
                  ))}
                </div>

                <button onClick={handleSort} disabled={!worry.trim() || loading} className="btn btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '14px' }}>
                  {loading ? 'Gently sorting…' : 'Sort this Worry'}
                </button>
                {loading && <div className="ai-loading" style={{ justifyContent: 'center', marginTop: 14 }}><div className="dots-loading"><span/><span/><span/></div><span>Finding a kinder perspective…</span></div>}
              </div>
            </motion.div>
          )}

          {view === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="page-header"><h1>A Gentler View</h1></div>
              <div className="card" style={{ marginBottom: 14, borderLeft: '4px solid var(--color-card-border)' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Your worry</div>
                <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text)', fontSize: '0.9rem', fontStyle: 'italic' }}>"{worry}"</p>
                {inControl !== null && (
                  <span style={{ display: 'inline-block', marginTop: 10, background: 'var(--color-bg)', color: 'var(--color-text-muted)', border: '1px solid var(--color-card-border)', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 50 }}>
                    {inControl === true ? '✅ In your control' : inControl === false ? '🌊 Out of your control' : '🌗 Partly in your control'}
                  </span>
                )}
              </div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="card" style={{ marginBottom: 24, borderLeft: '4px solid #D4770A', background: 'var(--color-card-warm)' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 700, color: '#D4770A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>✨ A gentler perspective</div>
                <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text)', lineHeight: 1.8, fontSize: '0.93rem' }}>{reframe}</p>
              </motion.div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={saveWorry} className="btn btn-primary" style={{ flex: 1 }}>Save & Done</button>
                <button onClick={() => setView('write')} className="btn btn-ghost" style={{ flex: 1 }}>Try Another</button>
              </div>
            </motion.div>
          )}

          {view === 'past' && (
            <motion.div key="past" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header"><h1>📋 Past Worries</h1><p>{worries.length} worries sorted</p></div>
              <button onClick={() => setView('write')} className="btn btn-primary" style={{ marginBottom: 20, width: '100%' }}>+ Sort a New Worry</button>
              {worries.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}><p>No worries sorted yet. You're doing great!</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {worries.map(w => (
                    <div key={w.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text)', fontSize: '0.88rem', fontWeight: 600, flex: 1 }}>{w.worry}</p>
                        <span style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text-muted)', fontSize: '0.73rem', marginLeft: 12, whiteSpace: 'nowrap' }}>{w.date}</span>
                      </div>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text-muted)', fontSize: '0.82rem', lineHeight: 1.6, fontStyle: 'italic', borderTop: '1px solid var(--color-card-border)', paddingTop: 10 }}>{w.reframe}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
