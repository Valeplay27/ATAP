import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTournaments, INITIAL_TOURNAMENTS } from '../../services/atapStorage'
import './QuickNav.css'

export default function QuickNav() {
  const [tournaments, setTournaments] = useState(() => {
    const list = getTournaments()
    return list && list.length > 0 ? list : INITIAL_TOURNAMENTS
  })

  useEffect(() => {
    function handleUpdate() {
      const list = getTournaments()
      if (list && list.length > 0) {
        setTournaments(list)
      }
    }
    window.addEventListener('atap_data_updated', handleUpdate)
    return () => window.removeEventListener('atap_data_updated', handleUpdate)
  }, [])

  if (!tournaments || tournaments.length === 0) return null

  // Mostrar los torneos registrados desde el admin (hasta 6 en la fila principal)
  const displayTourneys = tournaments.slice(0, 6)

  return (
    <section
      className="quick-nav"
      aria-label="Torneos del circuito ATAP"
      style={{
        gridTemplateColumns: `repeat(${Math.min(displayTourneys.length, 6)}, minmax(0, 1fr))`
      }}
    >
      {displayTourneys.map((t) => (
        <Link
          to="/torneos"
          className="quick-tourney-card"
          aria-label={t.title}
          title={`${t.title} - ${t.place || 'Lima, Perú'}`}
          key={t.id}
        >
          <div className="quick-tourney-bg">
            <img
              src={t.image || '/assets/Evento.png'}
              alt={t.title}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = '/assets/Evento.png'
              }}
            />
          </div>
          <div className="quick-tourney-overlay" />
          <div className="quick-tourney-content">
            <div className="quick-tourney-top">
              <span className={`quick-tourney-badge ${t.modalidad === 'dobles' ? 'is-duo' : 'is-level'}`}>
                {t.modalidad === 'dobles' ? 'Dúo' : (t.level || 'Singles')}
              </span>
              {t.precio && (
                <span className="quick-tourney-price">S/ {t.precio}</span>
              )}
            </div>
            <div className="quick-tourney-bottom">
              <strong className="quick-tourney-title">{t.title}</strong>
              {t.date && <small className="quick-tourney-date">{t.date}</small>}
            </div>
          </div>
        </Link>
      ))}
    </section>
  )
}