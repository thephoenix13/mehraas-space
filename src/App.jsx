import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
import { ThemeProvider } from './ThemeContext'

// Original 9
const Home = lazy(() => import('./components/Home'))
const Breathe = lazy(() => import('./components/Breathe'))
const Journal = lazy(() => import('./components/Journal'))
const MoodTracker = lazy(() => import('./components/MoodTracker'))
const GratitudeJar = lazy(() => import('./components/GratitudeJar'))
const WorrySorter = lazy(() => import('./components/WorrySorter'))
const LettersToMyself = lazy(() => import('./components/LettersToMyself'))
const Affirmations = lazy(() => import('./components/Affirmations'))
const CalmCorner = lazy(() => import('./components/CalmCorner'))
const TalkToMe = lazy(() => import('./components/TalkToMe'))

// New 9
const CBTThoughtDiary = lazy(() => import('./components/CBTThoughtDiary'))
const SleepWindDown = lazy(() => import('./components/SleepWindDown'))
const SmallWins = lazy(() => import('./components/SmallWins'))
const GuidedMeditation = lazy(() => import('./components/GuidedMeditation'))
const Grounding54321 = lazy(() => import('./components/Grounding54321'))
const SelfCareChecklist = lazy(() => import('./components/SelfCareChecklist'))
const CopingCards = lazy(() => import('./components/CopingCards'))
const MemoryJar = lazy(() => import('./components/MemoryJar'))
const GrowthGarden = lazy(() => import('./components/GrowthGarden'))

function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🌸</div>
        <div className="dots-loading" style={{ justifyContent: 'center', display: 'flex', gap: 6 }}>
          <span/><span/><span/>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Original */}
                <Route path="/" element={<Home />} />
                <Route path="/breathe" element={<Breathe />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/mood" element={<MoodTracker />} />
                <Route path="/gratitude" element={<GratitudeJar />} />
                <Route path="/worry" element={<WorrySorter />} />
                <Route path="/letters" element={<LettersToMyself />} />
                <Route path="/affirmations" element={<Affirmations />} />
                <Route path="/calm" element={<CalmCorner />} />
                <Route path="/talk" element={<TalkToMe />} />
                {/* New */}
                <Route path="/cbt" element={<CBTThoughtDiary />} />
                <Route path="/sleep" element={<SleepWindDown />} />
                <Route path="/wins" element={<SmallWins />} />
                <Route path="/meditation" element={<GuidedMeditation />} />
                <Route path="/grounding" element={<Grounding54321 />} />
                <Route path="/selfcare" element={<SelfCareChecklist />} />
                <Route path="/coping" element={<CopingCards />} />
                <Route path="/memories" element={<MemoryJar />} />
                <Route path="/garden" element={<GrowthGarden />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
          <Navbar />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}
