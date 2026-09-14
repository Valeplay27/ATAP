import { useState, useEffect } from 'react'
import { ArrowRight, Filter, Search, Star, Trophy, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { getRanking } from '../../services/atapStorage'
import SimplePage from '../Shared/SimplePage'
import './Players.css'

export default function Players({ usuario }) {
  const [playerList, setPlayerList] = useState(() => getRanking())
  const [filterCategory, setFilterCategory] = useState('Todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [favorites, setFavorites] = useState(['01'])

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

  const categories = ['Todas', '1ra Categoría', '2da Categoría', '3ra Categoría', '4ta Categoría']

  const filteredPlayers = playerList.filter((player) => {
    const matchesCategory =
      filterCategory === 'Todas' ||
      (player.categoria &&
        player.categoria.toLowerCase().includes(filterCategory.toLowerCase().replace(' categoría', '')))
    const matchesSearch =
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.country.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <SimplePage
      eyebrow="Comunidad deportiva"
      title="Jugadores ATAP"
      description="Conoce a los mejores jugadores y el ranking oficial del circuito amateur del Perú."
    >
      {usuario && (
        <section className="players-my-card panel">
          <div className="players-my-card-left">
            <div className="players-my-avatar">
              {usuario.avatar ? (
                <img src={usuario.avatar} alt={usuario.nombre} />
              ) : (
                <div className="default-avatar-badge">
                  <img src="/assets/logo.png" alt="ATAP" className="default-avatar-logo" />
                </div>
              )}
            </div>
            <div>
              <span className="players-kicker">Tu perfil registrado</span>
              <h2>{usuario.nombre || 'Jugador ATAP'}</h2>
              <div className="players-pill-row">
                <span className="player-badge">
                  {usuario.categoria ? `Categoría ${usuario.categoria}` : 'Jugador Oficial'}
                </span>
                {usuario.manoDominante && <span className="player-subbadge">🎾 {usuario.manoDominante}</span>}
                {usuario.mejorGolpe && <span className="player-subbadge">⭐ {usuario.mejorGolpe}</span>}
                {usuario.titulosGanados && usuario.titulosGanados !== '0' && (
                  <span className="player-subbadge">
                    🏆 {usuario.titulosGanados} {usuario.titulosGanados === '1' ? 'título' : 'títulos'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <NavLink to="/perfil" className="button button-lime">
            Ver Mi Perfil Completo <ArrowRight size={15} />
          </NavLink>
        </section>
      )}

      {/* Barra de herramientas: FILTER y SEARCH (referencia media_1789321996820.png) */}
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
                placeholder="Buscar por nombre..."
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

      {/* Grilla 4 columnas de Jugadores estilo WTA/ATP Pro Cards (media_1789321996820.png) */}
      <div className="players-pro-grid">
        {filteredPlayers.map((player) => {
          const rankNum = parseInt(player.position, 10)
          const isFav = favorites.includes(player.position)
          const isHighlight = rankNum === 2 // Destacado verde como en la captura

          const displayPoints = player.puntosNum || parseInt(player.points.replace(/\D/g, ''), 10)

          return (
            <article
              key={player.position}
              className={`player-pro-card ${isHighlight ? 'is-highlighted' : ''}`}
            >
              <div className="player-pro-banner">
                {/* RANK y número grande en verde (#00E599) */}
                <div className="player-pro-rank-block">
                  <span className="player-rank-label">RANK</span>
                  <span className="player-rank-num">{rankNum}</span>
                </div>

                {/* Botón Favorito estrella */}
                <button
                  type="button"
                  className={`player-fav-star-btn ${isFav ? 'is-fav' : ''}`}
                  onClick={() => toggleFavorite(player.position)}
                  title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                  aria-label={`Favorito ${player.name}`}
                >
                  <Star
                    size={15}
                    fill={isFav ? '#FFD700' : 'none'}
                    color={isFav ? '#FFD700' : '#FFFFFF'}
                  />
                </button>

                {/* Foto recortada del jugador */}
                <div className="player-pro-photo-wrap">
                  <img
                    src={player.image}
                    alt={player.name}
                    className="player-pro-photo"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = '/assets/logo.png'
                    }}
                  />
                </div>

                {/* Franja horizontal de puntos */}
                <div className="player-pro-points-strip">
                  <span>{displayPoints} POINTS</span>
                </div>
              </div>

              {/* Pie de tarjeta con Nombre y Bandera */}
              <div className="player-pro-footer">
                <h3 className="player-pro-name">{player.name}</h3>
                <div className="player-pro-country-row">
                  <span className="country-flag">🇵🇪</span>
                  <span className="country-code">{player.country || 'PER'}</span>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </SimplePage>
  )
}
