import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const HABITS = [
  { id: 'journaled', emoji: '📓', label: 'Journaled', color: '#c9b8e8' },
  { id: 'meditated', emoji: '🧘', label: 'Meditated', color: '#b2c9b2' },
  { id: 'outside', emoji: '🌿', label: 'Went outside', color: '#81c784' },
  { id: 'water', emoji: '💧', label: 'Drank water', color: '#81d4fa' },
  { id: 'rested', emoji: '😴', label: 'Rested well', color: '#b39ddb' },
  { id: 'kind', emoji: '🌸', label: 'Did something kind for myself', color: '#f48fb1' },
]

const todayKey = () => new Date().toISOString().split('T')[0]

// Deterministic plant placement based on entry index
function getPlantStyle(index, total) {
  const cols = [12, 25, 40, 55, 70, 82, 18, 35, 50, 65, 78, 8, 30, 48, 62, 75]
  const rows = [72, 68, 75, 70, 73, 68, 60, 62, 65, 60, 62, 82, 80, 78, 80, 75]
  return {
    x: cols[index % cols.length],
    y: rows[index % rows.length]
  }
}

// SVG plant components
function Flower({ x, y, color, size = 1, delay = 0, type = 0 }) {
  const variants = [
    // Daisy-like
    <>
      {[0,45,90,135,180,225,270,315].map((angle, i) => (
        <motion.ellipse key={i} cx={0} cy={-8 * size} rx={3 * size} ry={5 * size}
          fill={color} opacity={0.85}
          transform={`rotate(${angle})`} />
      ))}
      <circle cx={0} cy={0} r={5 * size} fill="#ffe082" />
    </>,
    // Tulip-like
    <>
      <motion.path d={`M0,0 C-${6*size},-${8*size} -${6*size},-${16*size} 0,-${18*size} C${6*size},-${16*size} ${6*size},-${8*size} 0,0`}
        fill={color} opacity={0.9} />
      <line x1={0} y1={0} x2={0} y2={14 * size} stroke="#81c784" strokeWidth={1.5} />
    </>,
    // Simple bloom
    <>
      {[0,60,120,180,240,300].map((angle, i) => (
        <motion.circle key={i} cx={Math.cos(angle * Math.PI/180) * 6 * size} cy={Math.sin(angle * Math.PI/180) * 6 * size}
          r={4 * size} fill={color} opacity={0.8} />
      ))}
      <circle cx={0} cy={0} r={3 * size} fill="white" opacity={0.9} />
    </>,
    // Star flower
    <>
      {[0,72,144,216,288].map((angle, i) => (
        <motion.polygon key={i}
          points={`0,${-8*size} ${2*size},${-3*size} ${7*size},${-3*size} ${3*size},0 ${4*size},${6*size} 0,${3*size} ${-4*size},${6*size} ${-3*size},0 ${-7*size},${-3*size} ${-2*size},${-3*size}`}
          fill={color} opacity={0.8}
          transform={`rotate(${angle})`} />
      ))}
      <circle cx={0} cy={0} r={3 * size} fill="#fffde7" />
    </>,
    // Lavender spike
    <>
      {[-3,-1,1,3].map((dx, i) => [0,4,8,12].map((dy, j) => (
        <circle key={`${i}-${j}`} cx={dx * size} cy={(-dy-4) * size} r={2.5 * size} fill={color} opacity={0.75} />
      )))}
      <line x1={0} y1={0} x2={0} y2={12 * size} stroke="#b2c9b2" strokeWidth={1.5 * size} />
    </>,
    // Cherry blossom
    <>
      {[0,60,120,180,240,300].map((angle, i) => (
        <motion.path key={i}
          d={`M0,0 Q${Math.cos(angle*Math.PI/180)*4*size},${Math.sin(angle*Math.PI/180)*4*size} ${Math.cos(angle*Math.PI/180)*9*size},${Math.sin(angle*Math.PI/180)*9*size}`}
          stroke={color} strokeWidth={3 * size} strokeLinecap="round" fill="none" opacity={0.8} />
      ))}
      <circle cx={0} cy={0} r={2.5 * size} fill="#fce4ec" />
    </>,
  ]
  return (
    <motion.g
      transform={`translate(${x}, ${y})`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: 'spring', damping: 12, stiffness: 100 }}
    >
      <motion.g
        animate={{ rotate: [-1, 1, -1], y: [0, -2, 0] }}
        transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut' }}
      >
        {variants[type % variants.length]}
      </motion.g>
    </motion.g>
  )
}

function Grass({ x, y, color = '#b2c9b2', height = 1 }) {
  return (
    <motion.g transform={`translate(${x}, ${y})`}
      animate={{ rotate: [-2, 2, -2] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: x * 0.01 }}>
      <path d={`M0,0 Q-${3*height},-${10*height} -${1*height},-${16*height}`} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.6}/>
      <path d={`M0,0 Q${2*height},-${12*height} ${3*height},-${18*height}`} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.7}/>
      <path d={`M0,0 Q0,-${8*height} ${1*height},-${14*height}`} stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" opacity={0.8}/>
    </motion.g>
  )
}

function Butterfly({ x, y, color, delay }) {
  return (
    <motion.g
      animate={{ x: [x, x + 20, x + 10, x + 30, x], y: [y, y - 10, y + 5, y - 8, y] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.g animate={{ scaleX: [1, -1, 1] }} transition={{ duration: 0.3, repeat: Infinity }}>
        <ellipse cx={-6} cy={0} rx={7} ry={5} fill={color} opacity={0.7} />
        <ellipse cx={6} cy={0} rx={7} ry={5} fill={color} opacity={0.7} />
        <ellipse cx={-5} cy={2} rx={4} ry={3} fill={color} opacity={0.5} />
        <ellipse cx={5} cy={2} rx={4} ry={3} fill={color} opacity={0.5} />
      </motion.g>
      <circle cx={0} cy={0} r={1.5} fill="#4a4060" opacity={0.5} />
    </motion.g>
  )
}

export default function GrowthGarden() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState(() => JSON.parse(localStorage.getItem('garden_logs') || '[]'))
  const [todayLogged, setTodayLogged] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('garden_today') || '{}')
    return stored.date === todayKey() ? stored.habits : {}
  })
  const [view, setView] = useState('garden') // garden | log

  const saveToday = (habits) => {
    setTodayLogged(habits)
    localStorage.setItem('garden_today', JSON.stringify({ date: todayKey(), habits }))
  }

  const logHabit = (id) => {
    const updated = { ...todayLogged, [id]: !todayLogged[id] }
    saveToday(updated)
  }

  const plantToday = () => {
    const checkedHabits = Object.entries(todayLogged).filter(([,v]) => v).map(([k]) => k)
    if (checkedHabits.length === 0) return
    const alreadyToday = logs.find(l => l.date === todayKey())
    const entry = { id: Date.now(), date: todayKey(), habits: checkedHabits }
    let updated
    if (alreadyToday) {
      updated = logs.map(l => l.date === todayKey() ? entry : l)
    } else {
      updated = [entry, ...logs]
    }
    setLogs(updated)
    localStorage.setItem('garden_logs', JSON.stringify(updated))
    setView('garden')
  }

  // Build plant list from all logged habits
  const plants = useMemo(() => {
    const result = []
    logs.forEach((log, logIdx) => {
      log.habits.forEach((habitId, habitIdx) => {
        const habit = HABITS.find(h => h.id === habitId)
        if (!habit) return
        result.push({
          id: `${log.date}-${habitId}`,
          color: habit.color,
          type: HABITS.findIndex(h => h.id === habitId),
          size: 0.7 + (result.length % 3) * 0.15,
          delay: result.length * 0.08,
          ...getPlantStyle(result.length, result.length + 1)
        })
      })
    })
    return result
  }, [logs])

  // Butterflies appear when garden has many plants
  const butterflies = plants.length >= 6 ? [
    { x: 60, y: 80, color: '#f5c6d0', delay: 0 },
    { x: 120, y: 60, color: '#c9b8e8', delay: 2 },
    ...(plants.length >= 12 ? [{ x: 180, y: 90, color: '#b2c9b2', delay: 4 }] : [])
  ] : []

  const totalPlants = plants.length
  const todayCount = Object.values(todayLogged).filter(Boolean).length

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'linear-gradient(180deg, #c8e6c9 0%, #e8f5e9 30%, #f5f0ff 100%)' }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/')} style={{
          background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 12,
          padding: '8px 16px', cursor: 'pointer', color: '#4a6e4a',
          fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
        }}>← Home</button>
        <div style={{ display: 'flex', gap: 8 }}>
          {['garden', 'log'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 14px', borderRadius: 50, border: 'none', cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.8rem',
              background: view === v ? 'rgba(178,201,178,0.8)' : 'rgba(255,255,255,0.6)',
              color: view === v ? 'white' : '#4a6e4a'
            }}>{v === 'garden' ? '🌱 Garden' : '✅ Log Today'}</button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'garden' && (
          <motion.div key="garden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Sky and clouds */}
            <div style={{ textAlign: 'center', padding: '0 0 0', position: 'relative' }}>
              <div style={{ fontSize: '0.85rem', color: '#5a8a5a', fontWeight: 600, padding: '8px 0 4px', fontFamily: 'Nunito, sans-serif' }}>
                🌱 {totalPlants} plant{totalPlants !== 1 ? 's' : ''} growing · {logs.length} day{logs.length !== 1 ? 's' : ''} tended
              </div>

              {/* Sun */}
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: 20, right: 40, fontSize: '2rem',
                  filter: 'drop-shadow(0 0 12px rgba(255,200,0,0.5))'
                }}
              >☀️</motion.div>

              {/* Clouds */}
              {[{ x: 5, y: 10, scale: 1 }, { x: 45, y: 6, scale: 0.75 }, { x: 70, y: 14, scale: 0.9 }].map((c, i) => (
                <motion.div key={i}
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 12 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', left: `${c.x}%`, top: c.y,
                    fontSize: `${1.8 * c.scale}rem`, opacity: 0.6
                  }}
                >☁️</motion.div>
              ))}
            </div>

            {/* Garden SVG scene */}
            <div style={{ position: 'relative', overflow: 'hidden', margin: '0 8px' }}>
              <svg viewBox="0 0 300 200" style={{ width: '100%', maxHeight: 360, display: 'block' }}>
                {/* Sky gradient */}
                <defs>
                  <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#b3e5fc" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="transparent"/>
                  </linearGradient>
                  <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#81c784"/>
                    <stop offset="100%" stopColor="#4caf50"/>
                  </linearGradient>
                  <linearGradient id="dirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#a1887f"/>
                    <stop offset="100%" stopColor="#795548"/>
                  </linearGradient>
                </defs>

                {/* Ground */}
                <ellipse cx={150} cy={195} rx={160} ry={20} fill="url(#groundGrad)" opacity={0.9}/>
                <ellipse cx={150} cy={198} rx={155} ry={12} fill="url(#dirtGrad)" opacity={0.5}/>

                {/* Static grass patches */}
                {[20,50,80,110,140,170,200,230,260].map(x => (
                  <Grass key={x} x={x} y={178} color="#66bb6a" height={0.8 + (x % 30) * 0.02} />
                ))}

                {/* Butterflies */}
                {butterflies.map((b, i) => (
                  <Butterfly key={i} x={b.x} y={b.y} color={b.color} delay={b.delay} />
                ))}

                {/* Plants (flowers) */}
                {plants.map((p, i) => {
                  const px = (p.x / 100) * 280 + 10
                  const py = (p.y / 100) * 100 + 100
                  return (
                    <Flower key={p.id} x={px} y={py} color={p.color} size={p.size} delay={p.delay} type={p.type} />
                  )
                })}

                {/* Empty garden message */}
                {plants.length === 0 && (
                  <text x={150} y={160} textAnchor="middle" fill="rgba(100,130,100,0.5)" fontSize={11} fontFamily="Nunito">
                    Log habits to grow your garden 🌱
                  </text>
                )}
              </svg>
            </div>

            {/* Garden caption */}
            <div style={{ textAlign: 'center', padding: '8px 20px 20px' }}>
              {totalPlants === 0 && <p style={{ color: '#7a9e7a', fontSize: '0.9rem' }}>Your garden is waiting for you 🌱</p>}
              {totalPlants > 0 && totalPlants < 6 && <p style={{ color: '#7a9e7a', fontSize: '0.9rem' }}>A beautiful start. Keep going! 🌿</p>}
              {totalPlants >= 6 && totalPlants < 15 && <p style={{ color: '#7a9e7a', fontSize: '0.9rem' }}>Your garden is blooming! 🌸</p>}
              {totalPlants >= 15 && <p style={{ color: '#7a9e7a', fontSize: '0.9rem' }}>What a beautiful, flourishing garden you've grown 🌻✨</p>}
            </div>

            {/* Habit legend */}
            <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 16px 16px' }}>
              <div className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7a9e7a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                  Each plant represents...
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {HABITS.map(h => (
                    <div key={h.id} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: h.color + '30', borderRadius: 50,
                      padding: '4px 12px', fontSize: '0.78rem', color: '#4a6060'
                    }}>
                      <span>{h.emoji}</span>
                      <span style={{ fontWeight: 600 }}>{h.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 16px' }}>
              <button onClick={() => setView('log')} className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #81c784, #4caf50)' }}>
                🌱 Log Today's Habits
              </button>
              <p style={{ textAlign: 'center', color: '#a0b8a0', fontSize: '0.78rem', marginTop: 10 }}>
                Missing days don't affect your garden — it's always beautiful 💚
              </p>
            </div>
          </motion.div>
        )}

        {view === 'log' && (
          <motion.div key="log" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <div style={{ maxWidth: 700, margin: '0 auto', padding: '16px 16px 0' }}>
              <div className="page-header">
                <h1>🌱 Today's Garden</h1>
                <p>What did you do for yourself today?</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {HABITS.map(habit => {
                  const isChecked = todayLogged[habit.id]
                  return (
                    <motion.button
                      key={habit.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => logHabit(habit.id)}
                      style={{
                        background: isChecked ? habit.color + '30' : 'white',
                        border: isChecked ? `2px solid ${habit.color}` : '2px solid transparent',
                        borderRadius: 18, padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
                        boxShadow: '0 4px 14px rgba(100,150,100,0.1)', transition: 'all 0.25s ease',
                        display: 'flex', alignItems: 'center', gap: 14
                      }}
                    >
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                        background: isChecked ? habit.color + '60' : '#f0f8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
                      }}>
                        {isChecked ? '✓' : habit.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#4a6050', fontSize: '0.9rem' }}>{habit.label}</div>
                        <div style={{ color: '#90b890', fontSize: '0.75rem', marginTop: 2 }}>
                          {isChecked ? `Adds a ${['flower', 'bloom', 'plant', 'blossom', 'petal', 'bud'][HABITS.findIndex(h => h.id === habit.id)]} to your garden` : 'Tap to log'}
                        </div>
                      </div>
                      <motion.div
                        animate={{ scale: isChecked ? 1 : 0, opacity: isChecked ? 1 : 0 }}
                        style={{
                          width: 22, height: 22, borderRadius: '50%', background: habit.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white', fontWeight: 800, flexShrink: 0
                        }}
                      >✓</motion.div>
                    </motion.button>
                  )
                })}
              </div>

              {todayCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: 16, textAlign: 'center', color: '#7a9e7a', fontSize: '0.9rem' }}
                >
                  🌱 {todayCount} new plant{todayCount > 1 ? 's' : ''} ready to grow!
                </motion.div>
              )}

              <button
                onClick={plantToday}
                disabled={todayCount === 0}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '1rem', padding: '14px', background: todayCount > 0 ? 'linear-gradient(135deg, #81c784, #4caf50)' : undefined, marginBottom: 12 }}
              >
                🌻 Plant in My Garden
              </button>
              <p style={{ textAlign: 'center', color: '#a0b8a0', fontSize: '0.78rem' }}>
                You can come back anytime — there's no wrong time to tend your garden 🌿
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
