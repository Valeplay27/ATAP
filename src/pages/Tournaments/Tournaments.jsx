import TournamentCard from '../../components/TournamentCard/TournamentCard'
import { tournaments } from '../../data/tournaments'
import './Tournaments.css'

export default function Tournaments() {
  return (
    <main className="page-content tournaments-page">
      <div className="tournaments-content-shell">
        <section className="page-heading">
          <p className="eyebrow">Calendario ATAP</p>
          <h1>Todos los torneos</h1>
          <p>
            Revisa las próximas competencias y encuentra el torneo ideal para ti.
          </p>
        </section>

        <div className="tournaments-wrapper">
          <section className="tournaments-page-list">
            {tournaments.map((tournament) => (
              <TournamentCard
                tournament={tournament}
                key={tournament.title}
              />
            ))}
          </section>
        </div>
      </div>
    </main>
  )
}
