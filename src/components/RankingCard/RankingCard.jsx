import { Star } from 'lucide-react'
import './RankingCard.css'

export default function RankingCard({ player }) {
  return (
    <article className="ranking-card">
      <div className="ranking-position">{player.position}</div>
      <img
        src={player.image}
        alt={player.name}
        onError={(e) => {
          e.target.onerror = null
          e.target.src = '/assets/logo.png'
        }}
      />
      <a
        className="ranking-favorite"
        href="#ranking"
        aria-label={`Guardar a ${player.name}`}
      >
        <Star size={18} />
      </a>
      <div className="ranking-info">
        <h3>{player.name}</h3>
        <small className="ranking-country">
          <span className="country-flag" aria-hidden="true" />
          <span className="country-code">{player.country}</span>
        </small>
      </div>
      <strong className="ranking-points">{player.points}</strong>
    </article>
  )
}