import { query } from '../config/db.js';

export async function getAllTournaments(req, res) {
  try {
    const rows = await query('SELECT * FROM tournaments ORDER BY fecha_inicio DESC, created_at DESC');

    // Mapear campos a formato esperado por el frontend
    const tournaments = await Promise.all(
      rows.map(async (t) => {
        const inscRows = await query('SELECT * FROM inscriptions WHERE tournament_id = ? ORDER BY created_at ASC', [t.id]).catch(() => []);

        const mappedInsc = (inscRows || []).map((i) => ({
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
          jugador2: typeof i.jugador2 === 'string' ? JSON.parse(i.jugador2) : (i.jugador2 || (i.es_dobles ? { nombre: i.nombre2, dni: i.dni_masked2 } : null)),
          jugador3: typeof i.jugador3 === 'string' ? JSON.parse(i.jugador3) : (i.jugador3 || null),
          jugador4: typeof i.jugador4 === 'string' ? JSON.parse(i.jugador4) : (i.jugador4 || null),
          jugador5: typeof i.jugador5 === 'string' ? JSON.parse(i.jugador5) : (i.jugador5 || null),
          estadoPago: i.estado_pago,
          metodoPago: i.metodo_pago,
          comprobanteUrl: i.comprobante_url,
          comprobanteInfo: i.comprobante_info,
          fechaRegistro: i.fecha_registro
        }));

        const faseGruposParsed = typeof t.fase_grupos === 'string'
          ? JSON.parse(t.fase_grupos)
          : (t.fase_grupos || (typeof t.bracket === 'string' ? JSON.parse(t.bracket)?.faseGrupos : t.bracket?.faseGrupos) || []);

        return {
          id: t.id,
          title: t.title,
          slug: t.slug,
          estado: t.estado,
          modalidad: t.modalidad,
          categoria: t.categoria,
          fechas: t.fechas_display,
          date: t.fechas_display,
          fechaInicio: t.fecha_inicio,
          fechaFin: t.fecha_fin,
          sede: t.sede,
          place: t.sede,
          direccion: t.direccion,
          superficie: t.superficie,
          precio: Number(t.precio),
          precioDisplay: t.precio_display,
          premio: t.premio,
          imagen: t.imagen_url,
          image: t.imagen_url,
          descripcion: t.descripcion,
          esDestacado: Boolean(t.es_destacado),
          categorias: typeof t.categorias_cupos === 'string' ? JSON.parse(t.categorias_cupos) : (t.categorias_cupos || []),
          grupos: typeof t.grupos === 'string' ? JSON.parse(t.grupos) : (t.grupos || []),
          faseGrupos: faseGruposParsed,
          bracket: typeof t.bracket === 'string' ? JSON.parse(t.bracket) : (t.bracket || null),
          inscripciones: mappedInsc
        };
      })
    );

    return res.json(tournaments);
  } catch (error) {
    console.error('Error en getAllTournaments:', error);
    return res.status(500).json({ error: 'Error al obtener torneos.' });
  }
}

export async function getTournamentById(req, res) {
  try {
    const { id } = req.params;
    const rows = await query('SELECT * FROM tournaments WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Torneo no encontrado.' });
    }

    const t = rows[0];
    const inscriptions = await query('SELECT * FROM inscriptions WHERE tournament_id = ? ORDER BY created_at ASC', [id]);

    const mappedInsc = inscriptions.map((i) => ({
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
      jugador2: typeof i.jugador2 === 'string' ? JSON.parse(i.jugador2) : (i.jugador2 || (i.es_dobles ? { nombre: i.nombre2, dni: i.dni_masked2 } : null)),
      jugador3: typeof i.jugador3 === 'string' ? JSON.parse(i.jugador3) : (i.jugador3 || null),
      jugador4: typeof i.jugador4 === 'string' ? JSON.parse(i.jugador4) : (i.jugador4 || null),
      jugador5: typeof i.jugador5 === 'string' ? JSON.parse(i.jugador5) : (i.jugador5 || null),
      estadoPago: i.estado_pago,
      metodoPago: i.metodo_pago,
      comprobanteUrl: i.comprobante_url,
      comprobanteInfo: i.comprobante_info,
      fechaRegistro: i.fecha_registro
    }));

    const faseGruposParsed = typeof t.fase_grupos === 'string'
      ? JSON.parse(t.fase_grupos)
      : (t.fase_grupos || (typeof t.bracket === 'string' ? JSON.parse(t.bracket)?.faseGrupos : t.bracket?.faseGrupos) || []);

    return res.json({
      id: t.id,
      title: t.title,
      slug: t.slug,
      estado: t.estado,
      modalidad: t.modalidad,
      categoria: t.categoria,
      fechas: t.fechas_display,
      date: t.fechas_display,
      fechaInicio: t.fecha_inicio,
      fechaFin: t.fecha_fin,
      sede: t.sede,
      place: t.sede,
      direccion: t.direccion,
      superficie: t.superficie,
      precio: Number(t.precio),
      precioDisplay: t.precio_display,
      premio: t.premio,
      imagen: t.imagen_url,
      image: t.imagen_url,
      descripcion: t.descripcion,
      esDestacado: Boolean(t.es_destacado),
      categorias: typeof t.categorias_cupos === 'string' ? JSON.parse(t.categorias_cupos) : (t.categorias_cupos || []),
      grupos: typeof t.grupos === 'string' ? JSON.parse(t.grupos) : (t.grupos || []),
      faseGrupos: faseGruposParsed,
      bracket: typeof t.bracket === 'string' ? JSON.parse(t.bracket) : (t.bracket || null),
      inscripciones: mappedInsc
    });
  } catch (error) {
    console.error('Error en getTournamentById:', error);
    return res.status(500).json({ error: 'Error al obtener detalle del torneo.' });
  }
}

export async function createTournament(req, res) {
  try {
    const data = req.body;
    const tourneyId = data.id || `torneo-${Date.now()}`;
    const slug = data.slug || (data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

    await query(
      `INSERT INTO tournaments (
        id, title, slug, estado, modalidad, categoria, fechas_display,
        fecha_inicio, fecha_fin, sede, direccion, superficie, precio,
        precio_display, premio, imagen_url, descripcion, es_destacado,
        categorias_cupos, grupos, fase_grupos, bracket
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tourneyId,
        data.title,
        slug,
        data.estado || 'abierto',
        data.modalidad || 'singles',
        data.categoria || '4ta, 5ta A, 5ta B, 6ta',
        data.fechas || data.fechasDisplay || data.date || '',
        data.fechaInicio || null,
        data.fechaFin || null,
        data.sede || data.place || 'Sede ATAP',
        data.direccion || '',
        data.superficie || 'Arcilla / Polvo de Ladrillo',
        Number(data.precio) || 80.00,
        data.precioDisplay || `S/ ${data.precio || 80}.00`,
        data.premio || '',
        data.imagen || data.imagenUrl || data.image || '/assets/apertura.jpg',
        data.descripcion || '',
        Boolean(data.esDestacado),
        JSON.stringify(data.categorias || data.categoriasCupos || []),
        JSON.stringify(data.grupos || []),
        JSON.stringify(data.faseGrupos || []),
        JSON.stringify(data.bracket || null)
      ]
    );

    return res.status(201).json({ message: 'Torneo creado exitosamente en MySQL.', id: tourneyId });
  } catch (error) {
    console.error('Error en createTournament:', error);
    return res.status(500).json({ error: 'Error al crear torneo.' });
  }
}

export async function updateTournament(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const updates = [];
    const params = [];

    if (data.title) { updates.push('title = ?'); params.push(data.title); }
    if (data.estado) { updates.push('estado = ?'); params.push(data.estado); }
    if (data.modalidad) { updates.push('modalidad = ?'); params.push(data.modalidad); }
    if (data.categoria) { updates.push('categoria = ?'); params.push(data.categoria); }
    if (data.fechas || data.fechasDisplay || data.date) { updates.push('fechas_display = ?'); params.push(data.fechas || data.fechasDisplay || data.date); }
    if (data.fechaInicio) { updates.push('fecha_inicio = ?'); params.push(data.fechaInicio); }
    if (data.fechaFin) { updates.push('fecha_fin = ?'); params.push(data.fechaFin); }
    if (data.sede || data.place) { updates.push('sede = ?'); params.push(data.sede || data.place); }
    if (data.direccion) { updates.push('direccion = ?'); params.push(data.direccion); }
    if (data.superficie) { updates.push('superficie = ?'); params.push(data.superficie); }
    if (data.precio !== undefined) {
      updates.push('precio = ?');
      params.push(Number(data.precio));
      updates.push('precio_display = ?');
      params.push(data.precioDisplay || `S/ ${Number(data.precio)}.00`);
    }
    if (data.premio) { updates.push('premio = ?'); params.push(data.premio); }
    if (data.imagen || data.imagenUrl || data.image) { updates.push('imagen_url = ?'); params.push(data.imagen || data.imagenUrl || data.image); }
    if (data.descripcion) { updates.push('descripcion = ?'); params.push(data.descripcion); }
    if (data.esDestacado !== undefined) { updates.push('es_destacado = ?'); params.push(Boolean(data.esDestacado)); }
    if (data.categorias || data.categoriasCupos) { updates.push('categorias_cupos = ?'); params.push(JSON.stringify(data.categorias || data.categoriasCupos)); }
    if (data.grupos) { updates.push('grupos = ?'); params.push(JSON.stringify(data.grupos)); }
    if (data.faseGrupos) { updates.push('fase_grupos = ?'); params.push(JSON.stringify(data.faseGrupos)); }
    if (data.bracket) { updates.push('bracket = ?'); params.push(JSON.stringify(data.bracket)); }

    if (updates.length > 0) {
      params.push(id);
      await query(`UPDATE tournaments SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    return res.json({ message: 'Torneo actualizado exitosamente.' });
  } catch (error) {
    console.error('Error en updateTournament:', error);
    return res.status(500).json({ error: 'Error al actualizar torneo.' });
  }
}

export async function deleteTournament(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM tournaments WHERE id = ?', [id]);
    return res.json({ message: 'Torneo eliminado correctamente.' });
  } catch (error) {
    console.error('Error en deleteTournament:', error);
    return res.status(500).json({ error: 'Error al eliminar torneo.' });
  }
}

export default {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament
};
