import { motion, AnimatePresence } from 'framer-motion'

const iconBase = import.meta.env.BASE_URL

const tabs = [
  { id: 'home', label: 'Hoje', icon: `${iconBase}icons/bootstrap/house-door.svg` },
  { id: 'history', label: 'Historico', icon: `${iconBase}icons/bootstrap/clock-history.svg` },
  { id: 'settings', label: 'Config', icon: `${iconBase}icons/bootstrap/gear.svg` },
]

export default function Navigation({ page, setPage }) {
  return (
    <nav className="nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-btn ${page === tab.id ? 'active' : ''}`}
          onClick={() => setPage(tab.id)}
        >
          <span
            className="nav-icon"
            style={{ '--nav-icon': `url(${tab.icon})` }}
            aria-hidden="true"
          />
          {tab.label}
          <AnimatePresence>
            {page === tab.id && (
              <motion.span
                className="nav-indicator"
                layoutId="nav-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
          </AnimatePresence>
        </button>
      ))}
    </nav>
  )
}
