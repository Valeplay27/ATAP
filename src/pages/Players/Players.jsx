import { useState, useEffect, useMemo } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Filter,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Trophy,
  X
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { getRanking, OFFICIAL_CATEGORIES, normalizeCategory, getAssetUrl, handleImageFallback } from '../../services/atapStorage'
import SimplePage from '../Shared/SimplePage'
import PlayerHeroModal from '../../components/PlayerHeroModal/PlayerHeroModal'
import './Players.css'

export default function Players({ usuario }) {
  const [playerList, setPlayerList] = useState(() => getRanking())
  const [filterCategory, setFilterCategory] = useState('Todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [favorites, setFavorites] = useState(['01'])
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  useEffect(() => {
    function handleUpdate() {
      setPlayerList(getRanking())
    }
    window.addEventListener('atap_data_updated', handleUpdate)
    return () => window.removeEventListener('atap_data_updated', handleUpdate)
  }, [])

  function toggleFavorite(pos) {
    setFavorites((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    )
  }

  const categories = ['Todas', ...OFFICIAL_CATEGORIES]

  // Identificar si el usuario actual es Administrador ("no dejes al admin en jugadores pq no juega")
  const isAdminUser = Boolean(
    usuario &&
      (usuario.esAdmin ||
        usuario.rol === 'admin' ||
        usuario.rol === 'Administrador' ||
        usuario.email?.toLowerCase() === 'vladimiryt18@gmail.com' ||
        usuario.nombre?.toLowerCase().includes('admin') ||
        usuario.categoria?.toLowerCase().includes('comité'))
  )

  // Lista EXCLUSIVA de jugadores reales de tenis (excluyendo a administradores)
  const playersOnly = useMemo(() => {
    return playerList.filter((p) => {
      const name = (p.name || '').toLowerCase()
      const email = (p.email || '').toLowerCase()
      const isPAdmin =
        name.includes('admin') ||
        email.includes('admin') ||
        email === 'vladimiryt18@gmail.com' ||
        p.id === 'user-current-me'
      return !isPAdmin
    })
  }, [playerList])

  const filteredPlayers = playersOnly.filter((player) => {
    const matchesCategory =
      filterCategory === 'Todas' ||
      (player.categoria &&
        normalizeCategory(player.categoria) === normalizeCategory(filterCategory))
    const matchesSearch =
      (player.name && player.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (player.country && player.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (player.categoria && player.categoria.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (player.mejorGolpe && player.mejorGolpe.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <SimplePage
      eyebrow="Comunidad deportiva"
      title="Jugadores ATAP"
      description="Conoce a los mejores jugadores y el ranking oficial del circuito amateur del Perú."
    >
     
      {usuario && !isAdminUser && (
        <section className="players-my-card panel">
          <div className="players-my-card-left">
            <div className="players-my-avatar">
              {usuario.avatar &&
              usuario.avatar !== '/assets/logo.png' &&
              !usuario.avatar.includes('logo.png') ? (
                <img src={getAssetUrl(usuario.avatar)} alt={usuario.nombre} />
              ) : (
                <div className="default-avatar-badge is-atap-logo">
                  <img src={getAssetUrl('/assets/logo.png')} alt="ATAP" className="default-avatar-logo" />
                </div>
              )}
            </div>
            <div>
              <span className="players-kicker">Tu perfil de jugador</span>
              <h2>{usuario.nombre || 'Jugador ATAP'}</h2>
              <div className="players-pill-row">
                <span className="player-badge">
                  {usuario.categoria ? `Categoría ${usuario.categoria}` : 'Jugador Oficial'}
                </span>
                <span className="player-subbadge">
                  ✓ Jugador Verificado
                </span>
                {usuario.manoDominante && <span className="player-subbadge">🎾 {usuario.manoDominante}</span>}
                {usuario.mejorGolpe && <span className="player-subbadge">⭐ {usuario.mejorGolpe}</span>}
              </div>
            </div>
          </div>
          <NavLink to="/perfil" className="button button-lime">
            Ver Mi Perfil Completo <ArrowRight size={15} />
          </NavLink>
        </section>
      )}

      {/* Barra de herramientas: FILTER y SEARCH */}
      <div className="players-toolbar-row">
        <div className="toolbar-left">
          <button
            type="button"
            className={`players-filter-btn ${showFilter ? 'active' : ''}`}
            onClick={() => setShowFilter(!showFilter)}
          >
            <Filter size={14} />
            <span>FILTER</span>
          </button>

          {showFilter && (
            <div className="players-category-chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-chip ${filterCategory === cat ? 'active' : ''}`}
                  onClick={() => setFilterCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="toolbar-right">
          {showSearch ? (
            <div className="players-search-box">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por nombre o categoría..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="search-close-btn"
                onClick={() => {
                  setSearchQuery('')
                  setShowSearch(false)
                }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="players-search-circle-btn"
              onClick={() => setShowSearch(true)}
              aria-label="Buscar jugador"
              title="Buscar jugador"
            >
              <Search size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Grilla 4 Columnas: Tarjetas estilo WTA Pro Cards (Fieles a la imagen 2) */}
      <div className="players-pro-grid">
        {filteredPlayers.map((player) => {
          const rankNum = parseInt(player.position, 10) || 1
          const isFav = favorites.includes(player.position)
          const isHighlight = rankNum === 2 
          const displayPoints = player.puntosNum || parseInt(String(player.points || '0').replace(/\D/g, ''), 10) || 1240

          return (
            <article
              key={player.id || player.position || player.name}
              className={`player-pro-card ${isHighlight ? 'is-highlighted' : ''}`}
              onClick={() => setSelectedPlayer(player)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelectedPlayer(player)
                }
              }}
            >
             
              <div className="player-pro-banner">
                {/* RANK y número grande en verde (#00CFA0 / #C6FF00) */}
                <div className="player-pro-rank-block">
                  <span className="player-rank-label">RANK</span>
                  <span className="player-rank-num">{rankNum}</span>
                </div>

                {/* Botón Favorito estrella en esquina superior derecha */}
                <button
                  type="button"
                  className={`player-fav-star-btn ${isFav ? 'is-fav' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(player.position)
                  }}
                  title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                  aria-label={`Favorito ${player.name}`}
                >
                  <Star
                    size={14}
                    fill={isFav ? '#FFD700' : 'none'}
                    color={isFav ? '#FFD700' : '#FFFFFF'}
                  />
                </button>

                {/* Foto Jugador */}
                <div className="player-pro-photo-wrap">
                  <img
                    src={getAssetUrl(player.image || '/assets/logo.png')}
                    alt={player.name}
                    className="player-pro-photo"
                    onError={(e) => handleImageFallback(e, '/assets/logo.png')}
                  />
                </div>

                {/* Franja horizontal  */}
                <div className="player-pro-points-strip">
                  <span>{displayPoints} POINTS</span>
                </div>
              </div>

              {/* Pie de tarjeta blanco con Nombre en mayúsculas y Bandera */}
              <div className="player-pro-footer">
                <h3 className="player-pro-name">{player.name}</h3>
                <div className="player-pro-country-row">
                  <span className="country-flag" aria-hidden="true" />
                  <span className="country-code">{player.country || 'PER'}</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {/* MODAL / FICHA TÉCNICA EXPANDIDA CON HISTORIAL DE PARTIDOS Y PUNTOS */}
      {selectedPlayer && (
        <PlayerHeroModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </SimplePage>
  )
}


