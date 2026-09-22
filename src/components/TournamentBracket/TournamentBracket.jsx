import { Trophy, Check, Flame, Users, Calendar, Zap } from 'lucide-react'
import './TournamentBracket.css'

export default function TournamentBracket({
  bracket,
  isAdmin = false,
  onOpenScoreModal,
  isInteractive = false,
  manualGroups = [],
  availableGroupPlayers = [],
  onAssignPlayerToSlot,
  onSwapMatchSlots,
  onClearMatchSlot,
  onAssignBye,
  onUpdateMatchHora,
  onToggleMatchLive
}) {
  const hasRounds = Boolean(bracket && bracket.rounds && bracket.rounds.length > 0)
  const hasGroups = Boolean(bracket && bracket.faseGrupos && bracket.faseGrupos.length > 0)
  const groupsList = manualGroups && manualGroups.length > 0 ? manualGroups : (bracket?.faseGrupos || [])

  const norm = (str) => (str || '').trim().toLowerCase()

  const arePlayersMatching = (p1, p2) => {
    if (!p1 || !p2) return false
    if (p1.isBye || p2.isBye || p1.id === 'bye' || p2.id === 'bye' || p1.name === 'BYE' || p2.name === 'BYE') return false
    const id1 = p1.id
    const id2 = p2.id
    if (id1 && id2 && id1 === id2) return true

    const dni1 = (p1.dni || '').toString().trim()
    const dni2 = (p2.dni || '').toString().trim()
    if (dni1 && dni2 && dni1 === dni2) return true

    const name1 = norm(p1.nombre || p1.name)
    const name2 = norm(p2.nombre || p2.name)
    if (name1 && name2 && name1 === name2) return true

    return false
  }

  const findGroupForPlayer = (player) => {
    if (!player) return null
    if (player.grupoNombre) return player.grupoNombre
    for (const g of groupsList) {
      if (
        (g.participantes || []).some(
          (p) => arePlayersMatching(player, p)
        )
      ) {
        return g.nombre
      }
    }
    return null
  }

  // Helper de validación para primera ronda (reglas de asignación única y contra sí mismo)
  const getPlayerAssignmentStatus = (participant, currentMatchId, targetSlot) => {
    if (!participant) return { isAvailable: true, label: '' }

    const firstRound = bracket?.rounds?.[0]
    if (!firstRound || !firstRound.matches) {
      return {
        isAvailable: true,
        label: `${participant.nombre} (${participant.categoria || '4ta'})`
      }
    }

    // 1. REGLA: No permitir el mismo jugador en el mismo campo/partido
    const currentMatch = firstRound.matches.find((m) => m.id === currentMatchId)
    if (currentMatch) {
      const opposingPlayer = targetSlot === 1 ? currentMatch.player2 : currentMatch.player1
      if (opposingPlayer && arePlayersMatching(participant, opposingPlayer)) {
        return {
          isAvailable: false,
          reason: 'same_match',
          label: `🚫 ${participant.nombre} (Mismo partido — No permitido)`
        }
      }
    }

    // 2. REGLA: No permitir jugador ya asignado o que ya jugó en otra llave de esta ronda activa
    for (const m of firstRound.matches) {
      if (m.id === currentMatchId) continue

      const inP1 = arePlayersMatching(participant, m.player1)
      const inP2 = arePlayersMatching(participant, m.player2)

      if (inP1 || inP2) {
        if (m.winnerSlot != null) {
          return {
            isAvailable: false,
            reason: 'already_played',
            label: `🔒 ${participant.nombre} (Ya jugó en Match #${m.matchNum})`
          }
        } else {
          return {
            isAvailable: false,
            reason: 'already_assigned',
            label: `⚠️ ${participant.nombre} (Ya asignado en Match #${m.matchNum})`
          }
        }
      }
    }

    return {
      isAvailable: true,
      label: `${participant.nombre} (${participant.categoria || '4ta'})`
    }
  }

  // Detectar si un jugador está asignado en más de un partido de la ronda
  const isPlayerDuplicatedInRound = (player, currentMatchId) => {
    if (!player || player.isBye || player.id === 'bye' || player.name === 'BYE' || !bracket?.rounds?.[0]?.matches) return false
    const matches = bracket.rounds[0].matches
    for (const m of matches) {
      if (m.id === currentMatchId) continue
      if (arePlayersMatching(player, m.player1) || arePlayersMatching(player, m.player2)) {
        return true
      }
    }
    return false
  }

  if (!bracket || (!hasRounds && !hasGroups)) {
    return (
      <div className="bracket-empty-state">
        <Trophy size={40} className="bracket-empty-icon" />
        <h3>Llaves y Fase de Grupos aún no generadas</h3>
        <p>El administrador realizará el sorteo manual asignando a los jugadores aprobados en los grupos correspondientes.</p>
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
              <span className="champion-category">{bracket.champion.categoria || '4ta'}</span>
            </div>
          </div>
          <div className="champion-points-tag">
            <span>+250 Puntos al Ranking</span>
          </div>
        </div>
      )}

      {/* FASE DE GRUPOS SECTION */}
      {hasGroups && (
        <div className="bracket-groups-section">
          <div className="bracket-section-header">
            <Users size={18} color="#00CFA0" />
            <h3>Fase de Grupos del Torneo</h3>
            <span className="section-badge-pill">{bracket.faseGrupos.length} Grupos</span>
          </div>

          <div className="bracket-groups-grid">
            {bracket.faseGrupos.map((grupo) => {
              const players = grupo.participantes || []
              const matches = grupo.partidos || []

              return (
                <div className="bracket-group-card" key={grupo.id}>
                  <div className="group-card-header">
                    <h4>{grupo.nombre}</h4>
                    <span className="group-players-count">
                      {players.length} {players.length === 1 ? 'jugador' : 'jugadores'}
                    </span>
                  </div>

                  {/* PLAYERS LIST */}
                  <div className="group-players-list">
                    {players.length === 0 ? (
                      <div className="group-empty-hint">Sin participantes asignados</div>
                    ) : (
                      players.map((p, idx) => (
                        <div className="group-player-row" key={p.id || idx}>
                          <span className="group-pos-num">{idx + 1}</span>
                          <span className="group-player-name">{p.nombre}</span>
                          {p.categoria && (
                            <span className="group-player-cat">{p.categoria}</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* GROUP MATCHES */}
                  {matches.length > 0 && (
                    <div className="group-matches-block">
                      <div className="group-matches-title-row">
                        <span className="group-matches-title">Partidos del Grupo:</span>
                        {matches.some((m) => m.esGrupal || m.subtipo) && (
                          <span className="group-matches-mode-pill">🏆 2 Singles + 1 Dobles por Fecha</span>
                        )}
                      </div>

                      <div className="group-matches-sublist">
                        {(() => {
                          const isGrupalGroup = matches.some((m) => m.esGrupal || m.subtipo || m.fechaNum)

                          const renderMatchCard = (m) => {
                            const canScore = isAdmin && m.player1?.name && m.player2?.name && !m.winnerSlot

                            return (
                              <div className={'group-match-item' + (m.winnerSlot ? ' completed' : '')} key={m.id}>
                                <div className="group-match-header-row">
                                  <div className="match-header-tags">
                                    <small className="match-num-tag">Match #{m.matchNum}</small>
                                    {m.subtipo && (
                                      <span className={`match-subtipo-pill ${m.modalidad === 'dobles' ? 'pill-dobles' : 'pill-singles'}`}>
                                        {m.subtipo === 'Dobles' ? '👥 Dobles' : `🎾 ${m.subtipo}`}
                                      </span>
                                    )}
                                  </div>
                                  {m.score && <span className="group-match-score">{m.score}</span>}
                                </div>
                                <div className="group-match-players">
                                  <span className={m.winnerSlot === 1 ? 'match-winner-name' : ''}>
                                    {m.player1?.name || 'P1'}
                                    {m.winnerSlot === 1 && ' ✓'}
                                  </span>
                                  <span className="vs-tag">vs</span>
                                  <span className={m.winnerSlot === 2 ? 'match-winner-name' : ''}>
                                    {m.player2?.name || 'P2'}
                                    {m.winnerSlot === 2 && ' ✓'}
                                  </span>
                                </div>

                                {isAdmin && onOpenScoreModal && (
                                  <div className="group-match-admin-actions">
                                    {canScore ? (
                                      <button
                                        type="button"
                                        className="btn-enter-score-mini"
                                        onClick={() => onOpenScoreModal(m)}
                                      >
                                        <Flame size={11} /> Cargar Marcador
                                      </button>
                                    ) : m.winnerSlot ? (
                                      <button
                                        type="button"
                                        className="btn-edit-score-mini"
                                        onClick={() => onOpenScoreModal(m)}
                                      >
                                        Editar Marcador
                                      </button>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            )
                          }

                          if (!isGrupalGroup) {
                            return matches.map((m) => renderMatchCard(m))
                          }

                          // Agrupar partidos por fecha / enfrentamiento de serie
                          const fechasMap = {}
                          matches.forEach((m) => {
                            const fKey = m.fechaNum || 1
                            if (!fechasMap[fKey]) {
                              fechasMap[fKey] = {
                                fechaNum: fKey,
                                serieNombre: m.serieNombre || `${m.team1 || 'Equipo 1'} vs ${m.team2 || 'Equipo 2'}`,
                                team1: m.team1,
                                team2: m.team2,
                                matches: []
                              }
                            }
                            fechasMap[fKey].matches.push(m)
                          })

                          return Object.values(fechasMap).map((fechaGroup) => {
                            const wins1 = fechaGroup.matches.filter((m) => m.winnerSlot === 1).length
                            const wins2 = fechaGroup.matches.filter((m) => m.winnerSlot === 2).length
                            const hasFinishedAny = wins1 > 0 || wins2 > 0
                            const isSeriesDone = (wins1 + wins2 === fechaGroup.matches.length) || wins1 >= 2 || wins2 >= 2
                            const seriesWinner = wins1 > wins2 ? fechaGroup.team1 : (wins2 > wins1 ? fechaGroup.team2 : null)

                            return (
                              <div className="group-fecha-container" key={`fecha-${fechaGroup.fechaNum}-${fechaGroup.serieNombre}`}>
                                <div className="group-fecha-header">
                                  <div className="fecha-header-left">
                                    <span className="fecha-badge">📅 Fecha {fechaGroup.fechaNum}</span>
                                    <strong className="fecha-serie-title">{fechaGroup.serieNombre}</strong>
                                  </div>
                                  {hasFinishedAny && (
                                    <span className={`fecha-serie-score-pill ${isSeriesDone ? 'completed' : ''}`}>
                                      Serie: {wins1} - {wins2} {isSeriesDone && seriesWinner ? `(Gana: ${seriesWinner})` : ''}
                                    </span>
                                  )}
                                </div>
                                <div className="fecha-matches-sublist">
                                  {fechaGroup.matches.map((m) => renderMatchCard(m))}
                                </div>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* KNOCKOUT ROUNDS SECTION */}
      {hasRounds && (
        <div className="bracket-playoffs-section">
          {hasGroups && (
            <div className="bracket-section-header" style={{ marginTop: '28px' }}>
              <Trophy size={18} color="#C6FF00" />
              <h3>Cuadro Eliminatorio (Llaves Finales)</h3>
            </div>
          )}

          <div className="bracket-rounds-wrapper">
            {bracket.rounds.map((round, rIndex) => {
              const isFirstRound = rIndex === 0
              const isFinalRound = (round.name || '').toLowerCase().includes('final') && (round.matches?.length === 1 || rIndex === bracket.rounds.length - 1)

              return (
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

                      const isSamePlayer = Boolean(
                        hasPlayer1 &&
                        hasPlayer2 &&
                        arePlayersMatching(match.player1, match.player2)
                      )

                      const isP1DuplicatedInRound = Boolean(
                        isFirstRound &&
                        hasPlayer1 &&
                        isPlayerDuplicatedInRound(match.player1, match.id)
                      )

                      const isP2DuplicatedInRound = Boolean(
                        isFirstRound &&
                        hasPlayer2 &&
                        isPlayerDuplicatedInRound(match.player2, match.id)
                      )

                      const hasMatchConflict = isSamePlayer || isP1DuplicatedInRound || isP2DuplicatedInRound
                      const canScore = isAdmin && hasPlayer1 && hasPlayer2 && !hasMatchConflict && !match.winnerSlot
                      const groupP1 = findGroupForPlayer(match.player1)
                      const groupP2 = findGroupForPlayer(match.player2)

                      return (
                        <div
                          key={match.id}
                          className={
                            'match-node-card' +
                            (match.winnerSlot ? ' match-completed' : '') +
                            (hasMatchConflict && !match.winnerSlot ? ' match-has-conflict' : '') +
                            (match.isLive ? ' match-is-live' : '') +
                            (isFinalRound ? ' is-final-node' : '')
                          }
                        >
                          <div className="match-node-header">
                            <div className="match-node-header-left">
                              <span>Match #{match.matchNum}</span>
                              {isFinalRound && <span className="match-final-trophy-pill">🏆 Gran Final</span>}
                              {match.isLive && (
                                <span className="match-live-pulse-badge" title="Partido en transmisión directa">
                                  <span className="live-dot-pulse" /> EN VIVO
                                </span>
                              )}
                              {Boolean(match.hora && match.hora.trim()) && (
                                <span className="match-time-chip" title="Hora definida por el Administrador">
                                  🕒 {match.hora}
                                </span>
                              )}
                              {(match.isBye || match.score === 'BYE') && (
                                <span className="match-bye-pill">⚡ BYE</span>
                              )}
                            </div>
                            {match.score && (
                              <span
                                className={`match-final-score ${
                                  match.score === 'BYE' || match.isBye ? 'is-bye-score' : ''
                                } ${match.isLive ? 'is-live-score' : ''}`}
                              >
                                {match.score}
                              </span>
                            )}
                          </div>

                          <div className="match-participants">
                            {/* SLOT 1 */}
                            {isInteractive && isAdmin && isFirstRound && !hasPlayer1 && onAssignPlayerToSlot ? (
                              <div className="player-slot is-unassigned-interactive">
                                <div className="slot-picker-wrap">
                                  <select
                                    className="slot-interactive-picker"
                                    value=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        onAssignPlayerToSlot(match.id, 1, e.target.value)
                                      }
                                    }}
                                  >
                                    <option value="">+ Asignar jugador de grupo...</option>
                                    <option value="__BYE__">⚡ Asignar BYE (Pase Libre)</option>
                                    {groupsList.map((g) => (
                                      <optgroup key={g.id} label={g.nombre}>
                                        {(g.participantes || []).map((p) => {
                                          const status = getPlayerAssignmentStatus(p, match.id, 1)
                                          return (
                                            <option
                                              key={p.id}
                                              value={p.id}
                                              disabled={!status.isAvailable}
                                            >
                                              {status.label}
                                            </option>
                                          )
                                        })}
                                      </optgroup>
                                    ))}
                                  </select>
                                  {hasPlayer2 && !match.player2?.isBye && onAssignBye && (
                                    <button
                                      type="button"
                                      className="btn-quick-give-bye"
                                      title={`Otorgar victoria por BYE a ${match.player2.name}`}
                                      onClick={() => onAssignBye(match, 1)}
                                    >
                                      <Zap size={11} /> Dar BYE
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : match.player1?.isBye || match.player1?.name === 'BYE' ? (
                              <div
                                className={
                                  'player-slot is-bye-slot' +
                                  (match.winnerSlot === 1
                                    ? ' is-winner'
                                    : match.winnerSlot === 2
                                    ? ' is-loser'
                                    : '')
                                }
                              >
                                <div className="player-slot-info">
                                  <div className="player-slot-name-row">
                                    <span className="slot-bye-tag">⚡ BYE</span>
                                    <span className="player-slot-name is-bye-text">Pase Libre</span>
                                  </div>
                                  <span className="player-slot-cat">Avanza contrincante</span>
                                </div>
                                <div className="slot-right-actions">
                                  {isInteractive &&
                                    isAdmin &&
                                    isFirstRound &&
                                    !match.winnerSlot &&
                                    onClearMatchSlot && (
                                      <button
                                        type="button"
                                        className="btn-clear-slot"
                                        title="Quitar BYE"
                                        onClick={() => onClearMatchSlot(match.id, 1)}
                                      >
                                        ✕
                                      </button>
                                    )}
                                </div>
                              </div>
                            ) : (
                              <div
                                className={
                                  'player-slot' +
                                  (match.winnerSlot === 1
                                    ? ' is-winner'
                                    : match.winnerSlot === 2
                                    ? ' is-loser'
                                    : '')
                                }
                              >
                                <div className="player-slot-info">
                                  <div className="player-slot-name-row">
                                    {groupP1 && (
                                      <span className="slot-group-origin-tag">{groupP1}</span>
                                    )}
                                    <span className="player-slot-name">
                                      {hasPlayer1 ? match.player1.name : 'Por definir'}
                                    </span>
                                  </div>
                                  {hasPlayer1 && match.player1.categoria && (
                                    <span className="player-slot-cat">{match.player1.categoria}</span>
                                  )}
                                </div>
                                <div className="slot-right-actions">
                                  {match.winnerSlot === 1 && (
                                    <span className="winner-tick">
                                      <Check size={14} />
                                    </span>
                                  )}
                                  {isInteractive &&
                                    isAdmin &&
                                    isFirstRound &&
                                    hasPlayer1 &&
                                    !match.winnerSlot &&
                                    onClearMatchSlot && (
                                      <button
                                        type="button"
                                        className="btn-clear-slot"
                                        title="Quitar de esta llave"
                                        onClick={() => onClearMatchSlot(match.id, 1)}
                                      >
                                        ✕
                                      </button>
                                    )}
                                </div>
                              </div>
                            )}

                            {/* VS & SWAP ROW */}
                            <div className="match-vs-row">
                              <span className="match-vs-divider">vs</span>
                              {isInteractive &&
                                isAdmin &&
                                isFirstRound &&
                                !match.winnerSlot &&
                                onSwapMatchSlots &&
                                (hasPlayer1 || hasPlayer2) && (
                                  <button
                                    type="button"
                                    className="btn-swap-slots"
                                    title="Intercambiar posiciones (P1 ⇅ P2)"
                                    onClick={() => onSwapMatchSlots(match.id)}
                                  >
                                    ⇅ Swap
                                  </button>
                                )}
                            </div>

                            {/* SLOT 2 */}
                            {isInteractive && isAdmin && isFirstRound && !hasPlayer2 && onAssignPlayerToSlot ? (
                              <div className="player-slot is-unassigned-interactive">
                                <div className="slot-picker-wrap">
                                  <select
                                    className="slot-interactive-picker"
                                    value=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        onAssignPlayerToSlot(match.id, 2, e.target.value)
                                      }
                                    }}
                                  >
                                    <option value="">+ Asignar jugador de grupo...</option>
                                    <option value="__BYE__">⚡ Asignar BYE (Pase Libre)</option>
                                    {groupsList.map((g) => (
                                      <optgroup key={g.id} label={g.nombre}>
                                        {(g.participantes || []).map((p) => {
                                          const status = getPlayerAssignmentStatus(p, match.id, 2)
                                          return (
                                            <option
                                              key={p.id}
                                              value={p.id}
                                              disabled={!status.isAvailable}
                                            >
                                              {status.label}
                                            </option>
                                          )
                                        })}
                                      </optgroup>
                                    ))}
                                  </select>
                                  {hasPlayer1 && !match.player1?.isBye && onAssignBye && (
                                    <button
                                      type="button"
                                      className="btn-quick-give-bye"
                                      title={`Otorgar victoria por BYE a ${match.player1.name}`}
                                      onClick={() => onAssignBye(match, 2)}
                                    >
                                      <Zap size={11} /> Dar BYE
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : match.player2?.isBye || match.player2?.name === 'BYE' ? (
                              <div
                                className={
                                  'player-slot is-bye-slot' +
                                  (match.winnerSlot === 2
                                    ? ' is-winner'
                                    : match.winnerSlot === 1
                                    ? ' is-loser'
                                    : '')
                                }
                              >
                                <div className="player-slot-info">
                                  <div className="player-slot-name-row">
                                    <span className="slot-bye-tag">⚡ BYE</span>
                                    <span className="player-slot-name is-bye-text">Pase Libre</span>
                                  </div>
                                  <span className="player-slot-cat">Avanza contrincante</span>
                                </div>
                                <div className="slot-right-actions">
                                  {isInteractive &&
                                    isAdmin &&
                                    isFirstRound &&
                                    !match.winnerSlot &&
                                    onClearMatchSlot && (
                                      <button
                                        type="button"
                                        className="btn-clear-slot"
                                        title="Quitar BYE"
                                        onClick={() => onClearMatchSlot(match.id, 2)}
                                      >
                                        ✕
                                      </button>
                                    )}
                                </div>
                              </div>
                            ) : (
                              <div
                                className={
                                  'player-slot' +
                                  (match.winnerSlot === 2
                                    ? ' is-winner'
                                    : match.winnerSlot === 1
                                    ? ' is-loser'
                                    : '')
                                }
                              >
                                <div className="player-slot-info">
                                  <div className="player-slot-name-row">
                                    {groupP2 && (
                                      <span className="slot-group-origin-tag">{groupP2}</span>
                                    )}
                                    <span className="player-slot-name">
                                      {hasPlayer2 ? match.player2.name : 'Por definir'}
                                    </span>
                                  </div>
                                  {hasPlayer2 && match.player2.categoria && (
                                    <span className="player-slot-cat">{match.player2.categoria}</span>
                                  )}
                                </div>
                                <div className="slot-right-actions">
                                  {match.winnerSlot === 2 && (
                                    <span className="winner-tick">
                                      <Check size={14} />
                                    </span>
                                  )}
                                  {isInteractive &&
                                    isAdmin &&
                                    isFirstRound &&
                                    hasPlayer2 &&
                                    !match.winnerSlot &&
                                    onClearMatchSlot && (
                                      <button
                                        type="button"
                                        className="btn-clear-slot"
                                        title="Quitar de esta llave"
                                        onClick={() => onClearMatchSlot(match.id, 2)}
                                      >
                                        ✕
                                      </button>
                                    )}
                                </div>
                              </div>
                            )}
                          </div>

                          {isAdmin && (
                            <div className="match-admin-actions">
                              {hasMatchConflict && !match.winnerSlot && (
                                <div className="match-conflict-banner">
                                  <div className="match-conflict-title">
                                    ⚠️ {isSamePlayer ? 'Mismo jugador en ambos lados' : 'Jugador duplicado en la ronda'}
                                  </div>
                                  <div className="match-conflict-hint">
                                    {isSamePlayer
                                      ? 'Un jugador no puede competir contra sí mismo. Quita uno usando el botón ✕.'
                                      : 'Este jugador ya está asignado en otra llave. Retira la casilla duplicada con ✕.'}
                                  </div>
                                </div>
                              )}

                              {isFinalRound && (
                                <div className="final-admin-schedule-row">
                                  <span className="final-time-label">🕒 Hora Final:</span>
                                  <input
                                    type="text"
                                    className="input-final-time-quick"
                                    placeholder="Escribe la hora deseada (ej. 4:00 PM, 16:30)"
                                    value={match.hora || ''}
                                    onChange={(e) => onUpdateMatchHora && onUpdateMatchHora(match.id, e.target.value)}
                                    title="Escribe la hora como la requieras"
                                  />
                                </div>
                              )}

                              {!match.winnerSlot && ((hasPlayer1 && (match.player2?.isBye || match.player2?.name === 'BYE')) || (hasPlayer2 && (match.player1?.isBye || match.player1?.name === 'BYE'))) && onAssignBye && (
                                <button
                                  type="button"
                                  className="btn-enter-score btn-bye-highlight"
                                  onClick={() => onAssignBye(match, (match.player1?.isBye || match.player1?.name === 'BYE') ? 1 : 2)}
                                >
                                  <Zap size={12} /> Confirmar Victoria por BYE
                                </button>
                              )}

                              {match.isLive && onOpenScoreModal && (
                                <div className="match-admin-live-row">
                                  <button
                                    type="button"
                                    className="btn-enter-score btn-live-score-active"
                                    onClick={() => onOpenScoreModal(match)}
                                  >
                                    <span className="live-dot-pulse" /> 🔴 Actualizar Marcador EN VIVO
                                  </button>
                                  {onToggleMatchLive && (
                                    <button
                                      type="button"
                                      className="btn-toggle-live-ghost"
                                      onClick={() => onToggleMatchLive(match.id, false)}
                                      title="Pausar transmisión en vivo"
                                    >
                                      ⏸ Pausar En Vivo
                                    </button>
                                  )}
                                </div>
                              )}

                              {!match.isLive && canScore && onOpenScoreModal && !((hasPlayer1 && (match.player2?.isBye || match.player2?.name === 'BYE')) || (hasPlayer2 && (match.player1?.isBye || match.player1?.name === 'BYE'))) && (
                                <div className="match-admin-btn-group">
                                  <button
                                    type="button"
                                    className="btn-enter-score"
                                    onClick={() => onOpenScoreModal(match)}
                                  >
                                    <Flame size={12} /> {isFinalRound ? 'Cargar Marcador / En Vivo' : 'Cargar Marcador'}
                                  </button>
                                  {isFinalRound && onToggleMatchLive && hasPlayer1 && hasPlayer2 && (
                                    <button
                                      type="button"
                                      className="btn-quick-live-trigger"
                                      onClick={() => onToggleMatchLive(match.id, true)}
                                      title="Activar distintivo EN VIVO en este partido"
                                    >
                                      🔴 Activar En Vivo
                                    </button>
                                  )}
                                </div>
                              )}

                              {match.winnerSlot && onOpenScoreModal && (
                                <button
                                  type="button"
                                  className="btn-edit-score"
                                  onClick={() => onOpenScoreModal(match)}
                                >
                                  {match.score === 'BYE' || match.isBye ? '⚡ Editar BYE / Puntos' : `Editar Marcador (${match.score})`}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
