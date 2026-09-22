import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDbPool, query } from '../config/db.js';
import { ADMIN_SEED, RANKING_SEED, TOURNAMENTS_SEED, SPONSORS_SEED, NEWS_SEED } from './seedData.js';
import { hashDni } from '../utils/dniHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase() {
  const pool = await getDbPool();
  if (!pool) {
    console.warn('[initDb] Base de datos no disponible al inicio. Se intentará reconectar en las peticiones.');
    return false;
  }

  try {
    // 1. Ejecutar schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');

    // Separar las sentencias CREATE TABLE
    const statements = sqlContent
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      await query(stmt);
    }
    console.log('[initDb] Tablas verificadas y creadas correctamente en MySQL.');

    // 1.1 Migraciones seguras para tablas existentes
    const safeMigrations = [
      'ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS fase_grupos JSON NULL;',
      'ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS es_grupal BOOLEAN DEFAULT FALSE;',
      'ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS nombre_equipo VARCHAR(150) NULL;',
      'ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS foto_equipo VARCHAR(255) NULL;',
      'ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS integrantes JSON NULL;',
      'ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS jugador1 JSON NULL;',
      'ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS jugador2 JSON NULL;',
      'ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS jugador3 JSON NULL;',
      'ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS jugador4 JSON NULL;',
      'ALTER TABLE inscriptions ADD COLUMN IF NOT EXISTS jugador5 JSON NULL;'
    ];

    for (const mig of safeMigrations) {
      try {
        await query(mig);
      } catch (mErr) {
        // En versiones antiguas de MySQL que no admiten IF NOT EXISTS en ALTER TABLE, se ignora error de columna duplicada
      }
    }

    // 2. Verificar y sembrar cuenta Administrador en `users`
    const usersCount = await query('SELECT COUNT(*) as cnt FROM users');
    if (usersCount[0].cnt === 0) {
      await query(
        `INSERT INTO users (
          id, nombre, email, password_hash, auth_provider, dni_masked, dni_hash,
          telefono, whatsapp, categoria, rol, es_admin, perfil_incompleto,
          completado_onboarding, avatar_url, fecha_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ADMIN_SEED.id,
          ADMIN_SEED.nombre,
          ADMIN_SEED.email,
          ADMIN_SEED.password_hash,
          ADMIN_SEED.auth_provider,
          ADMIN_SEED.dni_masked,
          ADMIN_SEED.dni_hash,
          ADMIN_SEED.telefono,
          ADMIN_SEED.whatsapp,
          ADMIN_SEED.categoria,
          ADMIN_SEED.rol,
          ADMIN_SEED.es_admin,
          ADMIN_SEED.perfil_incompleto,
          ADMIN_SEED.completado_onboarding,
          ADMIN_SEED.avatar_url,
          ADMIN_SEED.fecha_registro
        ]
      );

      // Sembrar también a los jugadores del ranking como usuarios registrados
      for (const p of RANKING_SEED) {
        await query(
          `INSERT INTO users (
            id, nombre, email, dni_masked, dni_hash, categoria, rol, es_admin,
            perfil_incompleto, completado_onboarding, avatar_url, fecha_registro
          ) VALUES (?, ?, ?, ?, ?, ?, 'Jugador ATAP', FALSE, FALSE, TRUE, ?, ?)`,
          [
            p.id,
            p.name,
            `${p.name.toLowerCase().replace(/\s+/g, '.')}@amateur.pe`,
            p.dni,
            hashDni(p.dni),
            p.categoria,
            p.image || '/assets/logo.png',
            '2026-01-15'
          ]
        );
      }
      console.log('[initDb] Cuenta Administrador y jugadores base sembrados en `users`.');
    }

    // 3. Sembrar tabla `ranking`
    const rankCount = await query('SELECT COUNT(*) as cnt FROM ranking');
    if (rankCount[0].cnt === 0) {
      for (const p of RANKING_SEED) {
        await query(
          `INSERT INTO ranking (
            id, user_id, name, dni_masked, dni_hash, modalidad, categoria,
            puntos_num, points_str, titulos, titulos_ganados, efectividad,
            mano_dominante, mejor_golpe, avatar_url
          ) VALUES (?, ?, ?, ?, ?, 'singles', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id,
            p.id,
            p.name,
            p.dni,
            hashDni(p.dni),
            p.categoria,
            p.puntosNum,
            p.points,
            p.titulos,
            p.titulos,
            p.efectividad,
            p.mano || 'Diestro',
            p.golpe || 'Drive cruzado',
            p.image || '/assets/logo.png'
          ]
        );
      }
      console.log('[initDb] Ranking oficial sembrado en `ranking`.');
    }

    // 4. Sembrar tabla `tournaments`
    const tourneyCount = await query('SELECT COUNT(*) as cnt FROM tournaments');
    if (tourneyCount[0].cnt === 0) {
      for (const t of TOURNAMENTS_SEED) {
        await query(
          `INSERT INTO tournaments (
            id, title, slug, estado, modalidad, categoria, fechas_display,
            fecha_inicio, fecha_fin, sede, direccion, superficie, precio,
            precio_display, premio, imagen_url, descripcion, es_destacado,
            categorias_cupos, grupos, bracket
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            t.id,
            t.title,
            t.slug,
            t.estado,
            t.modalidad,
            t.categoria,
            t.fechasDisplay,
            t.fechaInicio,
            t.fechaFin,
            t.sede,
            t.direccion,
            t.superficie,
            t.precio,
            t.precioDisplay,
            t.premio,
            t.imagenUrl,
            t.descripcion,
            t.esDestacado,
            JSON.stringify(t.categoriasCupos || []),
            JSON.stringify(t.grupos || []),
            JSON.stringify(t.bracket || null)
          ]
        );
      }
      console.log('[initDb] Torneos iniciales sembrados en `tournaments`.');
    }

    // 5. Sembrar `sponsors`
    const sponsorCount = await query('SELECT COUNT(*) as cnt FROM sponsors');
    if (sponsorCount[0].cnt === 0) {
      for (const sp of SPONSORS_SEED) {
        await query(
          `INSERT INTO sponsors (id, name, category, logo_url, link, description, active, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [sp.id, sp.name, sp.category, sp.logoUrl, sp.link, sp.description, sp.active, sp.orderIndex]
        );
      }
    }

    // 6. Sembrar `news`
    const newsCount = await query('SELECT COUNT(*) as cnt FROM news');
    if (newsCount[0].cnt === 0) {
      for (const n of NEWS_SEED) {
        await query(
          `INSERT INTO news (id, title, summary, content, category, image_url, author, date_display, featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [n.id, n.title, n.summary, n.content, n.category, n.imageUrl, n.author, n.dateDisplay, n.featured]
        );
      }
    }

    // 7. Sembrar `site_settings` (Configuración oficial de Yape)
    const yapeSetting = await query('SELECT setting_key FROM site_settings WHERE setting_key = "atap_yape_config"');
    if (yapeSetting.length === 0) {
      const defaultYape = JSON.stringify({
        numero: '962 168 953',
        numeroRaw: '962168953',
        titular: 'DOMINGUEZ ALBINES ALVARO RAFAEL',
        ruc: '10722166634',
        entidad: 'Asociación de Tenistas Amateur del Perú'
      });
      await query('INSERT INTO site_settings (setting_key, setting_value) VALUES ("atap_yape_config", ?)', [defaultYape]);
      console.log('[initDb] Configuración oficial de Yape sembrada en `site_settings`.');
    }

    const imgsSetting = await query('SELECT setting_key FROM site_settings WHERE setting_key = "atap_site_images"');
    if (imgsSetting.length === 0) {
      const defaultImgs = JSON.stringify({
        heroBanner: '/assets/hero1.png',
        eventoBanner: '/assets/Evento.png',
        logoPlatino: '/assets/Logo Platino.png',
        logoAtap: '/assets/logo.png',
        heroSlides: [
          { id: 'slide-1', image: '/assets/hero1.png', title: 'Circuito Oficial de Tenis Amateur', subtitle: 'Torneos en las mejores canchas de Lima' },
          { id: 'slide-2', image: '/assets/Evento.png', title: 'Inscripciones Abiertas 2026', subtitle: 'Compite, suma puntos y sube en el ranking ATAP' },
          { id: 'slide-3', image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=85', title: 'Master Series de Lima', subtitle: 'El torneo más esperado de la temporada' }
        ]
      });
      await query('INSERT INTO site_settings (setting_key, setting_value) VALUES ("atap_site_images", ?)', [defaultImgs]);
      console.log('[initDb] Banners e imágenes oficiales del sitio sembrados en `site_settings`.');
    }

    const bannersSetting = await query('SELECT setting_key FROM site_settings WHERE setting_key = "atap_home_banners"');
    if (bannersSetting.length === 0) {
      const defaultBanners = JSON.stringify({
        signupBanner: {
          kicker: 'Regístrate ahora',
          title: 'Inscripciones abiertas',
          highlight: 'torneos de tenis',
          description: 'Participa en nuestros torneos y demuestra tu talento en la cancha.',
          buttonText: 'Registrarse',
          buttonAction: 'register',
          buttonLink: '#registro',
          image: '/assets/Evento.png'
        },
        socialBanner: {
          eyebrow: 'SÍGUENOS EN REDES',
          title: 'Todo el tenis,\nen un solo lugar.',
          description: 'Mantente al día con los torneos, resultados, noticias y mucho más. ¡Sé parte de nuestra comunidad!',
          instagramUrl: 'https://www.instagram.com/atap_tenisperu/',
          whatsappUrl: 'https://wa.me/51977884423',
          image: '/assets/redes.png'
        }
      });
      await query('INSERT INTO site_settings (setting_key, setting_value) VALUES ("atap_home_banners", ?)', [defaultBanners]);
      console.log('[initDb] Banners de Home sembrados en `site_settings`.');
    }

    return true;
  } catch (err) {
    console.error('[initDb] Error inicializando base de datos:', err);
    return false;
  }
}

export default initDatabase;
