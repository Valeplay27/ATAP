import { query } from '../config/db.js';
import { maskDni, hashDni } from '../utils/dniHelper.js';

export async function createInscription(req, res) {
  try {
    const { tournamentId } = req.params;
    const {
      nombre, dni, email, telefono, categoria, modalidad,
      esDobles, nombre2, dni2, email2, telefono2,
      esGrupal, nombreEquipo, fotoEquipo, integrantes,
      jugador1, jugador2, jugador3, jugador4, jugador5,
      metodoPago, comprobanteUrl, comprobanteInfo, estadoPago
    } = req.body;

    if (!nombre || !dni) {
      return res.status(400).json({ error: 'El nombre y DNI del jugador o capitán son obligatorios.' });
    }

    const cleanDni = String(dni).trim().replace(/\s+/g, '');
    const maskedDni1 = maskDni(cleanDni);
    const dHash1 = hashDni(cleanDni);

    let maskedDni2 = null;
    let dHash2 = null;
    if (esDobles) {
      const name2 = nombre2 || jugador2?.nombre;
      const d2 = dni2 || jugador2?.dni;
      if (name2 && d2) {
        const cleanDni2 = String(d2).trim().replace(/\s+/g, '');
        maskedDni2 = maskDni(cleanDni2);
        dHash2 = hashDni(cleanDni2);
      }
    }

    const isGrupal = Boolean(esGrupal || modalidad === 'grupal' || modalidad === 'equipos');
    const inscId = `insc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString().split('T')[0];

    await query(
      `INSERT INTO inscriptions (
        id, tournament_id, user_id, nombre, dni_masked, dni_hash, email, telefono,
        categoria, modalidad, es_dobles, nombre2, dni_masked2, dni_hash2, email2, telefono2,
        es_grupal, nombre_equipo, foto_equipo, integrantes,
        jugador1, jugador2, jugador3, jugador4, jugador5,
        estado_pago, metodo_pago, comprobante_url, comprobante_info, fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        isGrupal ? 'grupal' : (esDobles ? 'dobles' : 'singles'),
        Boolean(esDobles),
        nombre2 ? nombre2.trim() : (jugador2?.nombre || null),
        maskedDni2,
        dHash2,
        email2 || (jugador2?.email || null),
        telefono2 || (jugador2?.telefono || null),
        isGrupal,
        nombreEquipo || null,
        fotoEquipo || null,
        integrantes ? JSON.stringify(integrantes) : null,
        jugador1 ? JSON.stringify(jugador1) : null,
        jugador2 ? JSON.stringify(jugador2) : null,
        jugador3 ? JSON.stringify(jugador3) : null,
        jugador4 ? JSON.stringify(jugador4) : null,
        jugador5 ? JSON.stringify(jugador5) : null,
        estadoPago || 'pendiente',
        metodoPago || 'Yape',
        comprobanteUrl || null,
        comprobanteInfo || 'Inscripción enviada desde la plataforma web',
        now
      ]
    );

    return res.status(201).json({
      message: 'Inscripción registrada correctamente en MySQL.',
      inscriptionId: inscId
    });
  } catch (error) {
    console.error('Error en createInscription:', error);
    return res.status(500).json({ error: 'Error al registrar la inscripción.' });
  }
}

export async function getInscriptionsByTournament(req, res) {
  try {
    const { tournamentId } = req.params;
    const rows = await query('SELECT * FROM inscriptions WHERE tournament_id = ? ORDER BY created_at ASC', [tournamentId]);

    const mapped = rows.map((i) => ({
      id: i.id,
      nombre: i.nombre,
      name: i.nombre,
      dni: i.dni_masked,
      documentoIdentidad: i.dni_masked,
      email: i.email,
      telefono: i.telefono,
      whatsapp: i.telefono,
      categoria: i.categoria,
      modalidad: i.modalidad,
      esDobles: Boolean(i.es_dobles),
      esGrupal: Boolean(i.es_grupal),
      nombreEquipo: i.nombre_equipo,
      fotoEquipo: i.foto_equipo,
      integrantes: typeof i.integrantes === 'string' ? JSON.parse(i.integrantes) : (i.integrantes || []),
      jugador1: typeof i.jugador1 === 'string' ? JSON.parse(i.jugador1) : (i.jugador1 || null),
      jugador2: typeof i.jugador2 === 'string' ? JSON.parse(i.jugador2) : (i.jugador2 || null),
      jugador3: typeof i.jugador3 === 'string' ? JSON.parse(i.jugador3) : (i.jugador3 || null),
      jugador4: typeof i.jugador4 === 'string' ? JSON.parse(i.jugador4) : (i.jugador4 || null),
      jugador5: typeof i.jugador5 === 'string' ? JSON.parse(i.jugador5) : (i.jugador5 || null),
      estadoPago: i.estado_pago,
      metodoPago: i.metodo_pago,
      comprobanteUrl: i.comprobante_url,
      comprobanteInfo: i.comprobante_info,
      fechaRegistro: i.fecha_registro
    }));

    return res.json(mapped);
  } catch (error) {
    console.error('Error en getInscriptionsByTournament:', error);
    return res.status(500).json({ error: 'Error al obtener inscripciones.' });
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
  getInscriptionsByTournament,
  updateStatus,
  addToBank,
  deleteInscription
};
