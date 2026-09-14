import { useState, useEffect } from 'react'
import { Trophy, Medal, Search, Filter, ArrowUpRight } from 'lucide-react'
import { getRanking } from '../../services/atapStorage'
import SimplePage from '../Shared/SimplePage'
import './Ranking.css'

export default function Ranking() {
  const [rankingList, setRankingList] = useState(() => getRanking())
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [search, setSearch] = useState('')

  useEffect(() => {
    function handleUpdate() {
      setRankingList(getRanking())
    }
    window.addEventListener('atap_data_updated', handleUpdate)
    return () => window.removeEventListener('atap_data_updated', handleUpdate)
  }, [])

  const categories = ['Todas', '1ra Categoría', '2da Categoría', '3ra Categoría', '4ta Categoría']

  const filtered = rankingList.filter((p) => {
    const matchCat =
      categoryFilter === 'Todas' ||
      (p.categoria && p.categoria.toLowerCase().includes(categoryFilter.toLowerCase().replace(' categoría', '')))
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const top3 = rankingList.slice(0, 3)

  return (
    <SimplePage
      eyebrow="Circuito Amateur del Perú"
      title="Ranking Oficial ATAP"
      description="Consulta las posiciones actualizadas, puntajes acumulados y estadísticas de todos los jugadores del circuito."
    >
      {/* PODIO TOP 3 */}
      {rankingList.length >= 3 && (
        <section className="ranking-podium-section">
          {/* #2 */}
          <div className="podium-step step-2 panel">
            <div className="podium-medal silver">2</div>
            <img
              src={top3[1]?.image}
              alt={top3[1]?.name}
              className="podium-avatar"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = '/assets/logo.png'
              }}
            />
            <h3>{top3[1]?.name}</h3>
            <span className="podium-cat">{top3[1]?.categoria}</span>
            <strong className="podium-points">{top3[1]?.points}</strong>
          </div>

          {/* #1 (CHAMPION) */}
          <div className="podium-step step-1 panel">
            <div className="podium-crown">
              <Trophy size={28} color="#FFD700" />
            </div>
            <div className="podium-medal gold">1</div>
            <img
              src={top3[0]?.image}
              alt={top3[0]?.name}
              className="podium-avatar champ"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = '/assets/logo.png'
              }}
            />
            <h3>{top3[0]?.name}</h3>
            <span className="podium-cat">{top3[0]?.categoria}</span>
            <strong className="podium-points champ-pts">{top3[0]?.points}</strong>
          </div>

          {/* #3 */}
          <div className="podium-step step-3 panel">
            <div className="podium-medal bronze">3</div>
            <img
              src={top3[2]?.image}
              alt={top3[2]?.name}
              className="podium-avatar"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = '/assets/logo.png'
              }}
            />
            <h3>{top3[2]?.name}</h3>
            <span className="podium-cat">{top3[2]?.categoria}</span>
            <strong className="podium-points">{top3[2]?.points}</strong>
          </div>
        </section>
      )}

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="ranking-toolbar panel">
        <div className="ranking-cat-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
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
            placeholder="Buscar por jugador..."
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
              <tr>
                <th>Posición</th>
                <th>Jugador</th>
                <th>Categoría</th>
                <th>Títulos</th>
                <th>Golpe Fuerte</th>
                <th>Efectividad</th>
                <th>Puntos Acumulados</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((player) => {
                const posNum = parseInt(player.position, 10)
                const isTop1 = posNum === 1
                const isTop3 = posNum <= 3

                return (
                  <tr key={player.id || player.position} className={isTop1 ? 'row-leader' : ''}>
                    <td>
                      <span className={'rank-num-badge' + (isTop1 ? ' gold' : (isTop3 ? ' top' : ''))}>
                        {player.position}
                      </span>
                    </td>
                    <td>
                      <div className="player-cell">
                        <img
                          src={player.image}
                          alt={player.name}
                          className="table-avatar"
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = '/assets/logo.png'
                          }}
                        />
                        <div>
                          <strong>{player.name}</strong>
                          <span className="table-country">🇵🇪 {player.country || 'PER'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="table-cat-badge">{player.categoria}</span>
                    </td>
                    <td>{player.titulos || 0}</td>
                    <td>{player.golpe || '-'}</td>
                    <td>{player.efectividad || '75%'}</td>
                    <td>
                      <strong className="table-points-display">{player.points}</strong>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </SimplePage>
  )
}
