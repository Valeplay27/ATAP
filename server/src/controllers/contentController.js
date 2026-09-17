import { query } from '../config/db.js';

// --- NOTICIAS ---
export async function getNews(req, res) {
  try {
    const rows = await query('SELECT * FROM news ORDER BY created_at DESC');
    return res.json(rows);
  } catch (error) {
    console.error('Error en getNews:', error);
    return res.status(500).json({ error: 'Error al obtener noticias.' });
  }
}

export async function saveNews(req, res) {
  try {
    const { id, title, summary, content, category, imageUrl, author, dateDisplay, featured } = req.body;
    const newsId = id || `news-${Date.now()}`;

    const existing = await query('SELECT id FROM news WHERE id = ?', [newsId]);
    if (existing.length > 0) {
      await query(
        'UPDATE news SET title = ?, summary = ?, content = ?, category = ?, image_url = ?, author = ?, date_display = ?, featured = ? WHERE id = ?',
        [title, summary, content, category, imageUrl, author || 'Comité ATAP', dateDisplay, Boolean(featured), newsId]
      );
    } else {
      await query(
        'INSERT INTO news (id, title, summary, content, category, image_url, author, date_display, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newsId, title, summary, content, category, imageUrl, author || 'Comité ATAP', dateDisplay, Boolean(featured)]
      );
    }

    return res.json({ message: 'Noticia guardada exitosamente.', id: newsId });
  } catch (error) {
    console.error('Error en saveNews:', error);
    return res.status(500).json({ error: 'Error al guardar noticia.' });
  }
}

export async function deleteNews(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM news WHERE id = ?', [id]);
    return res.json({ message: 'Noticia eliminada correctamente.' });
  } catch (error) {
    console.error('Error en deleteNews:', error);
    return res.status(500).json({ error: 'Error al eliminar noticia.' });
  }
}

// --- AUSPICIADORES (SPONSORS) ---
export async function getSponsors(req, res) {
  try {
    const rows = await query('SELECT * FROM sponsors ORDER BY order_index ASC, created_at ASC');
    return res.json(rows.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      logoUrl: s.logo_url,
      link: s.link,
      description: s.description,
      active: Boolean(s.active),
      orderIndex: s.order_index
    })));
  } catch (error) {
    console.error('Error en getSponsors:', error);
    return res.status(500).json({ error: 'Error al obtener auspiciadores.' });
  }
}

export async function saveSponsor(req, res) {
  try {
    const { id, name, category, logoUrl, link, description, active, orderIndex } = req.body;
    const sponsorId = id || `sp-${Date.now()}`;

    const existing = await query('SELECT id FROM sponsors WHERE id = ?', [sponsorId]);
    if (existing.length > 0) {
      await query(
        'UPDATE sponsors SET name = ?, category = ?, logo_url = ?, link = ?, description = ?, active = ?, order_index = ? WHERE id = ?',
        [name, category, logoUrl, link, description, active !== undefined ? Boolean(active) : true, orderIndex || 0, sponsorId]
      );
    } else {
      await query(
        'INSERT INTO sponsors (id, name, category, logo_url, link, description, active, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [sponsorId, name, category, logoUrl, link, description, active !== undefined ? Boolean(active) : true, orderIndex || 0]
      );
    }

    return res.json({ message: 'Auspiciador guardado exitosamente.', id: sponsorId });
  } catch (error) {
    console.error('Error en saveSponsor:', error);
    return res.status(500).json({ error: 'Error al guardar auspiciador.' });
  }
}

export async function deleteSponsor(req, res) {
  try {
    const { id } = req.params;
    await query('DELETE FROM sponsors WHERE id = ?', [id]);
    return res.json({ message: 'Auspiciador eliminado correctamente.' });
  } catch (error) {
    console.error('Error en deleteSponsor:', error);
    return res.status(500).json({ error: 'Error al eliminar auspiciador.' });
  }
}

// --- CONFIGURACIÓN DEL SITIO (HERO SLIDES, POLÍTICAS) ---
export async function getSetting(req, res) {
  try {
    const { key } = req.params;
    const rows = await query('SELECT setting_value FROM site_settings WHERE setting_key = ?', [key]);
    if (rows.length === 0) {
      return res.json(null);
    }
    const val = typeof rows[0].setting_value === 'string' ? JSON.parse(rows[0].setting_value) : rows[0].setting_value;
    return res.json(val);
  } catch (error) {
    console.error('Error en getSetting:', error);
    return res.status(500).json({ error: 'Error al obtener configuración.' });
  }
}

export async function saveSetting(req, res) {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const valStr = JSON.stringify(value);

    const existing = await query('SELECT setting_key FROM site_settings WHERE setting_key = ?', [key]);
    if (existing.length > 0) {
      await query('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?', [valStr, key]);
    } else {
      await query('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', [key, valStr]);
    }

    return res.json({ message: 'Configuración guardada correctamente.' });
  } catch (error) {
    console.error('Error en saveSetting:', error);
    return res.status(500).json({ error: 'Error al guardar configuración.' });
  }
}

export default {
  getNews,
  saveNews,
  deleteNews,
  getSponsors,
  saveSponsor,
  deleteSponsor,
  getSetting,
  saveSetting
};
