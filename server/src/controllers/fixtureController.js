import { query } from '../config/db.js';

export async function saveGroups(req, res) {
  try {
    const { tournamentId } = req.params;
    const { grupos } = req.body;

    await query('UPDATE tournaments SET grupos = ? WHERE id = ?', [JSON.stringify(grupos || []), tournamentId]);
    return res.json({ message: 'Grupos actualizados correctamente.' });
  } catch (error) {
    console.error('Error en saveGroups:', error);
    return res.status(500).json({ error: 'Error al guardar grupos.' });
  }
}

export async function saveBracket(req, res) {
  try {
    const { tournamentId } = req.params;
    const { bracket } = req.body;

    await query('UPDATE tournaments SET bracket = ? WHERE id = ?', [JSON.stringify(bracket || null), tournamentId]);
    return res.json({ message: 'Cuadro de llaves actualizado correctamente.' });
  } catch (error) {
    console.error('Error en saveBracket:', error);
    return res.status(500).json({ error: 'Error al guardar cuadro de llaves.' });
  }
}

export async function recordMatchScore(req, res) {
  try {
    const { tournamentId, matchId } = req.params;
    const { winnerSlot, score, pointsAward = 100 } = req.body;

    const rows = await query('SELECT title, bracket, grupos FROM tournaments WHERE id = ?', [tournamentId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Torneo no encontrado.' });
    }

    const t = rows[0];
    let bracket = typeof t.bracket === 'string' ? JSON.parse(t.bracket) : (t.bracket || null);
    let winnerName = null;

    if (bracket && Array.isArray(bracket.rounds)) {
      for (const round of bracket.rounds) {
        if (Array.isArray(round.matches)) {
          const match = round.matches.find((m) => m.id === matchId);
          if (match) {
            match.score = score;
            match.status = 'finalizado';
            const winner = winnerSlot === 1 ? match.player1 : match.player2;
            winnerName = winner ? (winner.nombre || winner.name) : null;
            match.winner = winnerName;

            // Si es la final, declarar campeón
            if (round.roundName === 'Final' || round.roundIndex === bracket.rounds.length) {
              bracket.champion = winner;
            }
            break;
          }
        }
      }

      await query('UPDATE tournaments SET bracket = ? WHERE id = ?', [JSON.stringify(bracket), tournamentId]);
    }

    // Premiar puntos al ganador en el ranking si existe
    if (winnerName) {
      const cleanWinner = winnerName.trim();
      const rankRows = await query('SELECT * FROM ranking WHERE LOWER(TRIM(name)) = LOWER(?)', [cleanWinner]);

      if (rankRows.length > 0) {
        const currentPoints = (rankRows[0].puntos_num || 0) + Number(pointsAward);
        await query(
          'UPDATE ranking SET puntos_num = ?, points_str = ? WHERE id = ?',
          [currentPoints, `${currentPoints.toLocaleString()} pts`, rankRows[0].id]
        );
      }
    }

    return res.json({
      message: 'Resultado registrado y puntos de ranking sumados exitosamente.',
      bracket
    });
  } catch (error) {
    console.error('Error en recordMatchScore:', error);
    return res.status(500).json({ error: 'Error al registrar marcador.' });
  }
}

export default {
  saveGroups,
  saveBracket,
  recordMatchScore
};
