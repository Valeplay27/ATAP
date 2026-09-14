import { Trophy, Check, Flame } from 'lucide-react'
import './TournamentBracket.css'

export default function TournamentBracket({
  bracket,
  isAdmin = false,
  onOpenScoreModal
}) {
  if (!bracket || !bracket.rounds || bracket.rounds.length === 0) {
    return (
      <div className="bracket-empty-state">
        <Trophy size={40} className="bracket-empty-icon" />
        <h3>Llaves aún no generadas</h3>
        <p>El administrador realizará el sorteo oficial con los jugadores inscritos y confirmados.</p>
      </div>
    )
  }

  return (
    <div className="bracket-container">
      {bracket.champion && (
        <div className="bracket-champion-banner">
          <div className="champion-badge">
            <Trophy size={28} className="champion-icon" />
            <div>
              <span className="champion-kicker">¡CAMPEÓN DEL TORNEO!</span>
              <h2 className="champion-name">{bracket.champion.name}</h2>
              <span className="champion-category">{bracket.champion.categoria || '1ra Categoría'}</span>
            </div>
          </div>
          <div className="champion-points-tag">
            <span>+250 Puntos al Ranking</span>
          </div>
        </div>
      )}

      <div className="bracket-rounds-wrapper">
        {bracket.rounds.map((round, rIndex) => (
          <div className="bracket-round-column" key={round.name || rIndex}>
            <div className="round-column-header">
              <span className="round-badge">{round.name}</span>
              <small className="round-matches-count">
                {round.matches.length} {round.matches.length === 1 ? 'partido' : 'partidos'}
              </small>
            </div>

            <div className="round-matches-list">
              {round.matches.map((match) => {
                const hasPlayer1 = Boolean(match.player1 && match.player1.name)
                const hasPlayer2 = Boolean(match.player2 && match.player2.name)
                const canScore = isAdmin && hasPlayer1 && hasPlayer2 && !match.winnerSlot

                return (
                  <div
                    key={match.id}
                    className={'match-node-card' + (match.winnerSlot ? ' match-completed' : '')}
                  >
                    <div className="match-node-header">
                      <span>Match #{match.matchNum}</span>
                      {match.score && <span className="match-final-score">{match.score}</span>}
                    </div>

                    <div className="match-participants">
                      <div className={'player-slot' + (match.winnerSlot === 1 ? ' is-winner' : (match.winnerSlot === 2 ? ' is-loser' : ''))}>
                        <div className="player-slot-info">
                          <span className="player-slot-name">
                            {hasPlayer1 ? match.player1.name : 'Por definir'}
                          </span>
                          {hasPlayer1 && match.player1.categoria && (
                            <span className="player-slot-cat">{match.player1.categoria}</span>
                          )}
                        </div>
                        {match.winnerSlot === 1 && (
                          <span className="winner-tick"><Check size={14} /></span>
                        )}
                      </div>

                      <div className="match-vs-divider">vs</div>

                      <div className={'player-slot' + (match.winnerSlot === 2 ? ' is-winner' : (match.winnerSlot === 1 ? ' is-loser' : ''))}>
                        <div className="player-slot-info">
                          <span className="player-slot-name">
                            {hasPlayer2 ? match.player2.name : 'Por definir'}
                          </span>
                          {hasPlayer2 && match.player2.categoria && (
                            <span className="player-slot-cat">{match.player2.categoria}</span>
                          )}
                        </div>
                        {match.winnerSlot === 2 && (
                          <span className="winner-tick"><Check size={14} /></span>
                        )}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="match-admin-actions">
                        {canScore && onOpenScoreModal && (
                          <button
                            type="button"
                            className="btn-enter-score"
                            onClick={() => onOpenScoreModal(match)}
                          >
                            <Flame size={12} /> Cargar Marcador
                          </button>
                        )}
                        {match.winnerSlot && onOpenScoreModal && (
                          <button
                            type="button"
                            className="btn-edit-score"
                            onClick={() => onOpenScoreModal(match)}
                          >
                            Editar Marcador ({match.score})
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
