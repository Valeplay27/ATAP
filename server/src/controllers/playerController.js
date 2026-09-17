import { query } from '../config/db.js';
import { maskDni, hashDni } from '../utils/dniHelper.js';

export async function getAllPlayers(req, res) {
  try {
    const users = await query('SELECT * FROM users ORDER BY created_at DESC');

    // Combinar con puntos actuales del ranking
    const rankings = await query('SELECT user_id, name, dni_hash, puntos_num, points_str FROM ranking');
    const rankMap = new Map();
    rankings.forEach((r) => {
      if (r.user_id) rankMap.set(r.user_id, r);
      if (r.dni_hash) rankMap.set(r.dni_hash, r);
      if (r.name) rankMap.set(r.name.toLowerCase().trim(), r);
    });

    const players = users.map((u) => {
      const rMatch = rankMap.get(u.id) || (u.dni_hash ? rankMap.get(u.dni_hash) : null) || rankMap.get(u.nombre.toLowerCase().trim());
      const ptsNum = rMatch ? rMatch.puntos_num : 0;
      const ptsStr = rMatch ? rMatch.points_str : `${ptsNum} pts`;

      return {
        id: u.id,
        nombre: u.nombre,
        name: u.nombre,
        dni: u.dni_masked,
        documentoIdentidad: u.dni_masked,
        email: u.email,
        telefono: u.telefono || u.whatsapp || '',
        whatsapp: u.whatsapp || u.telefono || '',
        categoria: u.categoria || '4ta',
        rol: u.rol,
        esAdmin: Boolean(u.es_admin),
        perfilIncompleto: Boolean(u.perfil_incompleto),
        completadoOnboarding: Boolean(u.completado_onboarding),
        puntosNum: ptsNum,
        points: ptsStr,
        avatar: u.avatar_url || '/assets/logo.png',
        image: u.avatar_url || '/assets/logo.png',
        fechaRegistro: u.fecha_registro
      };
    });

    return res.json(players);
  } catch (error) {
    console.error('Error en getAllPlayers:', error);
    return res.status(500).json({ error: 'Error al obtener directorio de jugadores.' });
  }
}

export async function savePlayer(req, res) {
  try {
    const {
      id, originalDni, nombre, dni, documentoIdentidad,
      email, telefono, whatsapp, categoria, puntos, puntosNum,
      avatar, image, perfilIncompleto
    } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: 'El nombre del jugador es obligatorio.' });
    }

    const rawDni = (dni || documentoIdentidad || '').toString().trim().replace(/\s+/g, '');
    const cleanNombre = nombre.trim();
    const maskedDni = rawDni ? maskDni(rawDni) : 'S/D';
    const dHash = rawDni ? hashDni(rawDni) : null;
    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = (telefono || whatsapp || '').trim();
    const cleanCat = categoria || '4ta';
    const pts = Number(puntos !== undefined ? puntos : (puntosNum !== undefined ? puntosNum : 0)) || 0;
    const cleanAvatar = avatar || image || '/assets/logo.png';
    const now = new Date().toISOString().split('T')[0];

    // Buscar si ya existe por ID, por DNI hash o por email
    let existingUser = null;
    if (id) {
      const rows = await query('SELECT * FROM users WHERE id = ?', [id]);
      if (rows.length > 0) existingUser = rows[0];
    }
    if (!existingUser && dHash) {
      const rows = await query('SELECT * FROM users WHERE dni_hash = ?', [dHash]);
      if (rows.length > 0) existingUser = rows[0];
    }
    if (!existingUser && cleanEmail) {
      const rows = await query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
      if (rows.length > 0) existingUser = rows[0];
    }

    let userId = existingUser ? existingUser.id : (id || `user-${Date.now()}`);

    if (existingUser) {
      await query(
        `UPDATE users SET
          nombre = ?, email = COALESCE(?, email), dni_masked = ?,
          dni_hash = COALESCE(?, dni_hash), telefono = ?, whatsapp = ?,
          categoria = ?, avatar_url = ?, perfil_incompleto = ?
        WHERE id = ?`,
        [cleanNombre, cleanEmail, maskedDni, dHash, cleanPhone, cleanPhone, cleanCat, cleanAvatar, Boolean(perfilIncompleto), userId]
      );
    } else {
      await query(
        `INSERT INTO users (
          id, nombre, email, dni_masked, dni_hash, telefono, whatsapp,
          categoria, rol, es_admin, perfil_incompleto, completado_onboarding,
          avatar_url, fecha_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Jugador ATAP', FALSE, ?, TRUE, ?, ?)`,
        [userId, cleanNombre, cleanEmail, maskedDni, dHash, cleanPhone, cleanPhone, cleanCat, Boolean(perfilIncompleto), cleanAvatar, now]
      );
    }

    // Sincronizar en tabla `ranking`
    const rankRows = await query('SELECT * FROM ranking WHERE user_id = ? OR dni_hash = ? OR LOWER(TRIM(name)) = LOWER(?)', [userId, dHash, cleanNombre]);
    if (rankRows.length > 0) {
      await query(
        `UPDATE ranking SET
          name = ?, dni_masked = ?, dni_hash = COALESCE(?, dni_hash),
          categoria = ?, puntos_num = ?, points_str = ?, avatar_url = ?
        WHERE id = ?`,
        [cleanNombre, maskedDni, dHash, cleanCat, pts, `${pts.toLocaleString()} pts`, cleanAvatar, rankRows[0].id]
      );
    } else {
      await query(
        `INSERT INTO ranking (
          id, user_id, name, dni_masked, dni_hash, modalidad, categoria,
          puntos_num, points_str, titulos, titulos_ganados, avatar_url
        ) VALUES (?, ?, ?, ?, ?, 'singles', ?, ?, ?, 0, 0, ?)`,
        [`p-${userId}`, userId, cleanNombre, maskedDni, dHash, cleanCat, pts, `${pts.toLocaleString()} pts`, cleanAvatar]
      );
    }

    return res.json({
      message: 'Jugador guardado y sincronizado con éxito.',
      id: userId
    });
  } catch (error) {
    console.error('Error en savePlayer:', error);
    return res.status(500).json({ error: 'Error al guardar jugador.' });
  }
}

export async function deletePlayer(req, res) {
  try {
    const { id } = req.params;

    const userRows = await query('SELECT * FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Jugador no encontrado.' });
    }

    const u = userRows[0];
    if (u.email === 'vladimiryt18@gmail.com' || u.dni_masked === '*****000') {
      return res.status(403).json({ error: 'La cuenta del Administrador no puede ser eliminada.' });
    }

    // Eliminar de `users`
    await query('DELETE FROM users WHERE id = ?', [id]);

    // Eliminar de `ranking`
    await query('DELETE FROM ranking WHERE user_id = ? OR LOWER(TRIM(name)) = LOWER(?)', [id, u.nombre.trim()]);

    // Eliminar de `inscriptions`
    await query('DELETE FROM inscriptions WHERE user_id = ? OR LOWER(TRIM(nombre)) = LOWER(?)', [id, u.nombre.trim()]);

    return res.json({ message: `Jugador "${u.nombre}" eliminado del sistema correctamente.` });
  } catch (error) {
    console.error('Error en deletePlayer:', error);
    return res.status(500).json({ error: 'Error al eliminar jugador.' });
  }
}

export async function updateAvatar(req, res) {
  try {
    const { id } = req.params;
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ error: 'URL de avatar no proporcionada.' });
    }

    // Actualizar en `users`
    await query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, id]);

    // Actualizar en `ranking`
    await query('UPDATE ranking SET avatar_url = ? WHERE user_id = ?', [avatarUrl, id]);

    return res.json({ message: 'Foto de perfil actualizada exitosamente.', avatarUrl });
  } catch (error) {
    console.error('Error en updateAvatar:', error);
    return res.status(500).json({ error: 'Error al actualizar foto de perfil.' });
  }
}

export default {
  getAllPlayers,
  savePlayer,
  deletePlayer,
  updateAvatar
};
