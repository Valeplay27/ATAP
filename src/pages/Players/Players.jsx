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
import { NavLink, useSearchParams } from 'react-router-dom'
import {
  getRanking,
  OFFICIAL_CATEGORIES,
  normalizeCategory,
  getAssetUrl,
  handleImageFallback,
  getUserFollowedPlayers,
  toggleUserFollowedPlayer,
  isPlayerFollowed
} from '../../services/atapStorage'
import SimplePage from '../Shared/SimplePage'
import PlayerHeroModal from '../../components/PlayerHeroModal/PlayerHeroModal'
import './Players.css'

export default function Players({ usuario, onOpenLogin }) {
  const [playerList, setPlayerList] = useState(() => getRanking())
  const [filterCategory, setFilterCategory] = useState('Todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const isSeguidosFromUrl = searchParams.get('filtro') === 'seguidos'
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(isSeguidosFromUrl)

  const userKey = usuario ? (usuario.email || usuario.id || usuario.documentoIdentidad || usuario.nombre) : null
  const [favorites, setFavorites] = useState(() => userKey ? getUserFollowedPlayers(userKey) : [])
  const [authNotice, setAuthNotice] = useState({ visible: false, message: '', isSuccess: false })

  useEffect(() => {
    if (searchParams.get('filtro') === 'seguidos') {
      setShowOnlyFavorites(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (userKey) {
      setFavorites(getUserFollowedPlayers(userKey))
    } else {
      setFavorites([])
    }
  }, [userKey])

  useEffect(() => {
    function handleFavUpdate() {
      if (userKey) {
        setFavorites(getUserFollowedPlayers(userKey))
      }
    }
    window.addEventListener('atap_favorites_updated', handleFavUpdate)
    return () => window.removeEventListener('atap_favorites_updated', handleFavUpdate)
  }, [userKey])

  useEffect(() => {
    if (authNotice.visible) {
      const timer = setTimeout(() => {
        setAuthNotice({ visible: false, message: '', isSuccess: false })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [authNotice.visible])

  useEffect(() => {
    function handleUpdate() {
      setPlayerList(getRanking())
    }
    window.addEventListener('atap_data_updated', handleUpdate)
    return () => window.removeEventListener('atap_data_updated', handleUpdate)
  }, [])

  function toggleFavorite(player) {
    if (!usuario) {
      setAuthNotice({
        visible: true,
        message: 'Solo puedes agregar jugadores a favoritos si inicias sesión.',
        isSuccess: false
      })
      return
    }
    const updated = toggleUserFollowedPlayer(userKey, player)
    setFavorites(updated)
    const isNowFav = isPlayerFollowed(updated, player)
    setAuthNotice({
      visible: true,
      message: isNowFav
        ? `⭐ Agregaste a ${player.name} a tus jugadores seguidos`
        : `Eliminaste a ${player.name} de tus jugadores seguidos`,
      isSuccess: isNowFav
    })
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
    if (showOnlyFavorites && !isPlayerFollowed(favorites, player)) {
      return false
    }
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
      {/* Alerta / Toast flotante informativa sobre favoritos y autenticación */}
      {authNotice.visible && (
        <div
          className={`players-auth-notice-toast ${authNotice.isSuccess ? 'is-success' : 'is-warning'}`}
          role="alert"
        >
          <div className="notice-icon">
            {authNotice.isSuccess ? '⭐' : '⚠️'}
          </div>
          <div className="notice-body">
            <span>{authNotice.message}</span>
          </div>
          {!authNotice.isSuccess && !usuario && onOpenLogin && (
            <button
              type="button"
              className="notice-login-action-btn"
              onClick={() => {
                setAuthNotice({ visible: false, message: '', isSuccess: false })
                onOpenLogin()
              }}
            >
              Iniciar sesión
            </button>
          )}
          <button
            type="button"
            className="notice-close-action-btn"
            onClick={() => setAuthNotice({ visible: false, message: '', isSuccess: false })}
            aria-label="Cerrar aviso"
          >
            <X size={14} />
          </button>
        </div>
      )}

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

      {/* Barra de herramientas: FILTER, SEGUIDOS y SEARCH */}
      <div className="players-toolbar-row">
        <div className="toolbar-left">
          <div className="toolbar-left-actions">
            <button
              type="button"
              className={`players-filter-btn ${showFilter ? 'active' : ''}`}
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter size={14} />
              <span>FILTER</span>
            </button>

            <button
              type="button"
              className={`players-followed-btn ${showOnlyFavorites ? 'active' : ''}`}
              onClick={() => {
                if (!usuario && !showOnlyFavorites) {
                  setAuthNotice({
                    visible: true,
                    message: 'Solo puedes ver tus jugadores seguidos si inicias sesión.',
                    isSuccess: false
                  })
                }
                const next = !showOnlyFavorites
                setShowOnlyFavorites(next)
                if (next) {
                  setSearchParams({ filtro: 'seguidos' })
                } else {
                  const newParams = new URLSearchParams(searchParams)
                  newParams.delete('filtro')
                  setSearchParams(newParams)
                }
              }}
              title={showOnlyFavorites ? 'Ver todos los jugadores' : 'Ver solo mis jugadores seguidos'}
            >
              <Star
                size={14}
                fill={showOnlyFavorites ? '#FFD700' : 'none'}
                color={showOnlyFavorites ? '#B45309' : '#E6A100'}
              />
              <span>SEGUIDOS {favorites.length > 0 ? `(${favorites.length})` : ''}</span>
            </button>
          </div>

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

      {/* Estado Vacío de Seguidos */}
      {showOnlyFavorites && filteredPlayers.length === 0 ? (
        <div className="players-empty-seguidos-panel">
          <div className="empty-seguidos-icon">⭐</div>
          <h3>No tienes jugadores seguidos aún</h3>
          <p>
            {usuario
              ? 'Presiona la estrella en la tarjeta de cualquier jugador para guardarlo en tus favoritos y seguir su evolución en el ranking.'
              : 'Solo puedes agregar y consultar jugadores seguidos si inicias sesión.'}
          </p>
          <div className="empty-seguidos-actions">
            {!usuario && onOpenLogin ? (
              <button
                type="button"
                className="button button-lime"
                onClick={onOpenLogin}
              >
                Iniciar sesión
              </button>
            ) : (
              <button
                type="button"
                className="button button-lime"
                onClick={() => {
                  setShowOnlyFavorites(false)
                  const newParams = new URLSearchParams(searchParams)
                  newParams.delete('filtro')
                  setSearchParams(newParams)
                }}
              >
                Explorar todos los jugadores
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Grilla 4 Columnas: Tarjetas estilo WTA Pro Cards */
        <div className="players-pro-grid">
          {filteredPlayers.map((player) => {
            const rankNum = parseInt(player.position, 10) || 1
            const isFav = isPlayerFollowed(favorites, player)
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
                      toggleFavorite(player)
                    }}
                    title={!usuario ? 'Inicia sesión para guardar en favoritos' : (isFav ? 'Quitar de favoritos' : 'Guardar en favoritos')}
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
      )}

      {/* MODAL / FICHA TÉCNICA EXPANDIDA CON HISTORIAL DE PARTIDOS Y PUNTOS */}
      {selectedPlayer && (
        <PlayerHeroModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          favorites={favorites}
          onToggleFavorite={(p) => toggleFavorite(selectedPlayer)}
          usuario={usuario}
          onOpenLogin={onOpenLogin}
          showDobles={false}
          initialModality="singles"
        />
      )}
    </SimplePage>
  )
}


