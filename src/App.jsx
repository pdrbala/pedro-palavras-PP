import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocalStorage } from './hooks/useLocalStorage'
import Navigation from './components/Navigation'
import Confetti from './components/Confetti'
import Home from './pages/Home'
import History from './pages/History'
import Settings from './pages/Settings'
import { getTodayStr, getYesterdayStr } from './data/words'
import './index.css'

const PAGE_ORDER = { home: 0, history: 1, settings: 2 }
const MILESTONES = [5, 10, 20, 50]

const INITIAL_STREAK = {
  sociologia: { streak: 0, lastDate: null, longest: 0 },
  frances: { streak: 0, lastDate: null, longest: 0 },
  russo: { streak: 0, lastDate: null, longest: 0 },
}

const pageVariants = {
  initial: (dir) => ({ opacity: 0, x: dir * 32 }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (dir) => ({
    opacity: 0,
    x: dir * -24,
    transition: { duration: 0.18, ease: 'easeIn' },
  }),
}

export default function App() {
  const [theme, setTheme] = useLocalStorage('pp-theme', 'dark')
  const [defaultTrack, setDefaultTrack] = useLocalStorage('pp-default-track', 'sociologia')
  const [track, setTrack] = useLocalStorage('pp-active-track', defaultTrack)
  const [page, setPage] = useLocalStorage('pp-page', 'home')
  const [wordStatus, setWordStatus] = useLocalStorage('pp-word-status', {})
  const [streakData, setStreakData] = useLocalStorage('pp-streak-data', INITIAL_STREAK)

  const [direction, setDirection] = useState(0)
  const [focusMode, setFocusMode] = useState(false)
  const [confettiTrigger, setConfettiTrigger] = useState(null)

  const prevStreakRef = useRef({})

  function navigateTo(newPage) {
    const cur = PAGE_ORDER[page] ?? 0
    const next = PAGE_ORDER[newPage] ?? 0
    setDirection(next > cur ? 1 : next < cur ? -1 : 0)
    setPage(newPage)
  }

  function handleMarkWord(wordId, category, status) {
    setWordStatus((prev) => ({ ...prev, [wordId]: status }))

    if (status !== 'known') return

    const today = getTodayStr()
    const yesterday = getYesterdayStr()
    const cat = streakData[category] ?? { streak: 0, lastDate: null, longest: 0 }

    if (cat.lastDate === today) return

    const newStreak = cat.lastDate === yesterday ? cat.streak + 1 : 1
    const newLongest = Math.max(newStreak, cat.longest ?? 0)

    setStreakData((prev) => ({
      ...prev,
      [category]: { streak: newStreak, lastDate: today, longest: newLongest },
    }))
  }

  function handleResetProgress() {
    setWordStatus({})
    setStreakData(INITIAL_STREAK)
    prevStreakRef.current = INITIAL_STREAK
    setConfettiTrigger(null)
  }

  useEffect(() => {
    for (const cat of ['sociologia', 'frances', 'russo']) {
      const prev = prevStreakRef.current[cat]?.streak ?? 0
      const curr = streakData[cat]?.streak ?? 0
      if (MILESTONES.some((m) => curr >= m && prev < m)) {
        setConfettiTrigger(`${cat}-${curr}-${Date.now()}`)
        break
      }
    }
    prevStreakRef.current = streakData
  }, [streakData])

  useEffect(() => {
    function onKey(e) {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'f' || e.key === 'F') setFocusMode((f) => !f)
      if (e.key === 'Escape') setFocusMode(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    if (track === 'sociologia') {
      root.style.setProperty('--accent', 'var(--soc)')
      root.style.setProperty('--accent-light', 'var(--soc-light)')
      root.style.setProperty('--accent-mid', 'var(--soc-mid)')
    } else if (track === 'russo') {
      root.style.setProperty('--accent', 'var(--ru)')
      root.style.setProperty('--accent-light', 'var(--ru-light)')
      root.style.setProperty('--accent-mid', 'var(--ru-mid)')
    } else {
      root.style.setProperty('--accent', 'var(--fr)')
      root.style.setProperty('--accent-light', 'var(--fr-light)')
      root.style.setProperty('--accent-mid', 'var(--fr-mid)')
    }
  }, [track])

  const currentStreak = streakData[track]?.streak ?? 0

  return (
    <div className="app">
      <Confetti trigger={confettiTrigger} track={track} />

      <motion.header
        className="header"
        animate={{ y: focusMode ? -70 : 0, opacity: focusMode ? 0 : 1 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: focusMode ? 'none' : 'auto' }}
      >
        <div className="container">
          <div className="header-inner">
            <span className="logo">
              Pedro<span className="logo-mark">Palavras</span>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {currentStreak > 0 && (
                <motion.div
                  className="streak-badge"
                  key={currentStreak}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <span className="streak-fire" aria-hidden="true" />
                  {currentStreak}
                </motion.div>
              )}
              <Navigation page={page} setPage={navigateTo} />
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.main
          key={page}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ flex: 1 }}
        >
          {page === 'home' && (
            <Home
              track={track}
              setTrack={setTrack}
              wordStatus={wordStatus}
              onMarkWord={handleMarkWord}
              focusMode={focusMode}
              setFocusMode={setFocusMode}
            />
          )}
          {page === 'history' && (
            <History
              wordStatus={wordStatus}
              streakData={streakData}
            />
          )}
          {page === 'settings' && (
            <Settings
              defaultTrack={defaultTrack}
              setDefaultTrack={setDefaultTrack}
              theme={theme}
              setTheme={setTheme}
              onResetProgress={handleResetProgress}
            />
          )}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}
