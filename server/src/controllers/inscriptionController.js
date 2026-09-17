import { query } from '../config/db.js';
import { maskDni, hashDni } from '../utils/dniHelper.js';

export async function createInscription(req, res) {
  try {
    const { tournamentId } = req.params;
    const {
      nombre, dni, email, telefono, categoria, modalidad,
      esDobles, nombre2, dni2, email2, telefono2,
      metodoPago, comprobanteUrl, comprobanteInfo
    } = req.body;

    if (!nombre || !dni) {
      return res.status(400).json({ error: 'El nombre y DNI del jugador 1 son obligatorios.' });
    }

    const cleanDni = String(dni).trim().replace(/\s+/g, '');
    const maskedDni1 = maskDni(cleanDni);
    const dHash1 = hashDni(cleanDni);

    let maskedDni2 = null;
    let dHash2 = null;
    if (esDobles) {
      if (!nombre2 || !dni2) {
        return res.status(400).json({ error: 'El nombre y DNI del jugador 2 son obligatorios para la modalidad dobles.' });
      }
      const cleanDni2 = String(dni2).trim().replace(/\s+/g, '');
      maskedDni2 = maskDni(cleanDni2);
      dHash2 = hashDni(cleanDni2);
    }

    const inscId = `insc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString().split('T')[0];

    await query(
      `INSERT INTO inscriptions (
        id, tournament_id, user_id, nombre, dni_masked, dni_hash, email, telefono,
        categoria, modalidad, es_dobles, nombre2, dni_masked2, dni_hash2, email2, telefono2,
        estado_pago, metodo_pago, comprobante_url, comprobante_info, fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?, ?, ?)`,
      [
        inscId,
        tournamentId,
        req.user?.id || null,
        nombre.trim(),
        maskedDni1,
        dHash1,
        email || '',
        telefono || '',
        categoria || '4ta',
        modalidad || (esDobles ? 'dobles' : 'singles'),
        Boolean(esDobles),
        nombre2 ? nombre2.trim() : null,
        maskedDni2,
        dHash2,
        email2 || null,
        telefono2 || null,
        metodoPago || 'Yape',
        comprobanteUrl || null,
        comprobanteInfo || 'Inscripción enviada desde la plataforma web',
        now
      ]
    );

    return res.status(201).json({
      message: 'Inscripción registrada correctamente. Pendiente de validación de pago.',
      inscriptionId: inscId
    });
  } catch (error) {
    console.error('Error en createInscription:', error);
    return res.status(500).json({ error: 'Error al registrar la inscripción.' });
  }
}

export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { estadoPago } = req.body;

    if (!['pendiente', 'aprobado', 'rechazado'].includes(estadoPago)) {
      return res.status(400).json({ error: 'Estado de pago no válido.' });
    }

    await query('UPDATE inscriptions SET estado_pago = ? WHERE id = ?', [estadoPago, id]);
    return res.json({ message: `Estado de inscripción actualizado a ${estadoPago}.` });
  } catch (error) {
    console.error('Error en updateStatus:', error);
    return res.status(500).json({ error: 'Error al actualizar estado de la inscripción.' });
  }
}

export async function addToBank(req, res) {
  try {
    const { tournamentId } = req.params;
    const { nombre, dni, categoria, email, telefono } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del jugador es requerido.' });
    }

    const cleanDni = (dni || '').toString().trim().replace(/\s+/g, '');
    const masked = cleanDni ? maskDni(cleanDni) : 'S/D';
    const dHash = cleanDni ? hashDni(cleanDni) : null;
    const inscId = `insc-bank-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];

    await query(
      `INSERT INTO inscriptions (
        id, tournament_id, nombre, dni_masked, dni_hash, email, telefono,
        categoria, estado_pago, metodo_pago, comprobante_info, fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aprobado', 'Aprobado por Administración', 'Agregado al banco de participantes', ?)`,
      [inscId, tournamentId, nombre.trim(), masked, dHash, email || '', telefono || '', categoria || '4ta', now]
    );

    return res.status(201).json({ message: 'Jugador añadido al banco de participantes del torneo.' });
  } catch (error) {
    console.error('Error en addToBank:', error);
    return res.status(500).json({ error: 'Error al agregar jugador al banco.' });
  }
}

export async function deleteInscription(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM inscriptions WHERE id = ?', [id]);
    return res.json({ message: 'Inscripción eliminada correctamente.' });
  } catch (error) {
    console.error('Error en deleteInscription:', error);
    return res.status(500).json({ error: 'Error al eliminar inscripción.' });
  }
}

export default {
  createInscription,
  updateStatus,
  addToBank,
  deleteInscription
};
