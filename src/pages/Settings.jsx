import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Settings({ defaultTrack, setDefaultTrack, theme, setTheme, onResetProgress }) {
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  function handleResetClick() {
    if (!confirmReset) {
      setConfirmReset(true)
      setResetDone(false)
      return
    }

    onResetProgress()
    setConfirmReset(false)
    setResetDone(true)
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-top">
          <h2 className="page-title">Configuracoes</h2>
          <p className="page-subtitle">Personalize sua experiencia.</p>
        </div>

        <motion.div
          className="settings-section"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
            <div>
              <p className="settings-label">Trilha padrao</p>
              <p className="settings-desc">Qual trilha abre ao iniciar o app.</p>
            </div>
            <div className="track-selector" style={{ width: '100%' }}>
              <button
                className={`track-option ${defaultTrack === 'sociologia' ? 'active-soc' : ''}`}
                onClick={() => setDefaultTrack('sociologia')}
              >
                Sociologia
              </button>
              <button
                className={`track-option ${defaultTrack === 'frances' ? 'active-fr' : ''}`}
                onClick={() => setDefaultTrack('frances')}
              >
                Francês
              </button>
              <button
                className={`track-option ${defaultTrack === 'russo' ? 'active-ru' : ''}`}
                onClick={() => setDefaultTrack('russo')}
              >
                Russo
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="settings-section"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="settings-row">
            <div>
              <p className="settings-label">Tema escuro</p>
              <p className="settings-desc">Alterna entre claro e escuro.</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
              />
              <span className="switch-slider" />
            </label>
          </div>
        </motion.div>

        <motion.div
          className="settings-section"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="settings-row">
            <div>
              <p className="settings-label">Banco de palavras</p>
              <p className="settings-desc">Sociologia: 5 conceitos. Francês: 10 palavras. Russo: 10 palavras.</p>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>25 no total</span>
          </div>
          <div className="settings-row">
            <div>
              <p className="settings-label">Rotacao diaria</p>
              <p className="settings-desc">A palavra muda com base na data e no que ainda falta estudar.</p>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>diaria</span>
          </div>
          <div className="settings-row">
            <div>
              <p className="settings-label">Persistencia</p>
              <p className="settings-desc">Progresso salvo localmente via localStorage.</p>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>local</span>
          </div>
        </motion.div>

        <motion.div
          className="settings-section"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="settings-row reset-row">
            <div>
              <p className="settings-label">Reset all</p>
              <p className="settings-desc">
                Apaga historico, revisoes, palavras marcadas e streaks. Tema e trilha padrao continuam iguais.
              </p>
              {resetDone && (
                <p className="reset-success">Progresso resetado. A rotacao das palavras voltou do zero.</p>
              )}
            </div>

            <div className="reset-actions">
              {confirmReset && (
                <button
                  type="button"
                  className="reset-cancel"
                  onClick={() => setConfirmReset(false)}
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                className={`reset-button ${confirmReset ? 'confirming' : ''}`}
                onClick={handleResetClick}
              >
                {confirmReset ? 'Confirmar reset' : 'Reset all'}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="about-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="about-logo">PedroPalavras</p>
          <p className="about-version">v0.1.0</p>
          <p className="about-desc">Um vocabulario diario para estudar sociologia, francês e russo.</p>
        </motion.div>
      </div>
    </div>
  )
}
