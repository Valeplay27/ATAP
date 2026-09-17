import { useState, useEffect } from 'react'
import { Star, X, Trophy, Calendar, Phone, Award, Flame, User, Users } from 'lucide-react'
import { getPlayerMatchHistory, getPlayerBothProfiles } from '../../services/atapStorage'
import './PlayerHeroModal.css'

export default function PlayerHeroModal({
  player,
  onClose,
  initialTab = 'partidos',
  favorites = [],
  onToggleFavorite = () => {},
  initialModality = 'singles'
}) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [selectedModality, setSelectedModality] = useState(initialModality || 'singles')
  const [matches, setMatches] = useState([])
  const [profiles, setProfiles] = useState(() => getPlayerBothProfiles(player?.name || player?.id))

  useEffect(() => {
    if (initialModality) {
      setSelectedModality(initialModality)
    }
  }, [initialModality, player])

  useEffect(() => {
    if (player) {
      setProfiles(getPlayerBothProfiles(player.name || player.id))
      const history = getPlayerMatchHistory(player.name || player.id)
      setMatches(history)
    }
  }, [player])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!player) return null

  const activeProfile = selectedModality === 'dobles'
    ? (profiles.dobles || player)
    : (profiles.singles || player)

  const isFav = favorites.includes(player.position) || favorites.includes(player.id)

  // Filter matches specifically by the chosen modality (Singles shows singles matches, Dobles shows dobles matches)
  const currentMatches = matches.filter((m) => {
    if (selectedModality === 'dobles') return m.modalidad === 'dobles'
    if (selectedModality === 'singles') return m.modalidad === 'singles'
    return true
  })

  const totalMatches = currentMatches.length
  const wonMatches = currentMatches.filter((m) => m.resultado === 'victoria').length
  const lostMatches = currentMatches.filter((m) => m.resultado === 'derrota').length
  const totalPointsGained = currentMatches.reduce((acc, m) => acc + (m.puntosGanados || 0), 0)

  return (
    <div className="player-hero-modal-backdrop" onClick={onClose}>
      <div className="player-hero-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Barra superior del modal */}
        <div className="p-hero-topbar">
          <div className="p-hero-badge-tag">
            {selectedModality === 'dobles' ? '👥' : '🎾'} CIRCUITO OFICIAL ATAP • {selectedModality === 'dobles' ? 'DOBLES INDIVIDUAL' : 'SINGLES'} • {activeProfile.categoria || player.categoria || '4ta'}
          </div>

          <div className="p-hero-top-actions">
            <button
              type="button"
              className={`p-hero-fav-btn ${isFav ? 'is-fav' : ''}`}
              onClick={() => onToggleFavorite(player.position || player.id)}
            >
              <Star
                size={14}
                fill={isFav ? '#FFD700' : 'none'}
                color={isFav ? '#E6A100' : '#25005C'}
              />
              <span>FAVORITE</span>
            </button>
            <button
              type="button"
              className="p-hero-close-btn"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* SECCIÓN HERO (Banner morado #25005C, nombre gigante verde, datos, foto recortada) */}
        <div className="p-hero-main-banner">
          <div className="p-hero-info-col">
            <h1 className="p-hero-giant-name">{player.name}</h1>

            <div className="p-hero-meta-row">
              <span className="p-hero-flag-wrap">
                <span className="country-flag" aria-hidden="true" />
                <span className="country-code-text">{player.country || 'PER'}</span>
              </span>
              <span className="p-hero-sep">•</span>
              <span>{player.edad || '25 yrs'}</span>
              <span className="p-hero-sep">•</span>
              <span>{player.altura || '1.74m'}</span>
              <span className="p-hero-sep">•</span>
              <span>🎾 {player.manoDominante || player.mano || 'Diestro'}</span>
            </div>

            {/* SELECTOR DE MODALIDAD DEL JUGADOR: Muestra claramente lo sacado en Singles vs Dobles */}
            <div className="p-hero-modality-bar" role="tablist" aria-label="Modalidad del jugador">
              <button
                type="button"
                className={`p-modal-mod-btn ${selectedModality === 'singles' ? 'active' : ''}`}
                onClick={() => setSelectedModality('singles')}
                title="Ver estadísticas y partidos de Singles"
              >
                <User size={14} />
                <span>Singles: <strong>{profiles.singles?.points || (selectedModality === 'singles' ? player.points : '0 pts')}</strong></span>
              </button>
              <button
                type="button"
                className={`p-modal-mod-btn ${selectedModality === 'dobles' ? 'active' : ''}`}
                onClick={() => setSelectedModality('dobles')}
                title="Ver estadísticas y partidos de Dobles"
              >
                <Users size={14} />
                <span>Dobles: <strong>{profiles.dobles?.points || (selectedModality === 'dobles' ? player.points : '0 pts')}</strong></span>
              </button>
            </div>

            {selectedModality === 'dobles' && (activeProfile.parejaReciente || player.parejaReciente) && (
              <div className="p-hero-partner-strip">
                👥 Dupla reciente: <strong>{activeProfile.parejaReciente || player.parejaReciente}</strong>
              </div>
            )}

            {/* Switcher de Pestañas */}
            <div className="p-hero-tabs-switcher">
              <button
                type="button"
                className={`p-hero-tab-pill ${activeTab === 'partidos' ? 'active' : ''}`}
                onClick={() => setActiveTab('partidos')}
              >
                🎾 ÚLTIMOS PARTIDOS
              </button>
              <button
                type="button"
                className={`p-hero-tab-pill ${activeTab === 'ficha' ? 'active' : ''}`}
                onClick={() => setActiveTab('ficha')}
              >
                FICHA TÉCNICA
              </button>
              <button
                type="button"
                className={`p-hero-tab-pill ${activeTab === 'golpes' ? 'active' : ''}`}
                onClick={() => setActiveTab('golpes')}
              >
                CALIBRACIÓN
              </button>
              <button
                type="button"
                className={`p-hero-tab-pill ${activeTab === 'zonas' ? 'active' : ''}`}
                onClick={() => setActiveTab('zonas')}
              >
                ZONAS & CONTACTO
              </button>
            </div>
          </div>

          {/* Foto destacada del jugador estilo Hero */}
          <div className="p-hero-photo-col">
            <img
              src={player.image || '/assets/logo.png'}
              alt={player.name}
              className="p-hero-cutout-img"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = '/assets/logo.png'
              }}
            />
          </div>
        </div>

        {/* 4 STAT CARDS ESPECÍFICAS DE LA MODALIDAD */}
        <div className="p-hero-stat-cards-row">
          <div className="p-hero-stat-card">
            <span className="stat-card-label">
              {selectedModality === 'dobles' ? 'Ranking Dobles' : 'Ranking Singles'}
            </span>
            <strong className="stat-card-value text-white">
              #{activeProfile.position ? parseInt(activeProfile.position, 10) : (player.position ? parseInt(player.position, 10) : 1)}
            </strong>
          </div>

          <div className="p-hero-stat-card">
            <span className="stat-card-label">
              {selectedModality === 'dobles' ? 'Títulos Dobles' : 'Títulos Singles'}
            </span>
            <strong className="stat-card-value text-green">
              {selectedModality === 'dobles'
                ? (profiles.dobles?.titulos ?? 0)
                : (profiles.singles?.titulosGanados ?? profiles.singles?.titulos ?? player.titulosGanados ?? player.titulos ?? 0)}{' '}
              <span className="trophy-emoji">🏆</span>
            </strong>
          </div>

          <div className="p-hero-stat-card">
            <span className="stat-card-label">
              {selectedModality === 'dobles' ? 'Partidos Dobles (G/P)' : 'Partidos Singles (G/P)'}
            </span>
            <strong className="stat-card-value text-white">
              {activeProfile.partidosGanados ?? wonMatches}G - {activeProfile.partidosPerdidos ?? lostMatches}P
            </strong>
          </div>

          <div className="p-hero-stat-card">
            <span className="stat-card-label">
              {selectedModality === 'dobles' ? 'Puntos Dobles' : 'Puntos Singles'}
            </span>
            <strong className="stat-card-value text-green">
              {activeProfile.points || (activeProfile.puntosNum ? `${activeProfile.puntosNum.toLocaleString()} pts` : '0 pts')}
            </strong>
          </div>
        </div>

        {/* CONTENIDO DE LA PESTAÑA SELECCIONADA */}
        <div className="p-hero-details-container">
          {/* PESTAÑA 1: ÚLTIMOS PARTIDOS Y PUNTOS GANADOS EN LA MODALIDAD */}
          {activeTab === 'partidos' && (
            <div className="p-tab-panel">
              <div className="p-matches-header-strip">
                <div>
                  <h3 className="p-tab-heading" style={{ marginBottom: '4px' }}>
                    {selectedModality === 'dobles'
                      ? 'Historial de Partidos en Dobles'
                      : 'Historial de Partidos en Singles'}
                  </h3>
                  <p className="p-tab-subtitle">
                    {selectedModality === 'dobles'
                      ? 'Partidos oficiales disputados en dobles y los puntos individuales sumados al ranking de dobles.'
                      : 'Partidos individuales disputados y los puntos oficiales otorgados al ranking de singles.'}
                  </p>
                </div>
                <div className="p-matches-summary-badges">
                  <span className="p-summary-pill">
                    <strong>{totalMatches}</strong> {selectedModality === 'dobles' ? 'partidos dobles' : 'partidos singles'}
                  </span>
                  <span className="p-summary-pill win">
                    <strong>{wonMatches}</strong> victorias
                  </span>
                  <span className="p-summary-pill pts">
                    <Flame size={14} /> <strong>+{totalPointsGained}</strong> pts ganados
                  </span>
                </div>
              </div>

              {currentMatches.length === 0 ? (
                <div className="p-empty-matches">
                  <Calendar size={32} />
                  <p>Aún no registra partidos finalizados en la modalidad de {selectedModality === 'dobles' ? 'Dobles' : 'Singles'}.</p>
                </div>
              ) : (
                <div className="p-matches-grid-list">
                  {currentMatches.map((m) => {
                    const isWin = m.resultado === 'victoria'
                    const isDoubles = m.modalidad === 'dobles'

                    return (
                      <div
                        key={m.id}
                        className={`p-match-card ${isWin ? 'is-win' : 'is-loss'}`}
                      >
                        <div className="p-match-card-top">
                          <div className="p-match-tourney-info">
                            <span className="p-match-tourney-name">{m.torneo}</span>
                            <span className="p-match-date">{m.fecha}</span>
                          </div>
                          <div className="p-match-points-badge">
                            <Award size={15} />
                            <strong>+{m.puntosGanados} PTS</strong>
                          </div>
                        </div>

                        <div className="p-match-card-body">
                          <div className="p-match-format-tag">
                            {isDoubles ? (
                              <span className="format-badge doubles">
                                👥 Dobles • Dupla con <strong>{m.pareja || player.parejaReciente || 'Compañero'}</strong>
                              </span>
                            ) : (
                              <span className="format-badge singles">
                                👤 Singles Individual
                              </span>
                            )}
                            <span className="round-badge">{m.ronda}</span>
                          </div>

                          <div className="p-match-versus-row">
                            <div className="p-match-side player-side">
                              <span className="side-label">Jugador:</span>
                              <strong className="side-name">
                                {player.name}
                                {isDoubles && ` & ${m.pareja || player.parejaReciente || 'Dupla'}`}
                              </strong>
                            </div>

                            <div className="p-match-vs-pill">VS</div>

                            <div className="p-match-side rival-side">
                              <span className="side-label">Rival(es):</span>
                              <strong className="side-name">{m.rivales}</strong>
                            </div>
                          </div>

                          <div className="p-match-footer-row">
                            <div className="p-match-score-block">
                              <span className="score-label">Marcador:</span>
                              <strong className="score-value">{m.marcador}</strong>
                            </div>

                            <span className={`result-tag ${isWin ? 'win' : 'loss'}`}>
                              {isWin ? '✓ Victoria' : '✗ Derrota'}
                            </span>
                          </div>

                          {m.detalle && (
                            <div className="p-match-subdetail">
                              <span>⭐ {m.detalle}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA 2: FICHA TÉCNICA */}
          {activeTab === 'ficha' && (
            <div className="p-tab-panel">
              <h3 className="p-tab-heading">Ficha Técnica Oficial del Jugador</h3>
              <div className="p-profile-data-grid">
                <div className="p-data-box">
                  <span className="p-data-k">Mano Dominante</span>
                  <strong className="p-data-v">
                    🎾 {player.manoDominante || player.mano || 'Diestro'}
                  </strong>
                </div>

                <div className="p-data-box">
                  <span className="p-data-k">Golpe Estrella</span>
                  <strong className="p-data-v">
                    ⭐ {player.mejorGolpe || player.golpe || 'Drive cruzado'}
                  </strong>
                </div>

                <div className="p-data-box">
                  <span className="p-data-k">Estado de Afiliación</span>
                  <strong className="p-data-v">
                    Jugador Oficial ATAP <span className="verified-badge-micro">✓ Verificado</span>
                  </strong>
                </div>

                <div className="p-data-box">
                  <span className="p-data-k">Género</span>
                  <strong className="p-data-v">👤 {player.genero || 'Masculino'}</strong>
                </div>

                <div className="p-data-box">
                  <span className="p-data-k">Club de Afiliación</span>
                  <strong className="p-data-v">{player.club || 'Circuito Amateur ATAP'}</strong>
                </div>

                <div className="p-data-box">
                  <span className="p-data-k">Medidas Deportivas</span>
                  <strong className="p-data-v">
                    {player.altura || '1.74m'} • {player.peso || '70kg'}
                  </strong>
                </div>

                {player.parejaReciente && (
                  <div className="p-data-box">
                    <span className="p-data-k">Dupla Reciente en Dobles</span>
                    <strong className="p-data-v">👥 {player.parejaReciente}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PESTAÑA 3: CALIBRACIÓN DE GOLPES */}
          {activeTab === 'golpes' && (
            <div className="p-tab-panel">
              <h3 className="p-tab-heading">Calibración y Nivel de Golpes en Cancha</h3>
              <div className="p-skills-bars-grid">
                {[
                  { key: 'drive', label: 'Drive / Golpe de derecha', defaultVal: 90 },
                  { key: 'reves', label: 'Revés (1 o 2 manos)', defaultVal: 85 },
                  { key: 'saque', label: 'Servicio / Saque plano', defaultVal: 88 },
                  { key: 'drop', label: 'Drop shot / Dejada corta', defaultVal: 78 },
                  { key: 'slice', label: 'Slice defensivo y cortado', defaultVal: 82 }
                ].map((skill) => {
                  const val = player.calibracionGolpes?.[skill.key] || skill.defaultVal
                  return (
                    <div key={skill.key} className="p-skill-row">
                      <div className="p-skill-info">
                        <span className="p-skill-label">{skill.label}</span>
                        <span className="p-skill-pct">{val}%</span>
                      </div>
                      <div className="p-skill-track-bar">
                        <div className="p-skill-fill-bar" style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* PESTAÑA 4: ZONAS & CONTACTO */}
          {activeTab === 'zonas' && (
            <div className="p-tab-panel">
              <h3 className="p-tab-heading">Zonas de Juego y Disponibilidad Semanal</h3>
              <div className="p-zones-layout-grid">
                <div className="p-zones-block">
                  <span className="p-block-k">📍 Zonas preferidas para partidos:</span>
                  <div className="p-chips-group">
                    {(Array.isArray(player.zonas) && player.zonas.length > 0
                      ? player.zonas
                      : ['Lima Centro', 'Lima Sur']
                    ).map((z) => (
                      <span key={z} className="p-chip-item">
                        📍 {z}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-zones-block">
                  <span className="p-block-k">📅 Días de juego disponibles:</span>
                  <div className="p-days-selector-row">
                    {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map((d) => {
                      const isAvailable = (player.disponibilidad || ['SAB', 'DOM']).includes(d)
                      return (
                        <span
                          key={d}
                          className={`p-day-box ${isAvailable ? 'available' : ''}`}
                        >
                          {d}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>

              {player.telefono && (
                <div className="p-contact-whatsapp-row">
                  <a
                    href={`https://wa.me/51${player.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `¡Hola ${player.name}! Te contacto por medio de la plataforma ATAP para coordinar un partido o torneo.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button button-lime"
                  >
                    <Phone size={15} /> Coordinar Partido por WhatsApp
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
