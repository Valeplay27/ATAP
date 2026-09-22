import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getHomeTournamentsDisplay, getAssetUrl, handleImageFallback } from '../../services/atapStorage'
import './QuickNav.css'

export default function QuickNav() {
  const [displayTourneys, setDisplayTourneys] = useState(() => getHomeTournamentsDisplay())

  useEffect(() => {
    function handleUpdate() {
      setDisplayTourneys(getHomeTournamentsDisplay())
    }
    window.addEventListener('atap_data_updated', handleUpdate)
    window.addEventListener('atap_storage_update', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('atap_data_updated', handleUpdate)
      window.removeEventListener('atap_storage_update', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  if (!displayTourneys || displayTourneys.length === 0) return null

  return (
    <section
      className="quick-nav"
      aria-label="Torneos del circuito ATAP"
      style={{
        gridTemplateColumns: `repeat(${Math.min(displayTourneys.length, 6)}, minmax(0, 1fr))`
      }}
    >
      {displayTourneys.map((t) => {
        const isFinished = t.isFinished
        const badgeLabel = isFinished
          ? '🏁 Finalizado'
          : t.modalidad === 'dobles'
            ? '🎾 Próx. Dobles'
            : t.modalidad === 'grupal'
              ? '🎾 Próx. Equipos'
              : '🎾 Próximo'

        return (
          <Link
            to="/torneos"
            className={`quick-tourney-card ${isFinished ? 'is-finished' : 'is-upcoming'}`}
            aria-label={t.title}
            title={`${t.title} - ${isFinished ? `Finalizó: ${t.fechaFinTexto || t.date}` : `Inicia: ${t.fechaInicioTexto || t.date}`}`}
            key={t.id}
          >
            <div className="quick-tourney-bg">
              <img
                src={getAssetUrl(t.image || '/assets/Evento.png')}
                alt={t.title}
                onError={(e) => handleImageFallback(e, '/assets/Evento.png')}
              />
            </div>
            <div className="quick-tourney-overlay" />
            <div className="quick-tourney-content">
              <div className="quick-tourney-top">
                <span className={`quick-tourney-badge ${isFinished ? 'badge-finished' : 'badge-upcoming'}`}>
                  {badgeLabel}
                </span>

                {isFinished ? (
                  t.campeonNombre ? (
                    <span className="quick-tourney-champ" title={`Campeón: ${t.campeonNombre}`}>
                      🏆 {t.campeonNombre}
                    </span>
                  ) : (
                    <span className="quick-tourney-finished-status">Concluido</span>
                  )
                ) : (
                  t.precio ? (
                    <span className="quick-tourney-price">S/ {t.precio}</span>
                  ) : (
                    <span className="quick-tourney-badge is-level">
                      {t.modalidad === 'dobles' ? 'Dúo' : (t.level || 'Singles')}
                    </span>
                  )
                )}
              </div>

              <div className="quick-tourney-bottom">
                <strong className="quick-tourney-title">{t.title}</strong>
                {isFinished ? (
                  <small className="quick-tourney-date date-finished">
                    🏁 Finalizó: {t.fechaFinTexto || t.date}
                  </small>
                ) : (
                  <small className="quick-tourney-date date-upcoming">
                    📅 Inicia: {t.fechaInicioTexto || t.date}
                  </small>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </section>
  )
}