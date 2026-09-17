import { useState, useEffect } from 'react'
import { CalendarDays, Clock3, Trophy, X, Tag, Award, Layers, CheckCircle2, Flame, Radio } from 'lucide-react'
import {
  getTournaments,
  normalizeCategory,
  isTournamentDateActive,
  extractTournamentMatches
} from '../../services/atapStorage'
import TournamentRegisterModal from '../../components/TournamentRegisterModal/TournamentRegisterModal'
import TournamentBracket from '../../components/TournamentBracket/TournamentBracket'
import './Tournaments.css'

export default function Tournaments({ usuario }) {
  const [tourneyList, setTourneyList] = useState([])
  const [registerTourney, setRegisterTourney] = useState(null)
  const [bracketTourney, setBracketTourney] = useState(null)
  const [selectedResultsTourney, setSelectedResultsTourney] = useState(null)
  const [resultsModalCategory, setResultsModalCategory] = useState('')
  const [selectedLiveTourney, setSelectedLiveTourney] = useState(null)
  const [liveModalCategory, setLiveModalCategory] = useState('')
  const [liveMatchesFilter, setLiveMatchesFilter] = useState('all') // 'all' | 'jugados' | 'futuros'

  function loadTournaments() {
    setTourneyList(getTournaments())
  }

  useEffect(() => {
    loadTournaments()
    function handleUpdate() {
      loadTournaments()
    }
    function handleOpenTournamentRegister(e) {
      const tourneyId = e.detail?.tournamentId
      if (tourneyId) {
        const allTourneys = getTournaments()
        const found = allTourneys.find((t) => t.id === tourneyId)
        if (found) {
          setRegisterTourney(found)
        }
      }
    }
    window.addEventListener('atap_data_updated', handleUpdate)
    window.addEventListener('atap_open_tournament_register', handleOpenTournamentRegister)
    return () => {
      window.removeEventListener('atap_data_updated', handleUpdate)
      window.removeEventListener('atap_open_tournament_register', handleOpenTournamentRegister)
    }
  }, [])

  return (
    <main className="page-content tournaments-page">
      <div className="tournaments-content-shell">
        <section className="page-heading">
          <p className="eyebrow">Calendario Oficial ATAP</p>
          <h1>Todos los torneos</h1>
          <p>
            Revisa las próximas competencias, inscríbete y sigue los resultados y cuadros de llaves en tiempo real.
          </p>
        </section>

        <div className="tournaments-wrapper">
          {tourneyList.length === 0 ? (
            <div className="tourneys-empty-state">
              <Trophy size={48} color="#00304A" />
              <h3>No hay torneos disponibles</h3>
              <p>Pronto se publicarán nuevas fechas en el calendario oficial ATAP.</p>
            </div>
          ) : (
            <section className="tournaments-page-list">
              {tourneyList.map((tournament) => {
                const precioDisplay = tournament.precio ? `S/ ${tournament.precio}.00` : 'S/ 100.00'
                const isFinalizado = tournament.estado === 'finalizado'
                const isLive = !isFinalizado && (
                  tournament.estado === 'en_curso' ||
                  isTournamentDateActive(tournament.date, tournament.startDate, tournament.endDate)
                )
                const surfaceName = (tournament.superficie || tournament.surface || 'Arcilla').toUpperCase()
                const levelName = (tournament.level || 'Nacional').toUpperCase()

                return (
                  <div className="wta-tourney-card-wrap" key={tournament.id || tournament.title}>
                    {/* WTA-STYLE POSTER CARD */}
                    <article
                      className="wta-tourney-poster"
                      onClick={() => {
                        if (isFinalizado) {
                          setSelectedResultsTourney(tournament)
                          setResultsModalCategory(tournament.categorias?.[0]?.nombre || '')
                        } else if (isLive) {
                          setSelectedLiveTourney(tournament)
                          setLiveModalCategory(tournament.categorias?.[0]?.nombre || '')
                          setLiveMatchesFilter('all')
                        } else {
                          setRegisterTourney(tournament)
                        }
                      }}
                      title={
                        isFinalizado
                          ? `Ver resultados de ${tournament.title}`
                          : isLive
                          ? `Ver partidos en vivo de ${tournament.title}`
                          : `Ver detalles de ${tournament.title}`
                      }
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
                        <span
                          className={`wta-status-badge ${
                            isFinalizado
                              ? 'finalized'
                              : isLive
                              ? 'live'
                              : 'upcoming'
                          }`}
                        >
                          {isFinalizado ? (
                            '🏁 FINALIZADO'
                          ) : isLive ? (
                            <>
                              <span className="live-pulsing-dot" /> LIVE
                            </>
                          ) : (
                            'INSCRIPCIONES'
                          )}
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
                      {isFinalizado ? (
                        <button
                          type="button"
                          className="btn-wta-results"
                          onClick={() => {
                            setSelectedResultsTourney(tournament)
                            setResultsModalCategory(tournament.categorias?.[0]?.nombre || '')
                          }}
                        >
                          <Trophy size={13} /> Ver Resultados
                        </button>
                      ) : isLive ? (
                        <button
                          type="button"
                          className="btn-wta-live"
                          onClick={() => {
                            setSelectedLiveTourney(tournament)
                            setLiveModalCategory(tournament.categorias?.[0]?.nombre || '')
                            setLiveMatchesFilter('all')
                          }}
                        >
                          <span className="live-pulsing-dot" /> LIVE • Ver Partidos
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-wta-register"
                          onClick={() => setRegisterTourney(tournament)}
                        >
                          Inscribirme ({precioDisplay})
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

      {/* MODAL DE EN VIVO / LIVE (PARTIDOS JUGADOS Y FUTUROS) */}
      {selectedLiveTourney && (() => {
        const { jugados, futuros, all } = extractTournamentMatches(selectedLiveTourney)
        const categories = selectedLiveTourney.categorias || []

        const filterByCat = (list) => {
          if (!liveModalCategory) return list
          return list.filter(
            (m) => normalizeCategory(m.categoria) === normalizeCategory(liveModalCategory)
          )
        }

        const filteredJugados = filterByCat(jugados)
        const filteredFuturos = filterByCat(futuros)
        const filteredAll = filterByCat(all)
        const surfaceName = (selectedLiveTourney.superficie || selectedLiveTourney.surface || 'Arcilla').toUpperCase()

        return (
          <div className="tourney-modal-backdrop" onClick={() => setSelectedLiveTourney(null)}>
            <div
              className="tourney-live-modal-card"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {/* LIVE MODAL TOP */}
              <div className="live-modal-top">
                <div>
                  <div className="live-top-kicker-row">
                    <span className="live-badge-kicker">
                      <span className="live-pulsing-dot-red" /> EN VIVO • ATAP LIVE
                    </span>
                    <span className="live-total-matches-count">
                      {filteredAll.length} {filteredAll.length === 1 ? 'partido' : 'partidos'}
                    </span>
                  </div>
                  <h2>{selectedLiveTourney.title}</h2>
                  <p className="live-modal-meta">
                    <CalendarDays size={14} /> {selectedLiveTourney.date} • {selectedLiveTourney.place} •{' '}
                    {selectedLiveTourney.modalidad === 'dobles' ? 'Modalidad Dúo' : 'Singles'} • {surfaceName}
                  </p>
                </div>
                <button
                  className="tourney-modal-close"
                  type="button"
                  onClick={() => setSelectedLiveTourney(null)}
                  aria-label="Cerrar modal de partidos"
                >
                  <X size={20} />
                </button>
              </div>

              {/* SELECTOR DE CATEGORÍAS */}
              {categories.length > 0 && (
                <div className="live-category-tabs">
                  <button
                    type="button"
                    className={`live-cat-tab ${!liveModalCategory ? 'active' : ''}`}
                    onClick={() => setLiveModalCategory('')}
                  >
                    <strong>Todas las Categorías</strong>
                    <span className="live-cat-count">({all.length})</span>
                  </button>
                  {categories.map((cat) => {
                    const count = all.filter(
                      (m) => normalizeCategory(m.categoria) === normalizeCategory(cat.nombre)
                    ).length
                    const isActive = liveModalCategory === cat.nombre

                    return (
                      <button
                        key={cat.id || cat.nombre}
                        type="button"
                        className={`live-cat-tab ${isActive ? 'active' : ''}`}
                        onClick={() => setLiveModalCategory(cat.nombre)}
                      >
                        <strong>{cat.nombre}</strong>
                        <span className="live-cat-count">({count})</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* FILTRO DE PARTIDOS: TODOS | JUGADOS | FUTUROS */}
              <div className="live-filter-strip">
                <div className="live-filter-pills">
                  <button
                    type="button"
                    className={`live-filter-pill ${liveMatchesFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setLiveMatchesFilter('all')}
                  >
                    🎾 Todos ({filteredAll.length})
                  </button>
                  <button
                    type="button"
                    className={`live-filter-pill ${liveMatchesFilter === 'jugados' ? 'active' : ''}`}
                    onClick={() => setLiveMatchesFilter('jugados')}
                  >
                    ✅ Jugados ({filteredJugados.length})
                  </button>
                  <button
                    type="button"
                    className={`live-filter-pill ${liveMatchesFilter === 'futuros' ? 'active' : ''}`}
                    onClick={() => setLiveMatchesFilter('futuros')}
                  >
                    ⏳ Futuros / Próximos ({filteredFuturos.length})
                  </button>
                </div>

                {selectedLiveTourney.bracket && (
                  <button
                    type="button"
                    className="btn-live-open-bracket"
                    onClick={() => {
                      setBracketTourney(selectedLiveTourney)
                      setSelectedLiveTourney(null)
                    }}
                  >
                    <Trophy size={14} /> Ver Cuadro de Llaves
                  </button>
                )}
              </div>

              {/* CUERPO DEL MODAL LIVE */}
              <div className="live-modal-body">
                {/* 1. SECCIÓN: PARTIDOS JUGADOS */}
                {(liveMatchesFilter === 'all' || liveMatchesFilter === 'jugados') && (
                  <div className="live-section-block">
                    <div className="live-section-heading">
                      <div className="live-section-title">
                        <CheckCircle2 size={18} color="#00CFA0" />
                        <h4>Partidos Jugados ({filteredJugados.length})</h4>
                      </div>
                      <span className="live-status-subtag played">Marcadores Oficiales</span>
                    </div>

                    {filteredJugados.length === 0 ? (
                      <div className="live-empty-card">
                        <p>Aún no hay partidos finalizados en esta selección.</p>
                      </div>
                    ) : (
                      <div className="live-matches-grid">
                        {filteredJugados.map((m) => {
                          const isP1Winner = m.winnerSlot === 1 || m.winnerName === m.player1
                          const isP2Winner = m.winnerSlot === 2 || m.winnerName === m.player2

                          return (
                            <div className="live-match-card completed" key={m.id}>
                              <div className="live-match-header">
                                <span className="live-round-badge">{m.etiqueta}</span>
                                <span className="live-cat-badge">{m.categoria}</span>
                                <span className="live-state-chip finished">✓ Jugado</span>
                              </div>

                              <div className="live-match-opponents">
                                <div className={`live-opponent-row ${isP1Winner ? 'is-winner' : ''}`}>
                                  <span className="opponent-name">{m.player1}</span>
                                  {isP1Winner && <span className="winner-crown">👑 Ganador</span>}
                                </div>
                                <div className="live-vs-divider">vs</div>
                                <div className={`live-opponent-row ${isP2Winner ? 'is-winner' : ''}`}>
                                  <span className="opponent-name">{m.player2}</span>
                                  {isP2Winner && <span className="winner-crown">👑 Ganador</span>}
                                </div>
                              </div>

                              {m.score && (
                                <div className="live-score-highlight">
                                  <span className="score-title">Marcador:</span>
                                  <span className="score-numbers">{m.score}</span>
                                </div>
                              )}

                              {m.puntos && (
                                <div className="live-match-points-line">
                                  <span>Puntos otorgados:</span>
                                  <strong>+{m.puntos} pts</strong>
                                </div>
                              )}

                              {m.observaciones && (
                                <small className="live-match-note">📝 {m.observaciones}</small>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. SECCIÓN: PARTIDOS FUTUROS */}
                {(liveMatchesFilter === 'all' || liveMatchesFilter === 'futuros') && (
                  <div className="live-section-block" style={{ marginTop: liveMatchesFilter === 'all' ? '28px' : '0' }}>
                    <div className="live-section-heading">
                      <div className="live-section-title">
                        <Clock3 size={18} color="#FF9800" />
                        <h4>Partidos Futuros / Próximos ({filteredFuturos.length})</h4>
                      </div>
                      <span className="live-status-subtag upcoming">Orden de Juego</span>
                    </div>

                    {filteredFuturos.length === 0 ? (
                      <div className="live-empty-card">
                        <p>No hay partidos futuros pendientes en esta selección.</p>
                      </div>
                    ) : (
                      <div className="live-matches-grid">
                        {filteredFuturos.map((m) => (
                          <div className="live-match-card scheduled" key={m.id}>
                            <div className="live-match-header">
                              <span className="live-round-badge upcoming">{m.etiqueta}</span>
                              <span className="live-cat-badge">{m.categoria}</span>
                              <span className="live-state-chip pending">⏳ Por Jugar</span>
                            </div>

                            <div className="live-match-opponents">
                              <div className="live-opponent-row">
                                <span className="opponent-name">{m.player1}</span>
                              </div>
                              <div className="live-vs-divider">vs</div>
                              <div className="live-opponent-row">
                                <span className="opponent-name">{m.player2}</span>
                              </div>
                            </div>

                            <div className="live-schedule-footer">
                              <span>📍 {m.cancha}</span>
                              <span>🕒 {m.horario}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SI NO HAY PARTIDOS GENERADOS AÚN */}
                {all.length === 0 && (
                  <div className="live-no-matches-yet">
                    <Flame size={42} color="#FF1744" />
                    <h4>Torneo Oficial en Curso</h4>
                    <p>
                      El torneo está oficialmente activo. La mesa arbitral de ATAP está conformando el rol de partidos y el orden de juego para esta categoría.
                    </p>
                    {selectedLiveTourney.inscripciones && selectedLiveTourney.inscripciones.length > 0 && (
                      <div className="live-confirmed-box">
                        <h5>Jugadores Inscritos Confirmados ({selectedLiveTourney.inscripciones.length}):</h5>
                        <div className="live-players-chips">
                          {selectedLiveTourney.inscripciones.map((ins, i) => (
                            <span key={ins.id || i} className="live-player-chip">
                              <strong>{ins.nombre}</strong> ({ins.categoria || '4ta'})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL DE RESULTADOS OFICIALES DEL TORNEO FINALIZADO */}
      {selectedResultsTourney && (
        <div className="tourney-modal-backdrop" onClick={() => setSelectedResultsTourney(null)}>
          <div
            className="tourney-results-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="results-modal-top">
              <div>
                <span className="tourney-badge-kicker">🏁 Torneo Finalizado • Resultados Oficiales</span>
                <h2>{selectedResultsTourney.title}</h2>
                <p className="results-modal-meta">
                  {selectedResultsTourney.date} • {selectedResultsTourney.place} •{' '}
                  {selectedResultsTourney.modalidad === 'dobles' ? 'Modalidad Dúo' : 'Modalidad Singles'}
                </p>
              </div>
              <button
                className="tourney-modal-close"
                type="button"
                onClick={() => setSelectedResultsTourney(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Selector de Categorías y Cupos */}
            <div className="modal-category-tabs">
              {(selectedResultsTourney.categorias || []).map((cat) => {
                const count = (selectedResultsTourney.resultados || []).filter(
                  (r) => r.categoria === cat.nombre
                ).length
                const activeCat =
                  resultsModalCategory || selectedResultsTourney.categorias?.[0]?.nombre || ''
                const isActive = activeCat === cat.nombre

                return (
                  <button
                    key={cat.id || cat.nombre}
                    type="button"
                    className={`modal-cat-tab ${isActive ? 'active' : ''}`}
                    onClick={() => setResultsModalCategory(cat.nombre)}
                  >
                    <strong>{cat.nombre}</strong>
                    <span className="modal-cat-cupos">
                      ({cat.cupos} cupos) • {count} {count === 1 ? 'partido' : 'partidos'}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Cuerpo de Resultados de la Categoría Activa */}
            {(() => {
              const activeCat =
                resultsModalCategory ||
                selectedResultsTourney.categorias?.[0]?.nombre ||
                '4ta'
              const catResults = (selectedResultsTourney.resultados || []).filter(
                (r) => normalizeCategory(r.categoria) === normalizeCategory(activeCat)
              )
              const champMatch = catResults.find((r) => r.ronda === 'Gran Final')

              return (
                <div className="modal-results-body">
                  {champMatch && (
                    <div className="modal-honor-card">
                      <div className="honor-trophy-banner">
                        <Trophy size={32} color="#FFD700" />
                        <div>
                          <span className="honor-cat-label">CAMPEÓN OFICIAL — {activeCat}</span>
                          <h3 className="champ-highlight-name">{champMatch.ganador}</h3>
                        </div>
                      </div>
                      <div className="honor-details-strip">
                        <span>
                          Marcador Gran Final: <strong>{champMatch.score}</strong>
                        </span>
                        <span>
                          Subcampeón:{' '}
                          <strong>
                            {champMatch.ganador === champMatch.jugador1
                              ? champMatch.jugador2
                              : champMatch.jugador1}
                          </strong>
                        </span>
                        <span>
                          Puntos Sumados: <strong>+{champMatch.puntos || 250} pts</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="modal-section-header">
                    <h4>Partidos Registrados en {activeCat}</h4>
                  </div>

                  {catResults.length === 0 ? (
                    <div className="modal-empty-results">
                      <p>
                        Aún no se han publicado resultados de partidos para {activeCat}.
                      </p>
                    </div>
                  ) : (
                    <div className="modal-matches-grid">
                      {catResults.map((res) => {
                        const isP1 = res.ganador === res.jugador1
                        const isFinal = res.ronda === 'Gran Final'
                        return (
                          <div
                            key={res.id}
                            className={`modal-match-card ${isFinal ? 'final-match' : ''}`}
                          >
                            <div className="modal-match-header">
                              <span className={`match-round-tag ${isFinal ? 'gold' : ''}`}>
                                {res.ronda}
                              </span>
                              <span className="match-points-tag">+{res.puntos} pts</span>
                            </div>
                            <div className="modal-match-players">
                              <div className={`player-row ${isP1 ? 'winner' : ''}`}>
                                <strong>{res.jugador1}</strong>
                                {isP1 && <span className="winner-tag">👑 Ganador</span>}
                              </div>
                              <div className="modal-vs-line">vs</div>
                              <div className={`player-row ${!isP1 ? 'winner' : ''}`}>
                                <strong>{res.jugador2}</strong>
                                {!isP1 && <span className="winner-tag">👑 Ganador</span>}
                              </div>
                            </div>
                            <div className="modal-match-score">
                              <span>Marcador:</span>
                              <strong>{res.score}</strong>
                            </div>
                            {res.observaciones && (
                              <small className="modal-match-obs">📝 {res.observaciones}</small>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {selectedResultsTourney.bracket && (
                    <div className="modal-bracket-button-area">
                      <button
                        type="button"
                        className="btn-view-bracket-inline"
                        onClick={() => {
                          setBracketTourney(selectedResultsTourney)
                          setSelectedResultsTourney(null)
                        }}
                      >
                        <Trophy size={15} /> Ver Cuadro de Llaves Completo
                      </button>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
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
