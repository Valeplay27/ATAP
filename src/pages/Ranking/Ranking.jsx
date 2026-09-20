import { useState, useEffect } from 'react'
import { Trophy, Medal, Search, Users, User, Award, Calendar, Lock, Sparkles, CheckCircle2, History } from 'lucide-react'
import {
  getRanking,
  getDoublesRanking,
  getActiveSeasonYear,
  getAvailableSeasons,
  getSeasonRanking,
  OFFICIAL_CATEGORIES,
  normalizeCategory,
  getAssetUrl,
  handleImageFallback
} from '../../services/atapStorage'
import SimplePage from '../Shared/SimplePage'
import PlayerHeroModal from '../../components/PlayerHeroModal/PlayerHeroModal'
import './Ranking.css'

export default function Ranking() {
  const [activeSeasonYear, setActiveSeasonYearState] = useState(() => getActiveSeasonYear())
  const [availableSeasons, setAvailableSeasons] = useState(() => getAvailableSeasons())
  const [selectedSeason, setSelectedSeason] = useState(() => getActiveSeasonYear())
  const [modality, setModality] = useState('singles') // 'singles' | 'dobles'
  const [categoryFilter, setCategoryFilter] = useState('4ta')
  const [search, setSearch] = useState('')
  const [singlesList, setSinglesList] = useState(() => getSeasonRanking(selectedSeason, 'singles'))
  const [doublesList, setDoublesList] = useState(() => getSeasonRanking(selectedSeason, 'dobles'))
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  useEffect(() => {
    function handleUpdate() {
      const activeYear = getActiveSeasonYear()
      setActiveSeasonYearState(activeYear)
      setAvailableSeasons(getAvailableSeasons())
      setSinglesList(getSeasonRanking(selectedSeason, 'singles'))
      setDoublesList(getSeasonRanking(selectedSeason, 'dobles'))
    }
    window.addEventListener('atap_data_updated', handleUpdate)
    return () => window.removeEventListener('atap_data_updated', handleUpdate)
  }, [selectedSeason])

  // Update lists whenever user switches season or modality
  useEffect(() => {
    setSinglesList(getSeasonRanking(selectedSeason, 'singles'))
    setDoublesList(getSeasonRanking(selectedSeason, 'dobles'))
  }, [selectedSeason])

  const categories = OFFICIAL_CATEGORIES
  const isHistorical = String(selectedSeason) !== String(activeSeasonYear)

  const activeRawList = modality === 'singles' ? singlesList : doublesList

  // Filter first by chosen category (No 'Todas' / 'Todos' filter)
  const categoryFiltered = activeRawList.filter((item) => {
    if (!item.categoria) return false
    return normalizeCategory(item.categoria) === normalizeCategory(categoryFilter)
  })

  // Top 3 within the selected category for the podium
  const top3 = categoryFiltered.slice(0, 3)

  // Further filter table rows by search query
  const searchFiltered = categoryFiltered.filter((item) => {
    if (!search.trim()) return true
    const term = search.toLowerCase().trim()
    const matchName = item.name && item.name.toLowerCase().includes(term)
    const matchPartner = item.parejaReciente && item.parejaReciente.toLowerCase().includes(term)
    return matchName || matchPartner
  })

  const hasMultipleSeasons = availableSeasons.length > 1

  return (
    <SimplePage
      eyebrow="Circuito Amateur del Perú"
      title="Ranking Oficial ATAP"
      description="Consulta las posiciones actualizadas, puntajes acumulados y estadísticas de todos los jugadores del circuito por categoría y modalidad."
    >
      {/* INDICADOR DE TEMPORADA: Solo muestra 2026. Cuando acabe el 2026 y haya más años, ahí sí sale el filtro */}
      {!hasMultipleSeasons ? (
        <div className="ranking-single-year-wrap">
          <span className="ranking-single-year-badge">
            <Calendar size={15} /> {activeSeasonYear}
          </span>
        </div>
      ) : (
        <div className="ranking-season-bar panel">
          <div className="ranking-season-header">
            <div className="ranking-season-title">
              <Calendar size={18} className="season-calendar-icon" />
              <span>Temporada:</span>
            </div>
            <div className="ranking-season-pills" role="tablist" aria-label="Seleccionar Temporada">
              {availableSeasons.map((season) => {
                const isSelected = String(selectedSeason) === String(season.year)
                const isCurrentActive = String(season.year) === String(activeSeasonYear)
                return (
                  <button
                    key={season.year}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    className={`season-pill-btn ${isSelected ? 'active' : ''} ${isCurrentActive ? 'pill-active-season' : 'pill-archived-season'}`}
                    onClick={() => setSelectedSeason(season.year)}
                  >
                    {isCurrentActive ? (
                      <>
                        <span className="season-status-dot pulse" />
                        <strong>{season.year}</strong>
                        <span className="season-pill-tag tag-live">En Curso</span>
                      </>
                    ) : (
                      <>
                        <Lock size={13} className="season-lock-icon" />
                        <strong>{season.year}</strong>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* AVISO COMPACTO SOLO SI SE CONSULTA UN AÑO HISTÓRICO FINALIZADO */}
      {hasMultipleSeasons && isHistorical && (
        <div className="season-closed-banner panel">
          <div className="season-banner-badge">
            <Lock size={15} /> Temporada {selectedSeason} (Finalizada)
          </div>
          <div className="season-banner-body">
            <p>Puntajes congelados del 1 de Enero al 31 de Diciembre de {selectedSeason}.</p>
          </div>
        </div>
      )}

      {/* MODALITY SELECTOR (SINGLES vs DOBLES) */}
      <div className="ranking-modality-container">
        <div className="ranking-modality-switcher" role="tablist" aria-label="Modalidad de Ranking">
          <button
            type="button"
            role="tab"
            aria-selected={modality === 'singles'}
            className={`ranking-modality-btn ${modality === 'singles' ? 'active' : ''}`}
            onClick={() => setModality('singles')}
          >
            <User size={18} />
            <span>Ranking Singles {isHistorical && `(${selectedSeason})`}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modality === 'dobles'}
            className={`ranking-modality-btn ${modality === 'dobles' ? 'active' : ''}`}
            onClick={() => setModality('dobles')}
          >
            <Users size={18} />
            <span>Ranking Dobles {isHistorical && `(${selectedSeason})`}</span>
          </button>
        </div>
      </div>

      {/* PODIUM TOP 3 OF SELECTED CATEGORY */}
      {top3.length >= 3 && (
        <section className="ranking-podium-section" aria-label={`Podio Top 3 ${categoryFilter}`}>
          {/* #2 SILVER */}
          <div
            className="podium-step step-2 clickable"
            onClick={() => setSelectedPlayer(top3[1])}
            title={`Ver perfil y partidos de ${top3[1]?.name}`}
          >
            <div className="podium-medal silver" title="2do Lugar">2</div>
            <img
              src={getAssetUrl(top3[1]?.image || '/assets/logo.png')}
              alt={top3[1]?.name}
              className="podium-avatar"
              onError={(e) => handleImageFallback(e, '/assets/logo.png')}
            />
            <h3 title={top3[1]?.name}>{top3[1]?.name}</h3>
            <div className="podium-country-tag">
              <span className="country-flag" aria-hidden="true" />
              <span>{top3[1]?.country || 'PER'}</span>
            </div>
            <span className="podium-cat">{top3[1]?.categoria}</span>
            <strong className="podium-points">{top3[1]?.points}</strong>
            <span className="podium-stat">
              🏆 {top3[1]?.titulosGanados !== undefined ? top3[1]?.titulosGanados : (top3[1]?.titulos || 0)} {(top3[1]?.titulosGanados !== undefined ? top3[1]?.titulosGanados : (top3[1]?.titulos || 0)) === 1 ? 'título' : 'títulos'} • {top3[1]?.efectividad || '75%'}
            </span>
          </div>

          {/* #1 GOLD (CHAMPION) */}
          <div
            className="podium-step step-1 clickable"
            onClick={() => setSelectedPlayer(top3[0])}
            title={`Ver perfil y partidos de ${top3[0]?.name}`}
          >
            <div className="podium-crown">
              <Trophy size={32} color="#FFD700" fill="rgba(255, 215, 0, 0.25)" strokeWidth={2.2} />
            </div>
            <div className="podium-medal gold" title="1er Lugar">1</div>
            <img
              src={getAssetUrl(top3[0]?.image || '/assets/logo.png')}
              alt={top3[0]?.name}
              className="podium-avatar champ"
              onError={(e) => handleImageFallback(e, '/assets/logo.png')}
            />
            <h3 title={top3[0]?.name}>{top3[0]?.name}</h3>
            <div className="podium-country-tag champ-tag">
              <span className="country-flag" aria-hidden="true" />
              <span>{top3[0]?.country || 'PER'}</span>
            </div>
            <span className="podium-cat">{top3[0]?.categoria}</span>
            <strong className="podium-points champ-pts">{top3[0]?.points}</strong>
            <span className="podium-stat champ-stat">
              🏆 {top3[0]?.titulosGanados !== undefined ? top3[0]?.titulosGanados : (top3[0]?.titulos || 0)} {(top3[0]?.titulosGanados !== undefined ? top3[0]?.titulosGanados : (top3[0]?.titulos || 0)) === 1 ? 'título' : 'títulos'} • {top3[0]?.efectividad || '85%'}
            </span>
          </div>

          {/* #3 BRONZE */}
          <div
            className="podium-step step-3 clickable"
            onClick={() => setSelectedPlayer(top3[2])}
            title={`Ver perfil y partidos de ${top3[2]?.name}`}
          >
            <div className="podium-medal bronze" title="3er Lugar">3</div>
            <img
              src={getAssetUrl(top3[2]?.image || '/assets/logo.png')}
              alt={top3[2]?.name}
              className="podium-avatar"
              onError={(e) => handleImageFallback(e, '/assets/logo.png')}
            />
            <h3 title={top3[2]?.name}>{top3[2]?.name}</h3>
            <div className="podium-country-tag">
              <span className="country-flag" aria-hidden="true" />
              <span>{top3[2]?.country || 'PER'}</span>
            </div>
            <span className="podium-cat">{top3[2]?.categoria}</span>
            <strong className="podium-points">{top3[2]?.points}</strong>
            <span className="podium-stat">
              🏆 {top3[2]?.titulosGanados !== undefined ? top3[2]?.titulosGanados : (top3[2]?.titulos || 0)} {(top3[2]?.titulosGanados !== undefined ? top3[2]?.titulosGanados : (top3[2]?.titulos || 0)) === 1 ? 'título' : 'títulos'} • {top3[2]?.efectividad || '70%'}
            </span>
          </div>
        </section>
      )}

      {/* FILTER & SEARCH TOOLBAR (ONLY CATEGORIES - NO "TODAS") */}
      <div className="ranking-toolbar panel">
        <div className="ranking-cat-pills" role="tablist" aria-label="Categorías">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={categoryFilter === cat}
              className={'cat-pill' + (categoryFilter === cat ? ' active' : '')}
              onClick={() => setCategoryFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="ranking-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder={modality === 'singles' ? 'Buscar por jugador...' : 'Buscar por jugador o dupla...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* LEADERBOARD TABLE */}
      <div className="ranking-table-card panel">
        <div className="table-responsive">
          <table className="ranking-main-table">
            <thead>
              {modality === 'singles' ? (
                <tr>
                  <th style={{ width: '80px' }}>Posición</th>
                  <th>Jugador</th>
                  <th>Categoría</th>
                  <th>Títulos</th>
                  <th>Golpe Fuerte</th>
                  <th>Efectividad</th>
                  <th style={{ textAlign: 'right' }}>Puntos Singles</th>
                </tr>
              ) : (
                <tr>
                  <th style={{ width: '80px' }}>Posición</th>
                  <th>Jugador</th>
                  <th>Categoría</th>
                  <th>Títulos Dobles</th>
                  <th>Partidos G/P</th>
                  <th>Efectividad</th>
                  <th style={{ textAlign: 'right' }}>Puntos Dobles</th>
                </tr>
              )}
            </thead>
            <tbody>
              {searchFiltered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="ranking-empty-row">
                    No se encontraron registros en {categoryFilter} con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                searchFiltered.map((item, index) => {
                  const posNum = index + 1
                  const posDisplay = String(posNum).padStart(2, '0')
                  const isTop1 = posNum === 1
                  const isTop3 = posNum <= 3

                  if (modality === 'singles') {
                    return (
                      <tr
                        key={item.id || item.name}
                        className={`ranking-clickable-row ${isTop1 ? 'row-leader' : ''}`}
                        onClick={() => setSelectedPlayer(item)}
                        title={`Ver perfil y partidos de ${item.name}`}
                      >
                        <td>
                          <span className={'rank-num-badge' + (isTop1 ? ' gold' : isTop3 ? ' top' : '')}>
                            {posDisplay}
                          </span>
                        </td>
                        <td>
                          <div className="player-cell">
                            <img
                              src={getAssetUrl(item.image || '/assets/logo.png')}
                              alt={item.name}
                              className="table-avatar"
                              onError={(e) => handleImageFallback(e, '/assets/logo.png')}
                            />
                            <div>
                              <strong>{item.name}</strong>
                              <span className="table-country">
                                <span className="country-flag" aria-hidden="true" /> {item.country || 'PER'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="table-cat-badge">{item.categoria}</span>
                        </td>
                        <td>
                          <span className="table-badge-stat">
                            🏆 {item.titulosGanados !== undefined ? item.titulosGanados : (item.titulos || 0)}
                          </span>
                        </td>
                        <td>{item.mejorGolpe || item.golpe || '-'}</td>
                        <td>
                          <span className="table-eff-badge">{item.efectividad || '75%'}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <strong className="table-points-display">{item.points}</strong>
                        </td>
                      </tr>
                    )
                  }

                  // Modality === 'dobles' (Individual Doubles Ranking)
                  return (
                    <tr
                      key={item.id || item.name}
                      className={`ranking-clickable-row ${isTop1 ? 'row-leader' : ''}`}
                      onClick={() => setSelectedPlayer(item)}
                      title={`Ver perfil y partidos de ${item.name}`}
                    >
                      <td>
                        <span className={'rank-num-badge' + (isTop1 ? ' gold' : isTop3 ? ' top' : '')}>
                          {posDisplay}
                        </span>
                      </td>
                      <td>
                        <div className="player-cell">
                          <img
                            src={getAssetUrl(item.image || '/assets/logo.png')}
                            alt={item.name}
                            className="table-avatar"
                            onError={(e) => handleImageFallback(e, '/assets/logo.png')}
                          />
                          <div>
                            <strong>{item.name}</strong>
                            <span className="table-country">
                              <span className="country-flag" aria-hidden="true" /> {item.country || 'PER'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="table-cat-badge">{item.categoria}</span>
                      </td>
                      <td>
                        <span className="table-badge-stat">🏆 {item.titulos || 0}</span>
                      </td>
                      <td>
                        <span className="table-record-stat">
                          {item.partidosGanados ?? 0}G - {item.partidosPerdidos ?? 0}P
                        </span>
                      </td>
                      <td>
                        <span className="table-eff-badge">{item.efectividad || '75%'}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <strong className="table-points-display">{item.points}</strong>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL HERO DEL JUGADOR CON HISTORIAL DE PARTIDOS Y PUNTOS */}
      {selectedPlayer && (
        <PlayerHeroModal
          player={selectedPlayer}
          initialModality={modality}
          showDobles={true}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </SimplePage>
  )
}
