import { useState, useEffect } from 'react'
import { CalendarDays, Clock3, Trophy, X, Tag } from 'lucide-react'
import { getTournaments } from '../../services/atapStorage'
import TournamentRegisterModal from '../../components/TournamentRegisterModal/TournamentRegisterModal'
import TournamentBracket from '../../components/TournamentBracket/TournamentBracket'
import './Tournaments.css'

export default function Tournaments({ usuario }) {
  const [tourneyList, setTourneyList] = useState([])
  const [registerTourney, setRegisterTourney] = useState(null)
  const [bracketTourney, setBracketTourney] = useState(null)

  function loadTournaments() {
    setTourneyList(getTournaments())
  }

  useEffect(() => {
    loadTournaments()
    function handleUpdate() {
      loadTournaments()
    }
    window.addEventListener('atap_data_updated', handleUpdate)
    return () => window.removeEventListener('atap_data_updated', handleUpdate)
  }, [])

  return (
    <main className="page-content tournaments-page">
      <div className="tournaments-content-shell">
        <section className="page-heading">
          <p className="eyebrow">Calendario Oficial ATAP</p>
          <h1>Todos los torneos</h1>
          <p>
            Revisa las próximas competencias, inscríbete y sigue los cuadros de llaves en tiempo real.
          </p>
        </section>

        <div className="tournaments-wrapper">
          {tourneyList.length === 0 ? (
            <div className="tourneys-empty-state">
              <Trophy size={48} color="#063B78" />
              <h3>No hay torneos disponibles</h3>
              <p>Pronto se publicarán nuevas fechas en el calendario oficial ATAP.</p>
            </div>
          ) : (
            <section className="tournaments-page-list">
              {tourneyList.map((tournament) => {
                const precioDisplay = tournament.precio ? `S/ ${tournament.precio}.00` : 'S/ 100.00'
                const hasBracket = Boolean(tournament.bracket && tournament.bracket.rounds)
                const surfaceName = (tournament.superficie || tournament.surface || 'Arcilla').toUpperCase()
                const levelName = (tournament.level || 'Nacional').toUpperCase()

                return (
                  <div className="wta-tourney-card-wrap" key={tournament.id || tournament.title}>
                    {/* WTA-STYLE POSTER CARD */}
                    <article
                      className="wta-tourney-poster"
                      onClick={() => setRegisterTourney(tournament)}
                      title={`Ver detalles de ${tournament.title}`}
                    >
                      {/* POSTER IMAGE */}
                      <img
                        src={tournament.image}
                        alt={tournament.title}
                        className="wta-poster-img"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = '/assets/Evento.png'
                        }}
                      />

                      {/* DARK GRADIENT OVERLAY */}
                      <div className="wta-poster-gradient" />

                      {/* TOP BADGES ROW */}
                      <div className="wta-poster-top-row">
                        <span className={`wta-status-badge ${hasBracket ? 'in-progress' : 'upcoming'}`}>
                          {hasBracket ? 'EN CURSO' : 'INSCRIPCIONES'}
                        </span>
                        <span className="wta-price-badge-top">{precioDisplay}</span>
                      </div>

                      {/* BOTTOM OVERLAY INFO */}
                      <div className="wta-poster-bottom-info">
                        <div className="wta-date-pill">{tournament.date}</div>
                        <h3 className="wta-tourney-title">{tournament.title}</h3>
                        <div className="wta-tourney-place">
                          {tournament.place?.toUpperCase() || 'LIMA • PERÚ'}
                        </div>

                        {/* BOTTOM META ROW INSIDE POSTER */}
                        <div className="wta-poster-footer-row">
                          <span className="wta-surface-label">
                            {tournament.modalidad === 'dobles' ? 'DÚO / DOBLES' : 'SINGLES'} • {surfaceName}
                          </span>
                          <span className="wta-level-badge">ATAP {levelName}</span>
                        </div>
                      </div>
                    </article>

                    {/* CARD ACTION BUTTONS BELOW */}
                    <div className="wta-card-actions">
                      <button
                        type="button"
                        className="btn-wta-register"
                        onClick={() => setRegisterTourney(tournament)}
                      >
                        Inscribirme ({precioDisplay})
                      </button>

                      {hasBracket && (
                        <button
                          type="button"
                          className="btn-wta-bracket"
                          onClick={() => setBracketTourney(tournament)}
                          title="Ver Llaves del Torneo"
                        >
                          <Trophy size={14} /> Llaves
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </section>
          )}
        </div>
      </div>

      {/* MODAL DE INSCRIPCIÓN */}
      {registerTourney && (
        <TournamentRegisterModal
          tournament={registerTourney}
          usuario={usuario}
          onClose={() => setRegisterTourney(null)}
          onSuccess={() => loadTournaments()}
        />
      )}

      {/* MODAL DE VISUALIZACIÓN DE BRACKET / LLAVES */}
      {bracketTourney && (
        <div className="tourney-modal-backdrop" onClick={() => setBracketTourney(null)}>
          <div
            className="tourney-bracket-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="bracket-modal-top">
              <div>
                <span className="tourney-badge-kicker">Cuadro Oficial</span>
                <h2>{bracketTourney.title}</h2>
              </div>
              <button
                className="tourney-modal-close"
                type="button"
                onClick={() => setBracketTourney(null)}
              >
                <X size={20} />
              </button>
            </div>

            <TournamentBracket bracket={bracketTourney.bracket} isAdmin={false} />
          </div>
        </div>
      )}
    </main>
  )
}
