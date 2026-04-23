import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PALETTES = {
  sociologia: ['#2D4A3E', '#4a7c65', '#7dbea0', '#a8d5c0'],
  frances: ['#3D2F72', '#6b58c0', '#9d8fe8', '#c4b8f5'],
  russo: ['#8C2020', '#c44444', '#e88888', '#f5c0c0'],
}

function rand(a, b) {
  return a + Math.random() * (b - a)
}

export default function Confetti({ trigger, track }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (!trigger) return
    const palette = PALETTES[track] ?? PALETTES.sociologia
    const items = Array.from({ length: 52 }, (_, i) => ({
      id: i,
      x: rand(5, 95),
      color: palette[i % palette.length],
      size: rand(5, 11),
      tall: Math.random() > 0.5,
      delay: rand(0, 0.35),
      duration: rand(1.1, 1.9),
      spin: rand(-260, 260),
    }))
    setParticles(items)
    const t = setTimeout(() => setParticles([]), 2400)
    return () => clearTimeout(t)
  }, [trigger, track])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none', zIndex: 999, overflow: 'hidden',
    }}>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={`${trigger}-${p.id}`}
            initial={{ x: `${p.x}vw`, y: -14, rotate: 0, opacity: 1 }}
            animate={{
              y: '110vh',
              rotate: p.spin,
              opacity: [1, 1, 0.7, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.2, 0, 1, 0.8],
            }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.tall ? p.size * 2.6 : p.size,
              background: p.color,
              borderRadius: p.tall ? 2 : p.size / 2,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
