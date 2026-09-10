import { ChevronRight, Medal } from 'lucide-react'
import './RankingCard.css'

export default function RankingCard({ player }) {
  return <article className="ranking-card"><div className="ranking-position"><Medal size={13} /> {player.position}</div><img src={player.image} alt={player.name} /><div className="ranking-info"><h3>{player.name}</h3><small>{player.category}</small><small>{player.points}</small></div><a className="round-arrow" href="#ranking" aria-label={`Ver perfil de ${player.name}`}><ChevronRight size={16} /></a></article>
}