import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const SOUNDS = [
  { id: 'rain', label: 'Rain', emoji: '🌧️' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊' },
  { id: 'forest', label: 'Forest', emoji: '🌲' },
  { id: 'whitenoise', label: 'White Noise', emoji: '🌫️' },
  { id: 'cafe', label: 'Café', emoji: '☕' },
  { id: 'fire', label: 'Fireplace', emoji: '🔥' },
]

function generateNoise(ctx, type) {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const source = ctx.createBufferSource()
  source.buffer = buffer; source.loop = true
  const filter = ctx.createBiquadFilter()
  if (type === 'rain') { filter.type = 'bandpass'; filter.frequency.value = 800; filter.Q.value = 0.3 }
  else if (type === 'ocean') { filter.type = 'lowpass'; filter.frequency.value = 600 }
  else if (type === 'forest') { filter.type = 'bandpass'; filter.frequency.value = 2000; filter.Q.value = 0.5 }
  else if (type === 'cafe') { filter.type = 'peaking'; filter.frequency.value = 1200; filter.gain.value = 6 }
  else if (type === 'fire') { filter.type = 'lowpass'; filter.frequency.value = 400 }
  else { filter.type = 'highpass'; filter.frequency.value = 100 }
  source.connect(filter)
  return { source, output: filter }
}

export default function CalmCorner() {
  const navigate = useNavigate()
  const [volumes, setVolumes] = useState({})
  const audioCtxRef = useRef(null)
  const nodesRef = useRef({})
  const gainNodesRef = useRef({})

  const getCtx = () => { if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)(); return audioCtxRef.current }

  const toggleSound = (id) => {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    if (nodesRef.current[id]) {
      try { nodesRef.current[id].source.stop() } catch {}
      gainNodesRef.current[id]?.disconnect()
      delete nodesRef.current[id]; delete gainNodesRef.current[id]
      setVolumes(prev => { const n = { ...prev }; delete n[id]; return n })
    } else {
      const { source, output } = generateNoise(ctx, id)
      const gainNode = ctx.createGain(); gainNode.gain.value = 0.5
      output.connect(gainNode); gainNode.connect(ctx.destination)
      source.start()
      nodesRef.current[id] = { source, output }
      gainNodesRef.current[id] = gainNode
      setVolumes(prev => ({ ...prev, [id]: 50 }))
    }
  }

  const changeVolume = (id, vol) => {
    if (gainNodesRef.current[id]) gainNodesRef.current[id].gain.value = vol / 100
    setVolumes(prev => ({ ...prev, [id]: vol }))
  }

  useEffect(() => () => {
    Object.values(nodesRef.current).forEach(n => { try { n.source.stop() } catch {} })
    audioCtxRef.current?.close()
  }, [])

  const activeSounds = Object.keys(volumes)

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: '#FAF3E0' }}>
      <div style={{ padding: '16px 20px' }}>
        <button onClick={() => navigate('/')} className="back-btn">← Home</button>
      </div>

      <div className="page-container">
        <div className="page-header"><h1>🎵 Calm Corner</h1><p>Mix your perfect ambient soundscape</p></div>

        {activeSounds.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: 20, padding: '12px 16px', background: '#fff', border: '1px solid #F0E6D0', borderLeft: '4px solid #D4770A', borderRadius: 12, fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#7A6A5A' }}>
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>🎵</motion.span>
            {' '}Now playing: {activeSounds.map(id => SOUNDS.find(s => s.id === id)?.emoji).join(' ')} {activeSounds.map(id => SOUNDS.find(s => s.id === id)?.label).join(', ')}
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {SOUNDS.map(sound => {
            const isActive = sound.id in volumes
            const vol = volumes[sound.id] || 50
            return (
              <motion.div key={sound.id} whileHover={{ y: -2 }}
                style={{
                  background: '#fff',
                  border: isActive ? '2px solid #D4770A' : '1px solid #F0E6D0',
                  borderRadius: 16, padding: '18px 16px',
                  boxShadow: isActive ? '0 4px 20px rgba(212,119,10,0.12)' : '0 2px 10px rgba(180,120,60,0.06)',
                  transition: 'all 0.25s ease',
                }}>
                <button onClick={() => toggleSound(sound.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <motion.div
                      animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                      transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
                      style={{ width: 44, height: 44, borderRadius: '50%', background: isActive ? '#FAF3E0' : '#F5EDD6', border: `1.5px solid ${isActive ? '#D4770A' : '#F0E6D0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                      {sound.emoji}
                    </motion.div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#2C2C2C' }}>{sound.label}</div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', color: isActive ? '#D4770A' : '#7A6A5A' }}>{isActive ? 'Playing' : 'Tap to play'}</div>
                    </div>
                  </div>
                </button>
                {isActive && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.75rem' }}>🔈</span>
                      <input type="range" min="0" max="100" value={vol} onChange={e => changeVolume(sound.id, parseInt(e.target.value))}
                        style={{ flex: 1, accentColor: '#D4770A', height: 4, cursor: 'pointer', WebkitAppearance: 'none' }} />
                      <span style={{ fontSize: '0.75rem' }}>🔊</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 28, fontFamily: 'Inter, sans-serif', color: '#7A6A5A', fontSize: '0.8rem' }}>
          Mix multiple sounds together for your perfect atmosphere ✨
        </div>
      </div>
    </div>
  )
}
