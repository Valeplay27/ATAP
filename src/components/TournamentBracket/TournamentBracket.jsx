import { Trophy, Check, Flame, Users, Calendar, Zap, Plus, Trash2 } from 'lucide-react'
import './TournamentBracket.css'

export default function TournamentBracket({
  bracket,
  bracketModality,
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
  onToggleMatchLive,
  onUpdateMatchModality,
  isGrupalTournament = false,
  onAddGroupFecha,
  onRemoveGroupFecha,
  onAssignGroupPlayer,
  onClearGroupSlot
}) {
  const hasRounds = Boolean(bracket && bracket.rounds && bracket.rounds.length > 0)
  const hasGroups = Boolean(bracket && bracket.faseGrupos && bracket.faseGrupos.length > 0)
  const groupsList = manualGroups && manualGroups.length > 0 ? manualGroups : (bracket?.faseGrupos || [])
  const isTournamentDobles = bracket?.modalidad === 'dobles' || bracketModality === 'dobles'
  const isTournamentGrupal = Boolean(
    isGrupalTournament ||
    bracket?.modalidad === 'grupal' ||
    bracket?.modalidad === 'equipos' ||
    bracketModality === 'grupal' ||
    bracketModality === 'equipos'
  )

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

  const getSelectablePlayersForGroup = (g) => {
    if (!g || !g.participantes) return []
    const list = []
    g.participantes.forEach((p) => {
      if (p.integrantes && Array.isArray(p.integrantes) && p.integrantes.length > 0) {
        p.integrantes.forEach((subP, subIdx) => {
          list.push({
            id: subP.id || `${p.id}-sub-${subIdx}`,
            name: subP.nombre || subP.name,
            nombre: subP.nombre || subP.name,
            categoria: subP.categoria || p.categoria || '',
            dni: subP.dni || '',
            teamName: p.nombreEquipo || p.nombre || '',
            grupoId: g.id,
            grupoNombre: g.nombre
          })
        })
      } else {
        list.push({
          id: p.id,
          name: p.nombre,
          nombre: p.nombre,
          categoria: p.categoria || '',
          dni: p.dni || '',
          teamName: p.nombreEquipo || '',
          grupoId: g.id,
          grupoNombre: g.nombre
        })
      }
    })
    return list
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

    const isSlot1a = targetSlot === 1 || targetSlot === '1' || targetSlot === '1a'
    const isSlot1b = targetSlot === '1b'
    const isSlot2a = targetSlot === 2 || targetSlot === '2' || targetSlot === '2a'
    const isSlot2b = targetSlot === '2b'

    // 1. REGLA: No permitir el mismo jugador en el mismo partido (en cualquiera de las 4 casillas)
    const currentMatch = firstRound.matches.find((m) => m.id === currentMatchId)
    if (currentMatch) {
      const otherPlayersInMatch = []
      if (!isSlot1a && currentMatch.player1) otherPlayersInMatch.push(currentMatch.player1)
      if (!isSlot1b && currentMatch.player1b) otherPlayersInMatch.push(currentMatch.player1b)
      if (!isSlot2a && currentMatch.player2) otherPlayersInMatch.push(currentMatch.player2)
      if (!isSlot2b && currentMatch.player2b) otherPlayersInMatch.push(currentMatch.player2b)

      for (const op of otherPlayersInMatch) {
        if (arePlayersMatching(participant, op)) {
          return {
            isAvailable: false,
            reason: 'same_match',
            label: `🚫 ${participant.nombre} (Mismo partido — No permitido)`
          }
        }
      }
    }

    // 2. REGLA: No permitir jugador ya asignado o que ya jugó en otra llave de esta ronda activa
    for (const m of firstRound.matches) {
      if (m.id === currentMatchId) continue

      const inP1 = arePlayersMatching(participant, m.player1)
      const inP1b = arePlayersMatching(participant, m.player1b)
      const inP2 = arePlayersMatching(participant, m.player2)
      const inP2b = arePlayersMatching(participant, m.player2b)

      if (inP1 || inP1b || inP2 || inP2b) {
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
      if (
        arePlayersMatching(player, m.player1) ||
        arePlayersMatching(player, m.player1b) ||
        arePlayersMatching(player, m.player2) ||
        arePlayersMatching(player, m.player2b)
      ) {
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
                  {(() => {
                    const isGrupalGroup = Boolean(
                      isTournamentGrupal ||
                      matches.some((m) => m.esGrupal || m.subtipo || m.fechaNum)
                    )

                    if (!isGrupalGroup && matches.length === 0) return null

                    const renderStandardMatchCard = (m) => {
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
                      return (
                        <div className="group-matches-block">
                          <div className="group-matches-title-row">
                            <span className="group-matches-title">Partidos del Grupo:</span>
                          </div>
                          <div className="group-matches-sublist">
                            {matches.map((m) => renderStandardMatchCard(m))}
                          </div>
                        </div>
                      )
                    }

                    // GRUPAL / POR EQUIPOS: OBLIGATORIO 2 SINGLES + 1 DOBLES POR FECHA
                    const selectablePlayers = getSelectablePlayersForGroup(grupo)

                    const renderGrupalMatchCard = (m) => {
                      const isMatchDobles = m.modalidad === 'dobles' || m.subtipo === 'Dobles'
                      const hasP1 = Boolean(m.player1 && m.player1.name && !m.player1.name.includes('(Singles') && !m.player1.name.includes('(Dobles)'))
                      const hasP2 = Boolean(m.player2 && m.player2.name && !m.player2.name.includes('(Singles') && !m.player2.name.includes('(Dobles)'))
                      const hasP1b = Boolean(m.player1b && m.player1b.name)
                      const hasP2b = Boolean(m.player2b && m.player2b.name)

                      const canScore = isMatchDobles
                        ? isAdmin && (hasP1 || hasP1b) && (hasP2 || hasP2b) && !m.winnerSlot
                        : isAdmin && hasP1 && hasP2 && !m.winnerSlot

                      return (
                        <div className={'group-match-card-grupal' + (m.winnerSlot ? ' completed' : '')} key={m.id}>
                          <div className="group-match-header-row">
                            <div className="match-header-tags">
                              <small className="match-num-tag">Match #{m.matchNum}</small>
                              <span className={`match-subtipo-pill ${isMatchDobles ? 'pill-dobles' : 'pill-singles'}`}>
                                {isMatchDobles ? '👥 Dobles' : `🎾 ${m.subtipo || 'Singles'}`}
                              </span>
                            </div>
                            {m.score && <span className="group-match-score">{m.score}</span>}
                          </div>

                          {/* SLOTS INTERACTIVOS SEGÚN MODALIDAD */}
                          {isMatchDobles ? (
                            /* DOBLES: DUPLA 1 (2 JUGADORES) vs DUPLA 2 (2 JUGADORES) */
                            <div className="group-match-doubles-wrap">
                              {/* DUPLA 1 */}
                              <div className={'group-duo-team-box' + (m.winnerSlot === 1 ? ' is-winner' : '')}>
                                <div className="group-duo-team-title">
                                  <span>👥 Dupla 1 ({m.team1 || 'Equipo 1'})</span>
                                  {m.winnerSlot === 1 && <span className="winner-check-tag">✓ Ganador</span>}
                                </div>
                                <div className="group-duo-slots">
                                  {/* Slot 1a */}
                                  <div className="group-player-slot">
                                    {hasP1 ? (
                                      <div className="group-assigned-slot">
                                        <div className="slot-player-meta">
                                          <span className="slot-assigned-name">{m.player1.name}</span>
                                          {m.player1.categoria && <small className="slot-assigned-cat">{m.player1.categoria}</small>}
                                        </div>
                                        {isAdmin && isInteractive && !m.winnerSlot && onClearGroupSlot && (
                                          <button
                                            type="button"
                                            className="btn-clear-group-slot"
                                            onClick={() => onClearGroupSlot(grupo.id, m.id, '1a')}
                                            title="Quitar de Dupla 1"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      isAdmin && isInteractive && onAssignGroupPlayer ? (
                                        <select
                                          className="group-slot-select"
                                          value=""
                                          onChange={(e) => {
                                            if (e.target.value) onAssignGroupPlayer(grupo.id, m.id, '1a', e.target.value)
                                          }}
                                        >
                                          <option value="">+ Asignar jugador de grupo (J1)...</option>
                                          {selectablePlayers.map((p) => {
                                            const isTaken = arePlayersMatching(p, m.player1b) || arePlayersMatching(p, m.player2) || arePlayersMatching(p, m.player2b)
                                            return (
                                              <option key={p.id} value={p.id} disabled={isTaken}>
                                                {p.nombre} {p.categoria ? `(${p.categoria})` : ''} {isTaken ? '⚠️ (Ya asignado)' : ''}
                                              </option>
                                            )
                                          })}
                                        </select>
                                      ) : (
                                        <span className="slot-unassigned-label">Por definir</span>
                                      )
                                    )}
                                  </div>

                                  {/* Slot 1b */}
                                  <div className="group-player-slot">
                                    {hasP1b ? (
                                      <div className="group-assigned-slot">
                                        <div className="slot-player-meta">
                                          <span className="slot-assigned-name">{m.player1b.name}</span>
                                          {m.player1b.categoria && <small className="slot-assigned-cat">{m.player1b.categoria}</small>}
                                        </div>
                                        {isAdmin && isInteractive && !m.winnerSlot && onClearGroupSlot && (
                                          <button
                                            type="button"
                                            className="btn-clear-group-slot"
                                            onClick={() => onClearGroupSlot(grupo.id, m.id, '1b')}
                                            title="Quitar de Dupla 1"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      isAdmin && isInteractive && onAssignGroupPlayer ? (
                                        <select
                                          className="group-slot-select"
                                          value=""
                                          onChange={(e) => {
                                            if (e.target.value) onAssignGroupPlayer(grupo.id, m.id, '1b', e.target.value)
                                          }}
                                        >
                                          <option value="">+ Asignar jugador de grupo (J2)...</option>
                                          {selectablePlayers.map((p) => {
                                            const isTaken = arePlayersMatching(p, m.player1) || arePlayersMatching(p, m.player2) || arePlayersMatching(p, m.player2b)
                                            return (
                                              <option key={p.id} value={p.id} disabled={isTaken}>
                                                {p.nombre} {p.categoria ? `(${p.categoria})` : ''} {isTaken ? '⚠️ (Ya asignado)' : ''}
                                              </option>
                                            )
                                          })}
                                        </select>
                                      ) : (
                                        <span className="slot-unassigned-label">Por definir</span>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="group-vs-badge">VS</div>

                              {/* DUPLA 2 */}
                              <div className={'group-duo-team-box' + (m.winnerSlot === 2 ? ' is-winner' : '')}>
                                <div className="group-duo-team-title">
                                  <span>👥 Dupla 2 ({m.team2 || 'Equipo 2'})</span>
                                  {m.winnerSlot === 2 && <span className="winner-check-tag">✓ Ganador</span>}
                                </div>
                                <div className="group-duo-slots">
                                  {/* Slot 2a */}
                                  <div className="group-player-slot">
                                    {hasP2 ? (
                                      <div className="group-assigned-slot">
                                        <div className="slot-player-meta">
                                          <span className="slot-assigned-name">{m.player2.name}</span>
                                          {m.player2.categoria && <small className="slot-assigned-cat">{m.player2.categoria}</small>}
                                        </div>
                                        {isAdmin && isInteractive && !m.winnerSlot && onClearGroupSlot && (
                                          <button
                                            type="button"
                                            className="btn-clear-group-slot"
                                            onClick={() => onClearGroupSlot(grupo.id, m.id, '2a')}
                                            title="Quitar de Dupla 2"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      isAdmin && isInteractive && onAssignGroupPlayer ? (
                                        <select
                                          className="group-slot-select"
                                          value=""
                                          onChange={(e) => {
                                            if (e.target.value) onAssignGroupPlayer(grupo.id, m.id, '2a', e.target.value)
                                          }}
                                        >
                                          <option value="">+ Asignar jugador de grupo (J1)...</option>
                                          {selectablePlayers.map((p) => {
                                            const isTaken = arePlayersMatching(p, m.player1) || arePlayersMatching(p, m.player1b) || arePlayersMatching(p, m.player2b)
                                            return (
                                              <option key={p.id} value={p.id} disabled={isTaken}>
                                                {p.nombre} {p.categoria ? `(${p.categoria})` : ''} {isTaken ? '⚠️ (Ya asignado)' : ''}
                                              </option>
                                            )
                                          })}
                                        </select>
                                      ) : (
                                        <span className="slot-unassigned-label">Por definir</span>
                                      )
                                    )}
                                  </div>

                                  {/* Slot 2b */}
                                  <div className="group-player-slot">
                                    {hasP2b ? (
                                      <div className="group-assigned-slot">
                                        <div className="slot-player-meta">
                                          <span className="slot-assigned-name">{m.player2b.name}</span>
                                          {m.player2b.categoria && <small className="slot-assigned-cat">{m.player2b.categoria}</small>}
                                        </div>
                                        {isAdmin && isInteractive && !m.winnerSlot && onClearGroupSlot && (
                                          <button
                                            type="button"
                                            className="btn-clear-group-slot"
                                            onClick={() => onClearGroupSlot(grupo.id, m.id, '2b')}
                                            title="Quitar de Dupla 2"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      isAdmin && isInteractive && onAssignGroupPlayer ? (
                                        <select
                                          className="group-slot-select"
                                          value=""
                                          onChange={(e) => {
                                            if (e.target.value) onAssignGroupPlayer(grupo.id, m.id, '2b', e.target.value)
                                          }}
                                        >
                                          <option value="">+ Asignar jugador de grupo (J2)...</option>
                                          {selectablePlayers.map((p) => {
                                            const isTaken = arePlayersMatching(p, m.player1) || arePlayersMatching(p, m.player1b) || arePlayersMatching(p, m.player2)
                                            return (
                                              <option key={p.id} value={p.id} disabled={isTaken}>
                                                {p.nombre} {p.categoria ? `(${p.categoria})` : ''} {isTaken ? '⚠️ (Ya asignado)' : ''}
                                              </option>
                                            )
                                          })}
                                        </select>
                                      ) : (
                                        <span className="slot-unassigned-label">Por definir</span>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* SINGLES: JUGADOR 1 vs JUGADOR 2 */
                            <div className="group-match-singles-wrap">
                              {/* Lado 1 */}
                              <div className={'group-single-slot' + (m.winnerSlot === 1 ? ' is-winner' : '')}>
                                <div className="slot-header-tag">🎾 {m.team1 || 'Equipo 1'}</div>
                                {hasP1 ? (
                                  <div className="group-assigned-slot">
                                    <div className="slot-player-meta">
                                      <span className="slot-assigned-name">{m.player1.name}</span>
                                      {m.player1.categoria && <small className="slot-assigned-cat">{m.player1.categoria}</small>}
                                    </div>
                                    {isAdmin && isInteractive && !m.winnerSlot && onClearGroupSlot && (
                                      <button
                                        type="button"
                                        className="btn-clear-group-slot"
                                        onClick={() => onClearGroupSlot(grupo.id, m.id, 1)}
                                        title="Quitar jugador"
                                      >
                                        ✕
                                      </button>
                                    )}
                                    {m.winnerSlot === 1 && <span className="winner-check-tag">✓</span>}
                                  </div>
                                ) : (
                                  isAdmin && isInteractive && onAssignGroupPlayer ? (
                                    <select
                                      className="group-slot-select"
                                      value=""
                                      onChange={(e) => {
                                        if (e.target.value) onAssignGroupPlayer(grupo.id, m.id, 1, e.target.value)
                                      }}
                                    >
                                      <option value="">+ Asignar jugador de grupo...</option>
                                      {selectablePlayers.map((p) => {
                                        const isRival = arePlayersMatching(p, m.player2)
                                        return (
                                          <option key={p.id} value={p.id} disabled={isRival}>
                                            {p.nombre} {p.categoria ? `(${p.categoria})` : ''} {isRival ? '⚠️ (Rival ya asignado)' : ''}
                                          </option>
                                        )
                                      })}
                                    </select>
                                  ) : (
                                    <span className="slot-unassigned-label">Por definir</span>
                                  )
                                )}
                              </div>

                              <div className="group-vs-badge">VS</div>

                              {/* Lado 2 */}
                              <div className={'group-single-slot' + (m.winnerSlot === 2 ? ' is-winner' : '')}>
                                <div className="slot-header-tag">🎾 {m.team2 || 'Equipo 2'}</div>
                                {hasP2 ? (
                                  <div className="group-assigned-slot">
                                    <div className="slot-player-meta">
                                      <span className="slot-assigned-name">{m.player2.name}</span>
                                      {m.player2.categoria && <small className="slot-assigned-cat">{m.player2.categoria}</small>}
                                    </div>
                                    {isAdmin && isInteractive && !m.winnerSlot && onClearGroupSlot && (
                                      <button
                                        type="button"
                                        className="btn-clear-group-slot"
                                        onClick={() => onClearGroupSlot(grupo.id, m.id, 2)}
                                        title="Quitar jugador"
                                      >
                                        ✕
                                      </button>
                                    )}
                                    {m.winnerSlot === 2 && <span className="winner-check-tag">✓</span>}
                                  </div>
                                ) : (
                                  isAdmin && isInteractive && onAssignGroupPlayer ? (
                                    <select
                                      className="group-slot-select"
                                      value=""
                                      onChange={(e) => {
                                        if (e.target.value) onAssignGroupPlayer(grupo.id, m.id, 2, e.target.value)
                                      }}
                                    >
                                      <option value="">+ Asignar jugador de grupo...</option>
                                      {selectablePlayers.map((p) => {
                                        const isRival = arePlayersMatching(p, m.player1)
                                        return (
                                          <option key={p.id} value={p.id} disabled={isRival}>
                                            {p.nombre} {p.categoria ? `(${p.categoria})` : ''} {isRival ? '⚠️ (Rival ya asignado)' : ''}
                                          </option>
                                        )
                                      })}
                                    </select>
                                  ) : (
                                    <span className="slot-unassigned-label">Por definir</span>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {/* ACCIONES DE MARCADOR */}
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

                    const fechasList = Object.values(fechasMap)

                    return (
                      <div className="group-matches-block">
                        <div className="group-matches-title-row">
                          <span className="group-matches-title">Partidos del Grupo:</span>
                          <span className="group-matches-mode-pill">🏆 2 Singles + 1 Dobles por Fecha</span>
                        </div>

                        <div className="group-matches-sublist">
                          {fechasList.length === 0 ? (
                            <div className="group-empty-hint" style={{ padding: '12px 0' }}>
                              Sin fechas programadas aún para este grupo.
                            </div>
                          ) : (
                            fechasList.map((fechaGroup) => {
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
                                    <div className="fecha-header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {hasFinishedAny && (
                                        <span className={`fecha-serie-score-pill ${isSeriesDone ? 'completed' : ''}`}>
                                          Serie: {wins1} - {wins2} {isSeriesDone && seriesWinner ? `(Gana: ${seriesWinner})` : ''}
                                        </span>
                                      )}
                                      {isAdmin && isInteractive && onRemoveGroupFecha && (
                                        <button
                                          type="button"
                                          className="btn-delete-fecha-mini"
                                          onClick={() => {
                                            if (window.confirm(`¿Estás seguro de eliminar la Fecha ${fechaGroup.fechaNum} y sus 3 partidos?`)) {
                                              onRemoveGroupFecha(grupo.id, fechaGroup.fechaNum)
                                            }
                                          }}
                                          title={`Eliminar Fecha ${fechaGroup.fechaNum} (3 partidos)`}
                                        >
                                          <Trash2 size={12} />
                                          <span>Eliminar Fecha</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="fecha-matches-sublist">
                                    {fechaGroup.matches.map((m) => renderGrupalMatchCard(m))}
                                  </div>
                                </div>
                              )
                            })
                          )}

                          {isAdmin && isInteractive && onAddGroupFecha && (
                            <button
                              type="button"
                              className="btn-add-group-fecha-full"
                              onClick={() => onAddGroupFecha(grupo.id)}
                              title="Agregar una nueva fecha con 2 partidos de Singles y 1 de Dobles"
                            >
                              <Plus size={14} />
                              <span>+ Agregar Nueva Fecha (2 Singles + 1 Dobles)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })()}
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
                      const isMatchDobles = match.modalidad ? match.modalidad === 'dobles' : isTournamentDobles

                      const hasPlayer1 = Boolean(match.player1 && match.player1.name)
                      const hasPlayer1b = Boolean(match.player1b && match.player1b.name)
                      const hasPlayer2 = Boolean(match.player2 && match.player2.name)
                      const hasPlayer2b = Boolean(match.player2b && match.player2b.name)

                      const isDupla1Bye = Boolean(match.player1?.isBye || match.player1?.name === 'BYE')
                      const isDupla2Bye = Boolean(match.player2?.isBye || match.player2?.name === 'BYE')

                      const hasTeam1 = isMatchDobles
                        ? ((hasPlayer1 && hasPlayer1b) || isDupla1Bye)
                        : (hasPlayer1 || isDupla1Bye)
                      const hasTeam2 = isMatchDobles
                        ? ((hasPlayer2 && hasPlayer2b) || isDupla2Bye)
                        : (hasPlayer2 || isDupla2Bye)

                      // Conflict checking: strict rule that no duplicate players exist in the match or across the round (exempting BYE)
                      const activePlayersInMatch = []
                      if (hasPlayer1 && !isDupla1Bye) activePlayersInMatch.push(match.player1)
                      if (isMatchDobles && hasPlayer1b && !isDupla1Bye) activePlayersInMatch.push(match.player1b)
                      if (hasPlayer2 && !isDupla2Bye) activePlayersInMatch.push(match.player2)
                      if (isMatchDobles && hasPlayer2b && !isDupla2Bye) activePlayersInMatch.push(match.player2b)

                      let isSamePlayer = false
                      for (let i = 0; i < activePlayersInMatch.length; i++) {
                        for (let j = i + 1; j < activePlayersInMatch.length; j++) {
                          if (arePlayersMatching(activePlayersInMatch[i], activePlayersInMatch[j])) {
                            isSamePlayer = true
                            break
                          }
                        }
                        if (isSamePlayer) break
                      }

                      const isAnyDuplicatedInRound = Boolean(
                        isFirstRound &&
                        activePlayersInMatch.some((p) => isPlayerDuplicatedInRound(p, match.id))
                      )

                      const hasMatchConflict = isSamePlayer || isAnyDuplicatedInRound
                      const canScore = isAdmin && hasTeam1 && hasTeam2 && !hasMatchConflict && !match.winnerSlot

                      const groupP1 = findGroupForPlayer(match.player1)
                      const groupP1b = findGroupForPlayer(match.player1b)
                      const groupP2 = findGroupForPlayer(match.player2)
                      const groupP2b = findGroupForPlayer(match.player2b)

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
                              {isAdmin && isInteractive && !match.winnerSlot && onUpdateMatchModality ? (
                                <div className="match-modality-picker-wrap">
                                  <span className="match-modality-picker-label">Tipo:</span>
                                  <select
                                    className="match-modality-select-pill"
                                    value={isMatchDobles ? 'dobles' : 'singles'}
                                    onChange={(e) => onUpdateMatchModality(match.id, e.target.value)}
                                    title="Elige si este partido es Singles (2 jugadores) o Dobles (4 jugadores)"
                                  >
                                    <option value="singles">🎾 Singles</option>
                                    <option value="dobles">👥 Dobles</option>
                                  </select>
                                </div>
                              ) : (
                                <span className={`match-modality-pill ${isMatchDobles ? 'is-dobles' : 'is-singles'}`}>
                                  {isMatchDobles ? '👥 Dobles' : '🎾 Singles'}
                                </span>
                              )}
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

                          {isMatchDobles ? (
                            /* DOBLES (4 JUGADORES: DUPLA 1 vs DUPLA 2) */
                            <div className="doubles-match-participants">
                              {/* DUPLA 1 */}
                              <div
                                className={
                                  'doubles-team-card' +
                                  (match.winnerSlot === 1
                                    ? ' is-winner-team'
                                    : match.winnerSlot === 2
                                    ? ' is-loser-team'
                                    : '')
                                }
                              >
                                <div className="doubles-team-header-row">
                                  <span className="doubles-team-title">👥 Dupla 1</span>
                                  {match.winnerSlot === 1 && (
                                    <span className="winner-tick">
                                      <Check size={13} />
                                    </span>
                                  )}
                                </div>

                                {isDupla1Bye ? (
                                  <div
                                    className={
                                      'player-slot is-bye-slot is-doubles-slot' +
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
                                      <span className="player-slot-cat">Avanza Dupla 2</span>
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
                                  <div className="doubles-duo-slots">
                                    {/* CASILLA 1A (JUGADOR 1) */}
                                    {isInteractive && isAdmin && isFirstRound && !hasPlayer1 && onAssignPlayerToSlot ? (
                                      <div className="player-slot is-unassigned-interactive is-doubles-slot">
                                        <div className="slot-picker-wrap">
                                          <select
                                            className="slot-interactive-picker doubles-slot-picker"
                                            value=""
                                            onChange={(e) => {
                                              if (e.target.value) {
                                                onAssignPlayerToSlot(match.id, '1a', e.target.value)
                                              }
                                            }}
                                          >
                                            <option value="">+ Jugador 1 (Dupla 1)...</option>
                                            <option value="__BYE__">⚡ Asignar BYE a Dupla 1</option>
                                            {groupsList.map((g) => (
                                              <optgroup key={g.id} label={g.nombre}>
                                                {(g.participantes || []).map((p) => {
                                                  const status = getPlayerAssignmentStatus(p, match.id, '1a')
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
                                          {hasTeam2 && !isDupla2Bye && onAssignBye && (
                                            <button
                                              type="button"
                                              className="btn-quick-give-bye"
                                              title="Otorgar victoria por BYE a Dupla 2"
                                              onClick={() => onAssignBye(match, 1)}
                                            >
                                              <Zap size={11} /> Dar BYE
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="player-slot is-doubles-slot">
                                        <div className="player-slot-info">
                                          <div className="player-slot-name-row">
                                            {groupP1 && <span className="slot-group-origin-tag">{groupP1}</span>}
                                            <span className="player-slot-name">
                                              {hasPlayer1 ? match.player1.name : (isFirstRound ? 'Por definir' : 'Ganador Dupla 1')}
                                            </span>
                                          </div>
                                          {hasPlayer1 && match.player1.categoria && (
                                            <span className="player-slot-cat">{match.player1.categoria}</span>
                                          )}
                                        </div>
                                        <div className="slot-right-actions">
                                          {isInteractive &&
                                            isAdmin &&
                                            isFirstRound &&
                                            hasPlayer1 &&
                                            !match.winnerSlot &&
                                            onClearMatchSlot && (
                                              <button
                                                type="button"
                                                className="btn-clear-slot"
                                                title="Quitar de Dupla 1"
                                                onClick={() => onClearMatchSlot(match.id, '1a')}
                                              >
                                                ✕
                                              </button>
                                            )}
                                        </div>
                                      </div>
                                    )}

                                    {/* CASILLA 1B (JUGADOR 2) */}
                                    {isInteractive && isAdmin && isFirstRound && !hasPlayer1b && onAssignPlayerToSlot ? (
                                      <div className="player-slot is-unassigned-interactive is-doubles-slot">
                                        <div className="slot-picker-wrap">
                                          <select
                                            className="slot-interactive-picker doubles-slot-picker"
                                            value=""
                                            onChange={(e) => {
                                              if (e.target.value) {
                                                onAssignPlayerToSlot(match.id, '1b', e.target.value)
                                              }
                                            }}
                                          >
                                            <option value="">+ Jugador 2 (Dupla 1)...</option>
                                            {groupsList.map((g) => (
                                              <optgroup key={g.id} label={g.nombre}>
                                                {(g.participantes || []).map((p) => {
                                                  const status = getPlayerAssignmentStatus(p, match.id, '1b')
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
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="player-slot is-doubles-slot">
                                        <div className="player-slot-info">
                                          <div className="player-slot-name-row">
                                            {groupP1b && <span className="slot-group-origin-tag">{groupP1b}</span>}
                                            <span className="player-slot-name">
                                              {hasPlayer1b ? match.player1b.name : (isFirstRound ? 'Por definir' : (hasPlayer1 ? 'Compañero' : 'Por definir'))}
                                            </span>
                                          </div>
                                          {hasPlayer1b && match.player1b.categoria && (
                                            <span className="player-slot-cat">{match.player1b.categoria}</span>
                                          )}
                                        </div>
                                        <div className="slot-right-actions">
                                          {isInteractive &&
                                            isAdmin &&
                                            isFirstRound &&
                                            hasPlayer1b &&
                                            !match.winnerSlot &&
                                            onClearMatchSlot && (
                                              <button
                                                type="button"
                                                className="btn-clear-slot"
                                                title="Quitar compañero de Dupla 1"
                                                onClick={() => onClearMatchSlot(match.id, '1b')}
                                              >
                                                ✕
                                              </button>
                                            )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* VS & SWAP ROW */}
                              <div className="match-vs-row">
                                <span className="match-vs-divider">vs</span>
                                {isInteractive &&
                                  isAdmin &&
                                  isFirstRound &&
                                  !match.winnerSlot &&
                                  onSwapMatchSlots &&
                                  (hasTeam1 || hasTeam2) && (
                                    <button
                                      type="button"
                                      className="btn-swap-slots"
                                      title="Intercambiar posiciones (Dupla 1 ⇅ Dupla 2)"
                                      onClick={() => onSwapMatchSlots(match.id)}
                                    >
                                      ⇅ Swap
                                    </button>
                                  )}
                              </div>

                              {/* DUPLA 2 */}
                              <div
                                className={
                                  'doubles-team-card' +
                                  (match.winnerSlot === 2
                                    ? ' is-winner-team'
                                    : match.winnerSlot === 1
                                    ? ' is-loser-team'
                                    : '')
                                }
                              >
                                <div className="doubles-team-header-row">
                                  <span className="doubles-team-title">👥 Dupla 2</span>
                                  {match.winnerSlot === 2 && (
                                    <span className="winner-tick">
                                      <Check size={13} />
                                    </span>
                                  )}
                                </div>

                                {isDupla2Bye ? (
                                  <div
                                    className={
                                      'player-slot is-bye-slot is-doubles-slot' +
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
                                      <span className="player-slot-cat">Avanza Dupla 1</span>
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
                                  <div className="doubles-duo-slots">
                                    {/* CASILLA 2A (JUGADOR 1) */}
                                    {isInteractive && isAdmin && isFirstRound && !hasPlayer2 && onAssignPlayerToSlot ? (
                                      <div className="player-slot is-unassigned-interactive is-doubles-slot">
                                        <div className="slot-picker-wrap">
                                          <select
                                            className="slot-interactive-picker doubles-slot-picker"
                                            value=""
                                            onChange={(e) => {
                                              if (e.target.value) {
                                                onAssignPlayerToSlot(match.id, '2a', e.target.value)
                                              }
                                            }}
                                          >
                                            <option value="">+ Jugador 1 (Dupla 2)...</option>
                                            <option value="__BYE__">⚡ Asignar BYE a Dupla 2</option>
                                            {groupsList.map((g) => (
                                              <optgroup key={g.id} label={g.nombre}>
                                                {(g.participantes || []).map((p) => {
                                                  const status = getPlayerAssignmentStatus(p, match.id, '2a')
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
                                          {hasTeam1 && !isDupla1Bye && onAssignBye && (
                                            <button
                                              type="button"
                                              className="btn-quick-give-bye"
                                              title="Otorgar victoria por BYE a Dupla 1"
                                              onClick={() => onAssignBye(match, 2)}
                                            >
                                              <Zap size={11} /> Dar BYE
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="player-slot is-doubles-slot">
                                        <div className="player-slot-info">
                                          <div className="player-slot-name-row">
                                            {groupP2 && <span className="slot-group-origin-tag">{groupP2}</span>}
                                            <span className="player-slot-name">
                                              {hasPlayer2 ? match.player2.name : (isFirstRound ? 'Por definir' : 'Ganador Dupla 2')}
                                            </span>
                                          </div>
                                          {hasPlayer2 && match.player2.categoria && (
                                            <span className="player-slot-cat">{match.player2.categoria}</span>
                                          )}
                                        </div>
                                        <div className="slot-right-actions">
                                          {isInteractive &&
                                            isAdmin &&
                                            isFirstRound &&
                                            hasPlayer2 &&
                                            !match.winnerSlot &&
                                            onClearMatchSlot && (
                                              <button
                                                type="button"
                                                className="btn-clear-slot"
                                                title="Quitar de Dupla 2"
                                                onClick={() => onClearMatchSlot(match.id, '2a')}
                                              >
                                                ✕
                                              </button>
                                            )}
                                        </div>
                                      </div>
                                    )}

                                    {/* CASILLA 2B (JUGADOR 2) */}
                                    {isInteractive && isAdmin && isFirstRound && !hasPlayer2b && onAssignPlayerToSlot ? (
                                      <div className="player-slot is-unassigned-interactive is-doubles-slot">
                                        <div className="slot-picker-wrap">
                                          <select
                                            className="slot-interactive-picker doubles-slot-picker"
                                            value=""
                                            onChange={(e) => {
                                              if (e.target.value) {
                                                onAssignPlayerToSlot(match.id, '2b', e.target.value)
                                              }
                                            }}
                                          >
                                            <option value="">+ Jugador 2 (Dupla 2)...</option>
                                            {groupsList.map((g) => (
                                              <optgroup key={g.id} label={g.nombre}>
                                                {(g.participantes || []).map((p) => {
                                                  const status = getPlayerAssignmentStatus(p, match.id, '2b')
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
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="player-slot is-doubles-slot">
                                        <div className="player-slot-info">
                                          <div className="player-slot-name-row">
                                            {groupP2b && <span className="slot-group-origin-tag">{groupP2b}</span>}
                                            <span className="player-slot-name">
                                              {hasPlayer2b ? match.player2b.name : (isFirstRound ? 'Por definir' : (hasPlayer2 ? 'Compañero' : 'Por definir'))}
                                            </span>
                                          </div>
                                          {hasPlayer2b && match.player2b.categoria && (
                                            <span className="player-slot-cat">{match.player2b.categoria}</span>
                                          )}
                                        </div>
                                        <div className="slot-right-actions">
                                          {isInteractive &&
                                            isAdmin &&
                                            isFirstRound &&
                                            hasPlayer2b &&
                                            !match.winnerSlot &&
                                            onClearMatchSlot && (
                                              <button
                                                type="button"
                                                className="btn-clear-slot"
                                                title="Quitar compañero de Dupla 2"
                                                onClick={() => onClearMatchSlot(match.id, '2b')}
                                              >
                                                ✕
                                              </button>
                                            )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            /* SINGLES (2 JUGADORES: P1 vs P2) */
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
                                        {hasPlayer1 ? match.player1.name : (isFirstRound ? 'Por definir' : 'Ganador anterior')}
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
                                        {hasPlayer2 ? match.player2.name : (isFirstRound ? 'Por definir' : 'Ganador anterior')}
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
                          )}

                          {isAdmin && (
                            <div className="match-admin-actions">
                              {hasMatchConflict && !match.winnerSlot && (
                                <div className="match-conflict-banner">
                                  <div className="match-conflict-title">
                                    ⚠️ {isSamePlayer ? 'Mismo jugador en varias casillas' : 'Jugador duplicado en la ronda'}
                                  </div>
                                  <div className="match-conflict-hint">
                                    {isSamePlayer
                                      ? 'Un jugador no puede competir consigo mismo o repetirse en el partido. Retira uno usando el botón ✕.'
                                      : 'Este jugador ya está asignado en otra llave de la ronda. Retira la casilla duplicada con ✕.'}
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

                              {!match.winnerSlot && ((hasTeam1 && isDupla2Bye) || (hasTeam2 && isDupla1Bye)) && onAssignBye && (
                                <button
                                  type="button"
                                  className="btn-enter-score btn-bye-highlight"
                                  onClick={() => onAssignBye(match, isDupla1Bye ? 1 : 2)}
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

                              {!match.isLive && canScore && onOpenScoreModal && !((hasTeam1 && isDupla2Bye) || (hasTeam2 && isDupla1Bye)) && (
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
