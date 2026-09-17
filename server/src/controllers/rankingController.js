import { query } from '../config/db.js';

export async function getLeaderboard(req, res) {
  try {
    const { categoria, modalidad = 'singles' } = req.query;

    let sql = 'SELECT * FROM ranking WHERE modalidad = ?';
    const params = [modalidad];

    if (categoria && categoria !== 'Todas' && categoria !== 'todas') {
      sql += ' AND categoria = ?';
      params.push(categoria);
    }

    sql += ' ORDER BY puntos_num DESC, created_at ASC';

    const rows = await query(sql, params);

    const players = rows.map((p, index) => ({
      id: p.id,
      position: index + 1,
      name: p.name,
      dni: p.dni_masked,
      modalidad: p.modalidad,
      categoria: p.categoria,
      puntosNum: p.puntos_num,
      points: p.points_str,
      titulos: p.titulos,
      titulosGanados: p.titulos_ganados,
      efectividad: p.efectividad,
      manoDominante: p.mano_dominante,
      mejorGolpe: p.mejor_golpe,
      image: p.avatar_url || '/assets/logo.png',
      avatar: p.avatar_url || '/assets/logo.png'
    }));

    return res.json(players);
  } catch (error) {
    console.error('Error en getLeaderboard:', error);
    return res.status(500).json({ error: 'Error al obtener tabla de ranking.' });
  }
}

export async function getPlayerDetail(req, res) {
  try {
    const { id } = req.params;
    const rows = await query('SELECT * FROM ranking WHERE id = ? OR name = ?', [id, id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Jugador no encontrado en el ranking.' });
    }
    const p = rows[0];
    return res.json({
      id: p.id,
      name: p.name,
      dni: p.dni_masked,
      categoria: p.categoria,
      puntosNum: p.puntos_num,
      points: p.points_str,
      titulos: p.titulos,
      titulosGanados: p.titulos_ganados,
      efectividad: p.efectividad,
      manoDominante: p.mano_dominante,
      mejorGolpe: p.mejor_golpe,
      image: p.avatar_url || '/assets/logo.png',
      historialPartidos: typeof p.historial_partidos === 'string' ? JSON.parse(p.historial_partidos) : (p.historial_partidos || [])
    });
  } catch (error) {
    console.error('Error en getPlayerDetail:', error);
    return res.status(500).json({ error: 'Error al obtener detalle del jugador.' });
  }
}

export default {
  getLeaderboard,
  getPlayerDetail
};
