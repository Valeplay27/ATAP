import { CalendarDays, ChevronRight, Clock3 } from 'lucide-react'
import { getAssetUrl, handleImageFallback } from '../../services/atapStorage'
import './TournamentCard.css'

export default function TournamentCard({ tournament }) {
  return (
    <article className="tournament-card">
      <img
        src={getAssetUrl(tournament?.image || '/assets/Evento.png')}
        alt={tournament?.title}
        onError={(e) => handleImageFallback(e, '/assets/Evento.png')}
      />
      <div className="tournament-info">
        <span className="tag">{tournament.level}</span>
        <h3>{tournament.title}</h3>
        <small>
          <CalendarDays size={11} /> {tournament.place}
        </small>
        <small>
          <Clock3 size={11} /> {tournament.date}
        </small>
      </div>
      <a className="round-arrow" href="#detalle" aria-label={`Ver ${tournament.title}`}>
        <ChevronRight size={16} />
      </a>
    </article>
  );
}