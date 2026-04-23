import { useRef, useLayoutEffect, useState } from 'react'
import { motion } from 'framer-motion'

const spring = { type: 'spring', stiffness: 500, damping: 38 }

const TRACKS = [
  { id: 'sociologia', label: 'Sociologia', color: 'var(--soc)' },
  { id: 'frances', label: 'Frances', color: 'var(--fr)' },
  { id: 'russo', label: 'Russo', color: 'var(--ru)' },
]

export default function TrackToggle({ track, setTrack }) {
  const refs = {
    sociologia: useRef(null),
    frances: useRef(null),
    russo: useRef(null),
  }
  const [pillStyle, setPillStyle] = useState({ left: 0, top: 0, width: 0, height: 0 })

  useLayoutEffect(() => {
    function syncPill() {
      const el = refs[track]?.current
      if (!el) return
      const parent = el.closest('.toggle-track')
      if (!parent) return
      const pr = parent.getBoundingClientRect()
      const er = el.getBoundingClientRect()
      setPillStyle({
        left: er.left - pr.left,
        top: er.top - pr.top,
        width: er.width,
        height: er.height,
      })
    }

    syncPill()
    window.addEventListener('resize', syncPill)
    return () => window.removeEventListener('resize', syncPill)
  }, [track])

  return (
    <div className="toggle-wrapper">
      <div className="toggle-track">
        <motion.div
          className="toggle-pill"
          animate={pillStyle}
          transition={spring}
        />

        {TRACKS.map(({ id, label, color }) => (
          <button
            key={id}
            ref={refs[id]}
            className="toggle-option"
            style={{ color: track === id ? color : 'var(--text-3)' }}
            onClick={() => setTrack(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
