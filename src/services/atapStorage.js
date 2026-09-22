// Centralized Storage Service for ATAP
// Manages Tournaments, Inscriptions, Brackets, Ranking Leaderboard, and Site Images
import { tournamentApi, rankingApi, playerApi, contentApi } from './api'
import { getAssetUrl, handleImageFallback } from '../utils/assetHelper'

export { getAssetUrl, handleImageFallback }

export const STORAGE_KEYS = {
  TOURNEYS: 'atap_torneos',
  RANKING: 'atap_ranking',
  DOUBLES_RANKING: 'atap_ranking_dobles',
  IMAGES: 'atap_site_images',
  USER: 'atap_usuario',
  SPONSORS: 'atap_sponsors',
  REGISTERED_USERS: 'atap_usuarios_registrados',
  NEWS: 'atap_comunidad_noticias',
  SEASONS_ARCHIVE: 'atap_temporadas_historicas',
  ACTIVE_SEASON: 'atap_temporada_activa',
  POLICIES: 'atap_politicas_reglas',
  HOME_BANNERS: 'atap_home_banners',
  CONTACT_INFO: 'atap_contacto_soporte',
  DAILY_RECOVERY_KEY: 'atap_clave_recuperacion_diaria',
  YAPE_CONFIG: 'atap_yape_config'
};

export const DEFAULT_YAPE_CONFIG = {
  numero: '962 168 953',
  numeroRaw: '962168953',
  titular: 'DOMINGUEZ ALBINES ALVARO RAFAEL',
  ruc: '10722166634',
  entidad: 'Asociación de Tenistas Amateur del Perú'
};

export function getYapeConfig() {
  try {
    if (typeof localStorage === 'undefined') return DEFAULT_YAPE_CONFIG;
    const raw = localStorage.getItem(STORAGE_KEYS.YAPE_CONFIG);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.YAPE_CONFIG, JSON.stringify(DEFAULT_YAPE_CONFIG));
      return DEFAULT_YAPE_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_YAPE_CONFIG, ...parsed };
  } catch (e) {
    return DEFAULT_YAPE_CONFIG;
  }
}

export function saveYapeConfig(config) {
  try {
    const cleanNum = String(config?.numero || '').replace(/\D/g, '');
    const formatted = {
      numero: (config?.numero || '962 168 953').trim(),
      numeroRaw: cleanNum || '962168953',
      titular: (config?.titular || '').trim() || DEFAULT_YAPE_CONFIG.titular,
      ruc: (config?.ruc || '').trim() || DEFAULT_YAPE_CONFIG.ruc,
      entidad: (config?.entidad || '').trim() || DEFAULT_YAPE_CONFIG.entidad
    };
    localStorage.setItem(STORAGE_KEYS.YAPE_CONFIG, JSON.stringify(formatted));
    emitAtapUpdate(STORAGE_KEYS.YAPE_CONFIG, formatted);

    // Sincronizar con backend MySQL / SiteGround
    contentApi.saveSetting('atap_yape_config', formatted).catch((err) => {
      console.warn('[ATAP] Sincronización de Yape con servidor pendiente:', err);
    });

    return formatted;
  } catch (e) {
    console.error('Error saving yape config:', e);
    return DEFAULT_YAPE_CONFIG;
  }
}

// Categorías oficiales exclusivas del circuito amateur de tenis ATAP (de mayor a menor nivel)
export const OFFICIAL_CATEGORIES = ['4ta', '5ta A', '5ta B', '6ta'];
export const ALL_OFFICIAL_CATEGORIES = ['1ra', '2da', '3ra', '4ta', '5ta A', '5ta B', '5ta P', '6ta'];

// Zonas y distritos oficiales ATAP (Canchas de juego y sedes de torneos)
export const ATAP_ZONAS_DISTRITOS = [
  {
    id: 'Lima Norte',
    nombre: 'Lima Norte',
    alias: 'Norte',
    color: '#F97316',
    dot: '🟠',
    distritos: 'Los Olivos, SMP, Independencia, Comas, Carabayllo, Puente Piedra',
    distritosCompleto: 'Los Olivos, San Martín de Porres (SMP), Independencia, Comas, Carabayllo, Puente Piedra'
  },
  {
    id: 'Lima Centro',
    nombre: 'Lima Centro',
    alias: 'Centro',
    color: '#A855F7',
    dot: '🟣',
    distritos: 'Cercado, Breña, Lince, Jesús María, La Victoria, Rímac',
    distritosCompleto: 'Cercado de Lima, Breña, Lince, Jesús María, La Victoria, Rímac'
  },
  {
    id: 'Lima Sur',
    nombre: 'Lima Sur',
    alias: 'Sur',
    color: '#22C55E',
    dot: '🟢',
    distritos: 'Surco, Barranco, Chorrillos, SJM, VES, VMT, Lurín',
    distritosCompleto: 'Surco, Barranco, Chorrillos, San Juan de Miraflores (SJM), Villa El Salvador (VES), Villa María del Triunfo (VMT), Lurín'
  },
  {
    id: 'Lima Este',
    nombre: 'Lima Este',
    alias: 'Este',
    color: '#3B82F6',
    dot: '🔵',
    distritos: 'La Molina, Ate, Santa Anita, San Luis, SJL, Cieneguilla',
    distritosCompleto: 'La Molina, Ate, Santa Anita, San Luis, San Juan de Lurigancho (SJL), Cieneguilla'
  },
  {
    id: 'Lima Oeste',
    nombre: 'Lima Oeste',
    alias: 'Oeste',
    color: '#EF4444',
    dot: '🔴',
    distritos: 'Miraflores, San Isidro, Magdalena, San Miguel, Pueblo Libre, San Borja',
    distritosCompleto: 'Miraflores, San Isidro, Magdalena, San Miguel, Pueblo Libre, San Borja'
  }
];

export function getZonaDistritos(zonaName) {
  if (!zonaName) return null;
  const clean = String(zonaName).trim().toLowerCase();
  return (
    ATAP_ZONAS_DISTRITOS.find(
      (z) =>
        z.id.toLowerCase() === clean ||
        z.nombre.toLowerCase() === clean ||
        z.alias.toLowerCase() === clean ||
        z.alias.toLowerCase() === clean.replace('lima ', '') ||
        clean.includes(z.alias.toLowerCase())
    ) || null
  );
}

// Helper de normalización robusta de categorías (soporta variantes con/sin "Categoría" o "Dobles")
export function normalizeCategory(cat) {
  if (!cat) return '';
  return cat
    .toString()
    .toLowerCase()
    .replace(/categor[ií]a/gi, '')
    .replace(/dobles/gi, '')
    .replace(/open/gi, '')
    .replace(/intermedio/gi, '')
    .replace(/amateur/gi, '')
    .trim();
}

// Helper de privacidad: Oculta los primeros dígitos del DNI dejando visibles ÚNICAMENTE los últimos 3 dígitos
export function maskDni(dni) {
  if (!dni && dni !== 0) return '';
  const str = String(dni).trim();
  if (!str || str === 'S/D' || str === 'N/A') return 'S/D';

  // Si ya viene enmascarado con asteriscos o puntos
  if (str.includes('*') || str.includes('•')) {
    const clean = str.replace(/\s+/g, '');
    const last3 = clean.slice(-3);
    const prefix = clean.slice(0, -3);
    return (prefix.length > 0 ? prefix : '*****') + last3;
  }

  const clean = str.replace(/\s+/g, '');
  if (clean.length <= 3) {
    return '*****' + clean;
  }

  const last3 = clean.slice(-3);
  const hiddenCount = Math.max(clean.length - 3, 3);
  return '*'.repeat(hiddenCount) + last3;
}

// Gestión de Jugadores Favoritos / Seguidos (Personalizado por Usuario Autenticado)
export function getUserFollowedPlayers(userKey) {
  if (!userKey) return [];
  const cleanKey = String(userKey).trim().toLowerCase().replace(/[^a-z0-9_@.-]/g, '_');
  try {
    const raw = localStorage.getItem(`atap_seguidos_${cleanKey}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function setUserFollowedPlayers(userKey, list) {
  if (!userKey) return;
  const cleanKey = String(userKey).trim().toLowerCase().replace(/[^a-z0-9_@.-]/g, '_');
  try {
    localStorage.setItem(`atap_seguidos_${cleanKey}`, JSON.stringify(list || []));
    window.dispatchEvent(new Event('atap_favorites_updated'));
  } catch (e) {}
}

export function isPlayerFollowed(favoritesList, player) {
  if (!Array.isArray(favoritesList) || !player) return false;
  const pId = player.id ? String(player.id).trim() : null;
  const pPos = player.position ? String(player.position).trim() : null;
  const pName = player.name ? String(player.name).trim().toLowerCase() : null;

  return favoritesList.some((fav) => {
    const favStr = String(fav).trim();
    if (pId && favStr === pId) return true;
    if (pPos && favStr === pPos) return true;
    if (pName && favStr.toLowerCase() === pName) return true;
    return false;
  });
}

export function toggleUserFollowedPlayer(userKey, player) {
  if (!userKey || !player) return [];
  const keyIdentifier = player.id
    ? String(player.id).trim()
    : (player.position ? String(player.position).trim() : String(player.name || '').trim());
  if (!keyIdentifier) return [];

  const current = getUserFollowedPlayers(userKey);
  const alreadyFav = isPlayerFollowed(current, player);

  let updated;
  if (alreadyFav) {
    const pId = player.id ? String(player.id).trim() : null;
    const pPos = player.position ? String(player.position).trim() : null;
    const pName = player.name ? String(player.name).trim().toLowerCase() : null;
    updated = current.filter((fav) => {
      const favStr = String(fav).trim();
      if (pId && favStr === pId) return false;
      if (pPos && favStr === pPos) return false;
      if (pName && favStr.toLowerCase() === pName) return false;
      return true;
    });
  } else {
    updated = [...current, keyIdentifier];
  }

  setUserFollowedPlayers(userKey, updated);
  return updated;
}

export const INITIAL_REGISTERED_USERS = [
  {
    dni: '*****000',
    documentoIdentidad: '*****000',
    nombre: 'Administrador ATAP',
    email: 'vladimiryt18@gmail.com',
    telefono: '977884423',
    whatsapp: '977884423',
    categoria: 'Comité ATAP',
    rol: 'Administrador',
    esAdmin: true,
    iniciales: 'AD',
    avatar: '/assets/logo.png',
    image: '/assets/logo.png',
    perfilIncompleto: false,
    completadoOnboarding: true
  }
];

// Reinicio automático de datos de registro: Solo existe el administrador oficial
const RESET_USERS_VERSION = 'atap_reset_admin_only_v3';
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (localStorage.getItem(RESET_USERS_VERSION) !== 'done') {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(INITIAL_REGISTERED_USERS));
      
      const currentUserRaw = localStorage.getItem(STORAGE_KEYS.USER);
      if (currentUserRaw) {
        try {
          const u = JSON.parse(currentUserRaw);
          if (u.email?.toLowerCase() !== 'vladimiryt18@gmail.com') {
            localStorage.removeItem(STORAGE_KEYS.USER);
          }
        } catch {}
      }

      const tourneysRaw = localStorage.getItem(STORAGE_KEYS.TOURNEYS);
      if (tourneysRaw) {
        try {
          const tourneys = JSON.parse(tourneysRaw);
          if (Array.isArray(tourneys)) {
            const cleaned = tourneys.map((t) => ({ ...t, inscripciones: [] }));
            localStorage.setItem(STORAGE_KEYS.TOURNEYS, JSON.stringify(cleaned));
          }
        } catch {}
      }

      localStorage.setItem(RESET_USERS_VERSION, 'done');
      if (typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new Event('atap_data_updated'));
      }
    }
  }
} catch (e) {
  console.error('Error al inicializar el reseteo de registros:', e);
}

// Sanitización de seguridad: Enmascara automáticamente cualquier DNI previo en localStorage para proteger la privacidad
export function sanitizeStorageDnis() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    // 1. Usuarios Registrados
    const usersRaw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      let changed = false;
      for (const u of users) {
        if (u.dni && !String(u.dni).includes('*')) {
          u.dni = maskDni(u.dni);
          changed = true;
        }
        if (u.documentoIdentidad && !String(u.documentoIdentidad).includes('*')) {
          u.documentoIdentidad = maskDni(u.documentoIdentidad);
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
      }
    }

    // 2. Ranking de Jugadores
    const rankRaw = localStorage.getItem(STORAGE_KEYS.RANKING);
    if (rankRaw) {
      const ranking = JSON.parse(rankRaw);
      let changed = false;
      for (const p of ranking) {
        if (p.dni && !String(p.dni).includes('*')) {
          p.dni = maskDni(p.dni);
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.RANKING, JSON.stringify(ranking));
      }
    }

    // 3. Torneos (Inscripciones, Grupos y Llaves)
    const tourneysRaw = localStorage.getItem(STORAGE_KEYS.TOURNEYS);
    if (tourneysRaw) {
      const tourneys = JSON.parse(tourneysRaw);
      let changed = false;
      for (const t of tourneys) {
        if (t.inscripciones && Array.isArray(t.inscripciones)) {
          for (const insc of t.inscripciones) {
            if (insc.dni && !String(insc.dni).includes('*')) {
              insc.dni = maskDni(insc.dni);
              changed = true;
            }
            if (insc.documentoIdentidad && !String(insc.documentoIdentidad).includes('*')) {
              insc.documentoIdentidad = maskDni(insc.documentoIdentidad);
              changed = true;
            }
            if (insc.jugador1?.dni && !String(insc.jugador1.dni).includes('*')) {
              insc.jugador1.dni = maskDni(insc.jugador1.dni);
              changed = true;
            }
            if (insc.jugador2?.dni && !String(insc.jugador2.dni).includes('*')) {
              insc.jugador2.dni = maskDni(insc.jugador2.dni);
              changed = true;
            }
          }
        }
        if (t.faseGrupos && Array.isArray(t.faseGrupos)) {
          for (const g of t.faseGrupos) {
            for (const p of (g.participantes || [])) {
              if (p.dni && !String(p.dni).includes('*')) {
                p.dni = maskDni(p.dni);
                changed = true;
              }
            }
          }
        }
        if (t.bracket?.rounds && Array.isArray(t.bracket.rounds)) {
          for (const r of t.bracket.rounds) {
            for (const m of (r.matches || [])) {
              if (m.player1?.dni && !String(m.player1.dni).includes('*')) {
                m.player1.dni = maskDni(m.player1.dni);
                changed = true;
              }
              if (m.player2?.dni && !String(m.player2.dni).includes('*')) {
                m.player2.dni = maskDni(m.player2.dni);
                changed = true;
              }
            }
          }
        }
      }
      if (changed) {
        localStorage.setItem(STORAGE_KEYS.TOURNEYS, JSON.stringify(tourneys));
      }
    }

    // 4. Sesión Activa de Usuario
    for (const key of ['atap_usuario', STORAGE_KEYS.USER]) {
      const userRaw = localStorage.getItem(key);
      if (userRaw) {
        const u = JSON.parse(userRaw);
        let changed = false;
        if (u.dni && !String(u.dni).includes('*')) {
          u.dni = maskDni(u.dni);
          changed = true;
        }
        if (u.documentoIdentidad && !String(u.documentoIdentidad).includes('*')) {
          u.documentoIdentidad = maskDni(u.documentoIdentidad);
          changed = true;
        }
        if (changed) {
          localStorage.setItem(key, JSON.stringify(u));
        }
      }
    }
  } catch (e) {
    console.error('Error al sanitizar DNIs en almacenamiento:', e);
  }
}

// Ejecución inmediata de sanitización al cargar el módulo
sanitizeStorageDnis();

export const INITIAL_TOURNAMENTS = [
  {
    id: 't-apertura-2026',
    title: 'Torneo Apertura ATAP 2026',
    level: 'Nacional',
    place: 'Club Lawn Tennis de la Exposición',
    date: '15 Mar - 29 Mar 2026',
    fechaInicio: '2026-03-15',
    fechaFin: '2026-03-29',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=85',
    precio: 85,
    estado: 'inscripciones_abiertas',
    modalidad: 'singles',
    categorias: [
      { id: 'cat-4', nombre: '4ta', cupos: 16 },
      { id: 'cat-5a', nombre: '5ta A', cupos: 16 },
      { id: 'cat-5b', nombre: '5ta B', cupos: 32 },
      { id: 'cat-6', nombre: '6ta', cupos: 32 }
    ],
    inscripciones: [],
    bracket: null
  },
  {
    id: 't-copa-dobles-2026',
    title: 'Copa Nacional de Dúos y Dobles ATAP',
    level: 'Nacional',
    place: 'Rinconada Country Club',
    date: '12 Abr - 26 Abr 2026',
    fechaInicio: '2026-04-12',
    fechaFin: '2026-04-26',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=85',
    precio: 140,
    estado: 'proximo',
    modalidad: 'dobles',
    categorias: [
      { id: 'cat-d4', nombre: '4ta Dobles', cupos: 16 },
      { id: 'cat-d5a', nombre: '5ta A Dobles', cupos: 16 },
      { id: 'cat-d5b', nombre: '5ta B Dobles', cupos: 16 }
    ],
    inscripciones: [],
    bracket: null
  },
  {
    id: 't-copa-equipos-2026',
    title: 'Copa Interclubes por Equipos ATAP 2026',
    level: 'Interclubes',
    place: 'Centro Naval del Perú - San Borja',
    date: '10 May - 31 May 2026',
    fechaInicio: '2026-05-10',
    fechaFin: '2026-05-31',
    image: '/assets/Evento.png',
    precio: 350,
    estado: 'inscripciones_abiertas',
    modalidad: 'grupal',
    categorias: [
      { id: 'cat-g4', nombre: '4ta Equipos', cupos: 8 },
      { id: 'cat-g5a', nombre: '5ta A Equipos', cupos: 8 },
      { id: 'cat-g5b', nombre: '5ta B Equipos', cupos: 16 }
    ],
    inscripciones: [],
    bracket: null
  },
  {
    id: 't-master-lima-2026',
    title: 'Master Series de Lima 2026',
    level: 'Master',
    place: 'Club Terrazas Miraflores',
    date: '14 Jun - 28 Jun 2026',
    fechaInicio: '2026-06-14',
    fechaFin: '2026-06-28',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=500&q=85',
    precio: 110,
    estado: 'proximo',
    modalidad: 'singles',
    categorias: [
      { id: 'cat-4', nombre: '4ta', cupos: 16 },
      { id: 'cat-5a', nombre: '5ta A', cupos: 16 },
      { id: 'cat-5b', nombre: '5ta B', cupos: 32 }
    ],
    inscripciones: [],
    bracket: null
  },
  {
    id: 't-verano-2026',
    title: 'Torneo Relámpago de Verano ATAP',
    level: 'Circuito',
    place: 'Club Terrazas Miraflores',
    date: '01 Feb - 15 Feb 2026',
    fechaInicio: '2026-02-01',
    fechaFin: '2026-02-15',
    image: 'https://images.unsplash.com/photo-1530915365347-9b4b6e0b3d16?auto=format&fit=crop&w=500&q=85',
    precio: 80,
    estado: 'finalizado',
    modalidad: 'singles',
    categorias: [
      { id: 'cat-4', nombre: '4ta', cupos: 16 },
      { id: 'cat-5a', nombre: '5ta A', cupos: 16 }
    ],
    inscripciones: [],
    bracket: {
      champion: { name: 'Diego Sánchez', nombre: 'Diego Sánchez' }
    },
    resultados: [
      {
        id: 'res-verano-final',
        ronda: 'Gran Final',
        ganador: 'Diego Sánchez',
        score: '6-4, 6-3',
        puntos: 250,
        fechaCarga: '2026-02-15'
      }
    ]
  },
  {
    id: 't-copa-pretemporada-2026',
    title: 'Copa Desafío de Pretemporada ATAP',
    level: 'Regional',
    place: 'Club Lawn Tennis de la Exposición',
    date: '10 Ene - 25 Ene 2026',
    fechaInicio: '2026-01-10',
    fechaFin: '2026-01-25',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=500&q=85',
    precio: 120,
    estado: 'finalizado',
    modalidad: 'dobles',
    categorias: [
      { id: 'cat-d4', nombre: '4ta Dobles', cupos: 16 }
    ],
    inscripciones: [],
    bracket: {
      champion: { name: 'Mendoza / Gómez', nombre: 'Mendoza / Gómez' }
    },
    resultados: [
      {
        id: 'res-pretemp-final',
        ronda: 'Gran Final',
        ganador: 'Mendoza / Gómez',
        score: '7-6, 6-4',
        puntos: 200,
        fechaCarga: '2026-01-25'
      }
    ]
  }
];

export const INITIAL_RANKING = [
  {
    id: 'p-1',
    position: '01',
    name: 'Luciana Pérez',
    country: 'PER',
    points: '1,240 pts',
    puntosNum: 1240,
    categoria: '4ta',
    dni: '*****567',
    email: 'luciana.perez@atap.pe',
    telefono: '987 112 233',
    genero: 'Femenino',
    manoDominante: 'Diestro',
    mano: 'Diestro',
    mejorGolpe: 'Drive cruzado',
    golpe: 'Drive cruzado',
    titulosGanados: 4,
    titulos: 4,
    zonas: ['Lima Centro', 'Lima Sur'],
    disponibilidad: ['SAB', 'DOM'],
    altura: '1.72 m',
    peso: '62 kg',
    efectividad: '88%',
    club: 'Club Terrazas Miraflores',
    calibracionGolpes: { drive: 92, reves: 88, saque: 85, drop: 80, slice: 84 },
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-2',
    position: '02',
    name: 'Diego Sánchez',
    country: 'PER',
    points: '1,180 pts',
    puntosNum: 1180,
    categoria: '4ta',
    dni: '*****678',
    email: 'diego.sanchez@atap.pe',
    telefono: '977 884 423',
    genero: 'Masculino',
    manoDominante: 'Zurdo',
    mano: 'Zurdo',
    mejorGolpe: 'Revés a 1 mano',
    golpe: 'Reves – 1 mano',
    titulosGanados: 3,
    titulos: 3,
    zonas: ['Lima Sur', 'Lima Este'],
    disponibilidad: ['VIE', 'SAB', 'DOM'],
    altura: '1.82 m',
    peso: '76 kg',
    efectividad: '84%',
    club: 'Rinconada Country Club',
    calibracionGolpes: { drive: 88, reves: 94, saque: 89, drop: 76, slice: 86 },
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-3',
    position: '03',
    name: 'Valeria Torres',
    country: 'PER',
    points: '1,095 pts',
    puntosNum: 1095,
    categoria: '5ta A',
    dni: '*****789',
    email: 'valeria.torres@atap.pe',
    telefono: '987 334 455',
    genero: 'Femenino',
    manoDominante: 'Diestro',
    mano: 'Diestro',
    mejorGolpe: 'Saque plano',
    golpe: 'Saque plano',
    titulosGanados: 2,
    titulos: 2,
    zonas: ['Lima Centro', 'Lima Oeste'],
    disponibilidad: ['SAB', 'DOM'],
    altura: '1.68 m',
    peso: '59 kg',
    efectividad: '79%',
    club: 'Lawn Tennis de la Exposición',
    calibracionGolpes: { drive: 84, reves: 79, saque: 90, drop: 75, slice: 77 },
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-4',
    position: '04',
    name: 'Mateo Rojas',
    country: 'PER',
    points: '980 pts',
    puntosNum: 980,
    categoria: '5ta A',
    dni: '*****890',
    email: 'mateo.rojas@atap.pe',
    telefono: '987 556 677',
    genero: 'Masculino',
    manoDominante: 'Diestro',
    mano: 'Diestro',
    mejorGolpe: 'Drive paralelo',
    golpe: 'Drive paralelo',
    titulosGanados: 1,
    titulos: 1,
    zonas: ['Lima Sur', 'Lima Oeste'],
    disponibilidad: ['SAB', 'DOM'],
    altura: '1.78 m',
    peso: '73 kg',
    efectividad: '75%',
    club: 'Club Regatas Lima',
    calibracionGolpes: { drive: 87, reves: 80, saque: 82, drop: 70, slice: 75 },
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-5',
    position: '05',
    name: 'Camila Mendoza',
    country: 'PER',
    points: '920 pts',
    puntosNum: 920,
    categoria: '5ta B',
    dni: '*****901',
    email: 'camila.mendoza@atap.pe',
    telefono: '987 778 899',
    genero: 'Femenino',
    manoDominante: 'Diestro',
    mano: 'Diestro',
    mejorGolpe: 'Drop Shot',
    golpe: 'Drop Shot',
    titulosGanados: 1,
    titulos: 1,
    zonas: ['Lima Este', 'Lima Centro'],
    disponibilidad: ['LUN', 'MIE', 'SAB'],
    altura: '1.65 m',
    peso: '57 kg',
    efectividad: '72%',
    club: 'Jockey Club del Perú',
    calibracionGolpes: { drive: 78, reves: 75, saque: 73, drop: 88, slice: 74 },
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-6',
    position: '06',
    name: 'Rodrigo Alva',
    country: 'PER',
    points: '860 pts',
    puntosNum: 860,
    categoria: '5ta B',
    dni: '*****012',
    email: 'rodrigo.alva@atap.pe',
    telefono: '987 990 011',
    genero: 'Masculino',
    manoDominante: 'Diestro',
    mano: 'Diestro',
    mejorGolpe: 'Slice defensivo',
    golpe: 'Slice defensivo',
    titulosGanados: 0,
    titulos: 0,
    zonas: ['Lima Norte', 'Lima Centro'],
    disponibilidad: ['VIE', 'SAB'],
    altura: '1.75 m',
    peso: '71 kg',
    efectividad: '68%',
    club: 'Centro Naval San Borja',
    calibracionGolpes: { drive: 75, reves: 74, saque: 76, drop: 72, slice: 85 },
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-7',
    position: '07',
    name: 'Andrea Flores',
    country: 'PER',
    points: '810 pts',
    puntosNum: 810,
    categoria: '5ta B',
    dni: '*****456',
    email: 'andrea.flores@atap.pe',
    telefono: '981 234 567',
    genero: 'Femenino',
    manoDominante: 'Diestro',
    mano: 'Diestro',
    mejorGolpe: 'Revés a 2 manos',
    golpe: 'Reves a 2 manos',
    titulosGanados: 0,
    titulos: 0,
    zonas: ['Lima Oeste', 'Lima Centro'],
    disponibilidad: ['SAB', 'DOM'],
    altura: '1.70 m',
    peso: '61 kg',
    efectividad: '65%',
    club: 'Real Club de Lima',
    calibracionGolpes: { drive: 74, reves: 82, saque: 72, drop: 71, slice: 70 },
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-8',
    position: '08',
    name: 'Joaquín Vargas',
    country: 'PER',
    points: '775 pts',
    puntosNum: 775,
    categoria: '6ta',
    dni: '*****234',
    email: 'joaquin.vargas@atap.pe',
    telefono: '982 345 678',
    genero: 'Masculino',
    manoDominante: 'Zurdo',
    mano: 'Zurdo',
    mejorGolpe: 'Drive cruzado',
    golpe: 'Drive cruzado',
    titulosGanados: 0,
    titulos: 0,
    zonas: ['Lima Este', 'Lima Sur'],
    disponibilidad: ['DOM'],
    altura: '1.80 m',
    peso: '75 kg',
    efectividad: '61%',
    club: 'Rinconada Country Club',
    calibracionGolpes: { drive: 79, reves: 70, saque: 75, drop: 68, slice: 69 },
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-9',
    position: '09',
    name: 'Carlos Benavides',
    country: 'PER',
    points: '1,120 pts',
    puntosNum: 1120,
    categoria: '4ta',
    dni: '*****123',
    email: 'carlos.benavides@atap.pe',
    telefono: '984 112 334',
    genero: 'Masculino',
    manoDominante: 'Diestro',
    mano: 'Diestro',
    mejorGolpe: 'Drive cruzado',
    golpe: 'Drive cruzado',
    titulosGanados: 2,
    titulos: 2,
    zonas: ['Lima Centro', 'Lima Sur'],
    disponibilidad: ['SAB', 'DOM'],
    altura: '1.79 m',
    peso: '74 kg',
    efectividad: '81%',
    club: 'Rinconada Country Club',
    calibracionGolpes: { drive: 89, reves: 84, saque: 86, drop: 78, slice: 82 },
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-10',
    position: '10',
    name: 'Gonzalo Ugarte',
    country: 'PER',
    points: '1,060 pts',
    puntosNum: 1060,
    categoria: '4ta',
    dni: '*****234',
    email: 'gonzalo.ugarte@atap.pe',
    telefono: '985 223 445',
    genero: 'Masculino',
    manoDominante: 'Zurdo',
    mano: 'Zurdo',
    mejorGolpe: 'Saque plano',
    golpe: 'Saque plano',
    titulosGanados: 1,
    titulos: 1,
    zonas: ['Lima Centro', 'Lima Oeste'],
    disponibilidad: ['VIE', 'SAB'],
    altura: '1.83 m',
    peso: '78 kg',
    efectividad: '77%',
    club: 'Club Terrazas Miraflores',
    calibracionGolpes: { drive: 86, reves: 82, saque: 91, drop: 74, slice: 80 },
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-11',
    position: '11',
    name: 'Sebastián Carranza',
    country: 'PER',
    points: '940 pts',
    puntosNum: 940,
    categoria: '5ta A',
    dni: '*****145',
    email: 'sebastian.carranza@atap.pe',
    telefono: '986 334 556',
    genero: 'Masculino',
    manoDominante: 'Diestro',
    mano: 'Diestro',
    mejorGolpe: 'Revés a 1 mano',
    golpe: 'Revés a 1 mano',
    titulosGanados: 1,
    titulos: 1,
    zonas: ['Lima Sur', 'Lima Este'],
    disponibilidad: ['SAB', 'DOM'],
    altura: '1.76 m',
    peso: '71 kg',
    efectividad: '74%',
    club: 'Jockey Club del Perú',
    calibracionGolpes: { drive: 83, reves: 88, saque: 80, drop: 75, slice: 79 },
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-12',
    position: '12',
    name: 'Renzo Delgado',
    country: 'PER',
    points: '890 pts',
    puntosNum: 890,
    categoria: '5ta A',
    dni: '*****201',
    email: 'renzo.delgado@atap.pe',
    telefono: '987 445 667',
    genero: 'Masculino',
    manoDominante: 'Diestro',
    mano: 'Diestro',
    mejorGolpe: 'Slice defensivo',
    golpe: 'Slice defensivo',
    titulosGanados: 1,
    titulos: 1,
    zonas: ['Lima Centro', 'Lima Oeste'],
    disponibilidad: ['VIE', 'SAB', 'DOM'],
    altura: '1.77 m',
    peso: '72 kg',
    efectividad: '71%',
    club: 'Real Club de Lima',
    calibracionGolpes: { drive: 81, reves: 78, saque: 79, drop: 73, slice: 86 },
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-13',
    position: '13',
    name: 'Patricio Ruiz',
    country: 'PER',
    points: '760 pts',
    puntosNum: 760,
    categoria: '5ta B',
    dni: '*****312',
    email: 'patricio.ruiz@atap.pe',
    telefono: '988 556 778',
    genero: 'Masculino',
    manoDominante: 'Diestro',
    mano: 'Diestro',
    mejorGolpe: 'Drive paralelo',
    golpe: 'Drive paralelo',
    titulosGanados: 0,
    titulos: 0,
    zonas: ['Lima Centro', 'Lima Sur'],
    disponibilidad: ['SAB', 'DOM'],
    altura: '1.74 m',
    peso: '69 kg',
    efectividad: '66%',
    club: 'Lawn Tennis de la Exposición',
    calibracionGolpes: { drive: 80, reves: 74, saque: 75, drop: 70, slice: 72 },
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-14',
    position: '14',
    name: 'Emilio Tapia',
    country: 'PER',
    points: '710 pts',
    puntosNum: 710,
    categoria: '6ta',
    dni: '*****423',
    email: 'emilio.tapia@atap.pe',
    telefono: '989 667 889',
    genero: 'Masculino',
    manoDominante: 'Diestro',
    mano: 'Diestro',
    mejorGolpe: 'Saque plano',
    golpe: 'Saque plano',
    titulosGanados: 1,
    titulos: 1,
    zonas: ['Lima Norte', 'Lima Centro'],
    disponibilidad: ['VIE', 'SAB'],
    altura: '1.81 m',
    peso: '77 kg',
    efectividad: '69%',
    club: 'Centro Naval San Borja',
    calibracionGolpes: { drive: 76, reves: 71, saque: 80, drop: 67, slice: 70 },
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-15',
    position: '15',
    name: 'Matías Quintana',
    country: 'PER',
    points: '660 pts',
    puntosNum: 660,
    categoria: '6ta',
    dni: '*****534',
    email: 'matias.quintana@atap.pe',
    telefono: '981 778 990',
    genero: 'Masculino',
    manoDominante: 'Diestro',
    mano: 'Diestro',
    mejorGolpe: 'Drive cruzado',
    golpe: 'Drive cruzado',
    titulosGanados: 0,
    titulos: 0,
    zonas: ['Lima Este', 'Lima Sur'],
    disponibilidad: ['SAB', 'DOM'],
    altura: '1.73 m',
    peso: '68 kg',
    efectividad: '65%',
    club: 'Club de Tenis Lima',
    calibracionGolpes: { drive: 75, reves: 69, saque: 72, drop: 66, slice: 68 },
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-16',
    position: '16',
    name: 'Felipe Bustamante',
    country: 'PER',
    points: '620 pts',
    puntosNum: 620,
    categoria: '6ta',
    dni: '*****645',
    email: 'felipe.bustamante@atap.pe',
    telefono: '982 889 001',
    genero: 'Masculino',
    manoDominante: 'Zurdo',
    mano: 'Zurdo',
    mejorGolpe: 'Drop shot',
    golpe: 'Drop shot',
    titulosGanados: 0,
    titulos: 0,
    zonas: ['Lima Oeste', 'Lima Sur'],
    disponibilidad: ['DOM'],
    altura: '1.76 m',
    peso: '70 kg',
    efectividad: '61%',
    club: 'Rinconada Country Club',
    calibracionGolpes: { drive: 73, reves: 68, saque: 71, drop: 78, slice: 67 },
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=85'
  }
];

export const INITIAL_DOUBLES_RANKING = [
  // 4ta
  {
    id: 'dp-1',
    position: '01',
    name: 'Diego Sánchez',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '4ta',
    puntosNum: 1450,
    points: '1,450 pts',
    titulos: 4,
    efectividad: '88%',
    partidosGanados: 22,
    partidosPerdidos: 3,
    parejaReciente: 'Mateo Rojas',
    edad: '27 yrs',
    altura: '1.82 m',
    peso: '76 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Volea de revés'
  },
  {
    id: 'dp-2',
    position: '02',
    name: 'Luciana Pérez',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '4ta',
    puntosNum: 1380,
    points: '1,380 pts',
    titulos: 3,
    efectividad: '85%',
    partidosGanados: 19,
    partidosPerdidos: 4,
    parejaReciente: 'Valeria Torres',
    edad: '24 yrs',
    altura: '1.70 m',
    peso: '60 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Drive cruzado'
  },
  {
    id: 'dp-3',
    position: '03',
    name: 'Mateo Rojas',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '4ta',
    puntosNum: 1350,
    points: '1,350 pts',
    titulos: 3,
    efectividad: '83%',
    partidosGanados: 18,
    partidosPerdidos: 4,
    parejaReciente: 'Diego Sánchez',
    edad: '26 yrs',
    altura: '1.78 m',
    peso: '73 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Smash'
  },
  {
    id: 'dp-4',
    position: '04',
    name: 'Valeria Torres',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '4ta',
    puntosNum: 1300,
    points: '1,300 pts',
    titulos: 2,
    efectividad: '81%',
    partidosGanados: 17,
    partidosPerdidos: 4,
    parejaReciente: 'Luciana Pérez',
    edad: '25 yrs',
    altura: '1.68 m',
    peso: '59 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Volea baja'
  },
  {
    id: 'dp-5',
    position: '05',
    name: 'Carlos Benavides',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '4ta',
    puntosNum: 1240,
    points: '1,240 pts',
    titulos: 2,
    efectividad: '80%',
    partidosGanados: 16,
    partidosPerdidos: 4,
    parejaReciente: 'Fernando Gálvez',
    edad: '29 yrs',
    altura: '1.80 m',
    peso: '77 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Saque plano'
  },
  {
    id: 'dp-6',
    position: '06',
    name: 'Fernando Gálvez',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '4ta',
    puntosNum: 1200,
    points: '1,200 pts',
    titulos: 2,
    efectividad: '78%',
    partidosGanados: 15,
    partidosPerdidos: 4,
    parejaReciente: 'Carlos Benavides',
    edad: '30 yrs',
    altura: '1.76 m',
    peso: '72 kg',
    manoDominante: 'Zurdo',
    mejorGolpe: 'Drive con topspin'
  },
  {
    id: 'dp-7',
    position: '07',
    name: 'Gonzalo Ugarte',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '4ta',
    puntosNum: 1150,
    points: '1,150 pts',
    titulos: 1,
    efectividad: '76%',
    partidosGanados: 14,
    partidosPerdidos: 5,
    parejaReciente: 'Javier Prado',
    edad: '28 yrs',
    altura: '1.75 m',
    peso: '71 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Slice'
  },
  {
    id: 'dp-8',
    position: '08',
    name: 'Javier Prado',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '4ta',
    puntosNum: 1120,
    points: '1,120 pts',
    titulos: 1,
    efectividad: '74%',
    partidosGanados: 13,
    partidosPerdidos: 5,
    parejaReciente: 'Gonzalo Ugarte',
    edad: '31 yrs',
    altura: '1.77 m',
    peso: '74 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Revés a dos manos'
  },

  // 5ta A
  {
    id: 'dp-9',
    position: '01',
    name: 'Rodrigo Alva',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta A',
    puntosNum: 1100,
    points: '1,100 pts',
    titulos: 3,
    efectividad: '82%',
    partidosGanados: 18,
    partidosPerdidos: 4,
    parejaReciente: 'Joaquín Vargas',
    edad: '25 yrs',
    altura: '1.74 m',
    peso: '70 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Drive cruzado'
  },
  {
    id: 'dp-10',
    position: '02',
    name: 'Joaquín Vargas',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta A',
    puntosNum: 1080,
    points: '1,080 pts',
    titulos: 3,
    efectividad: '80%',
    partidosGanados: 17,
    partidosPerdidos: 4,
    parejaReciente: 'Rodrigo Alva',
    edad: '28 yrs',
    altura: '1.79 m',
    peso: '75 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Saque y volea'
  },
  {
    id: 'dp-11',
    position: '03',
    name: 'Camila Mendoza',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta A',
    puntosNum: 1040,
    points: '1,040 pts',
    titulos: 2,
    efectividad: '79%',
    partidosGanados: 15,
    partidosPerdidos: 4,
    parejaReciente: 'Andrea Flores',
    edad: '23 yrs',
    altura: '1.65 m',
    peso: '57 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Drop Shot'
  },
  {
    id: 'dp-12',
    position: '04',
    name: 'Andrea Flores',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta A',
    puntosNum: 1010,
    points: '1,010 pts',
    titulos: 2,
    efectividad: '77%',
    partidosGanados: 14,
    partidosPerdidos: 4,
    parejaReciente: 'Camila Mendoza',
    edad: '24 yrs',
    altura: '1.67 m',
    peso: '58 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Drive paralelo'
  },
  {
    id: 'dp-13',
    position: '05',
    name: 'Sebastián Carranza',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta A',
    puntosNum: 970,
    points: '970 pts',
    titulos: 1,
    efectividad: '75%',
    partidosGanados: 13,
    partidosPerdidos: 5,
    parejaReciente: 'Álvaro Silva',
    edad: '27 yrs',
    altura: '1.73 m',
    peso: '69 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Globo ofensivo'
  },
  {
    id: 'dp-14',
    position: '06',
    name: 'Álvaro Silva',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta A',
    puntosNum: 940,
    points: '940 pts',
    titulos: 1,
    efectividad: '73%',
    partidosGanados: 12,
    partidosPerdidos: 5,
    parejaReciente: 'Sebastián Carranza',
    edad: '29 yrs',
    altura: '1.81 m',
    peso: '76 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Revés cortado'
  },
  {
    id: 'dp-15',
    position: '07',
    name: 'Renzo Delgado',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta A',
    puntosNum: 910,
    points: '910 pts',
    titulos: 1,
    efectividad: '71%',
    partidosGanados: 11,
    partidosPerdidos: 5,
    parejaReciente: 'Franco Morales',
    edad: '32 yrs',
    altura: '1.76 m',
    peso: '73 kg',
    manoDominante: 'Zurdo',
    mejorGolpe: 'Saque abierto'
  },
  {
    id: 'dp-16',
    position: '08',
    name: 'Franco Morales',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta A',
    puntosNum: 880,
    points: '880 pts',
    titulos: 1,
    efectividad: '69%',
    partidosGanados: 10,
    partidosPerdidos: 5,
    parejaReciente: 'Renzo Delgado',
    edad: '26 yrs',
    altura: '1.74 m',
    peso: '70 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Volea profunda'
  },

  // 5ta B
  {
    id: 'dp-17',
    position: '01',
    name: 'Patricio Ruiz',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta B',
    puntosNum: 890,
    points: '890 pts',
    titulos: 2,
    efectividad: '78%',
    partidosGanados: 14,
    partidosPerdidos: 4,
    parejaReciente: 'Martín Castillo',
    edad: '28 yrs',
    altura: '1.75 m',
    peso: '71 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Drive cruzado'
  },
  {
    id: 'dp-18',
    position: '02',
    name: 'Martín Castillo',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta B',
    puntosNum: 870,
    points: '870 pts',
    titulos: 2,
    efectividad: '76%',
    partidosGanados: 13,
    partidosPerdidos: 4,
    parejaReciente: 'Patricio Ruiz',
    edad: '27 yrs',
    altura: '1.78 m',
    peso: '72 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Smash de fondo'
  },
  {
    id: 'dp-19',
    position: '03',
    name: 'Daniela Vega',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta B',
    puntosNum: 840,
    points: '840 pts',
    titulos: 2,
    efectividad: '75%',
    partidosGanados: 13,
    partidosPerdidos: 5,
    parejaReciente: 'Sofía Paredes',
    edad: '25 yrs',
    altura: '1.66 m',
    peso: '58 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Volea de revés'
  },
  {
    id: 'dp-20',
    position: '04',
    name: 'Sofía Paredes',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta B',
    puntosNum: 820,
    points: '820 pts',
    titulos: 2,
    efectividad: '73%',
    partidosGanados: 12,
    partidosPerdidos: 5,
    parejaReciente: 'Daniela Vega',
    edad: '26 yrs',
    altura: '1.68 m',
    peso: '60 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Drive liftado'
  },
  {
    id: 'dp-21',
    position: '05',
    name: 'Ignacio Ramos',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta B',
    puntosNum: 790,
    points: '790 pts',
    titulos: 1,
    efectividad: '71%',
    partidosGanados: 11,
    partidosPerdidos: 5,
    parejaReciente: 'Leonardo Paz',
    edad: '30 yrs',
    altura: '1.77 m',
    peso: '75 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Passing shot'
  },
  {
    id: 'dp-22',
    position: '06',
    name: 'Leonardo Paz',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta B',
    puntosNum: 760,
    points: '760 pts',
    titulos: 1,
    efectividad: '69%',
    partidosGanados: 10,
    partidosPerdidos: 5,
    parejaReciente: 'Ignacio Ramos',
    edad: '31 yrs',
    altura: '1.80 m',
    peso: '76 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Revés a una mano'
  },
  {
    id: 'dp-23',
    position: '07',
    name: 'Bruno Chávez',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta B',
    puntosNum: 730,
    points: '730 pts',
    titulos: 0,
    efectividad: '67%',
    partidosGanados: 9,
    partidosPerdidos: 5,
    parejaReciente: 'Gabriel León',
    edad: '27 yrs',
    altura: '1.74 m',
    peso: '71 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Saque liftado'
  },
  {
    id: 'dp-24',
    position: '08',
    name: 'Gabriel León',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '5ta B',
    puntosNum: 710,
    points: '710 pts',
    titulos: 0,
    efectividad: '65%',
    partidosGanados: 8,
    partidosPerdidos: 5,
    parejaReciente: 'Bruno Chávez',
    edad: '29 yrs',
    altura: '1.76 m',
    peso: '72 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Volea en red'
  },

  // 6ta
  {
    id: 'dp-25',
    position: '01',
    name: 'Emilio Tapia',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '6ta',
    puntosNum: 720,
    points: '720 pts',
    titulos: 2,
    efectividad: '73%',
    partidosGanados: 12,
    partidosPerdidos: 4,
    parejaReciente: 'Nicolás Solano',
    edad: '26 yrs',
    altura: '1.72 m',
    peso: '68 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Drive plano'
  },
  {
    id: 'dp-26',
    position: '02',
    name: 'Nicolás Solano',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '6ta',
    puntosNum: 700,
    points: '700 pts',
    titulos: 2,
    efectividad: '71%',
    partidosGanados: 11,
    partidosPerdidos: 4,
    parejaReciente: 'Emilio Tapia',
    edad: '25 yrs',
    altura: '1.75 m',
    peso: '70 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Volea defensiva'
  },
  {
    id: 'dp-27',
    position: '03',
    name: 'Matías Quintana',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '6ta',
    puntosNum: 670,
    points: '670 pts',
    titulos: 1,
    efectividad: '69%',
    partidosGanados: 10,
    partidosPerdidos: 5,
    parejaReciente: 'Christian Vera',
    edad: '24 yrs',
    altura: '1.70 m',
    peso: '67 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Revés con slice'
  },
  {
    id: 'dp-28',
    position: '04',
    name: 'Christian Vera',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '6ta',
    puntosNum: 650,
    points: '650 pts',
    titulos: 1,
    efectividad: '67%',
    partidosGanados: 9,
    partidosPerdidos: 5,
    parejaReciente: 'Matías Quintana',
    edad: '27 yrs',
    altura: '1.76 m',
    peso: '72 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Drive cruzado'
  },
  {
    id: 'dp-29',
    position: '05',
    name: 'Felipe Bustamante',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '6ta',
    puntosNum: 630,
    points: '630 pts',
    titulos: 1,
    efectividad: '65%',
    partidosGanados: 9,
    partidosPerdidos: 5,
    parejaReciente: 'Tomás Rizo',
    edad: '30 yrs',
    altura: '1.78 m',
    peso: '74 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Saque plano'
  },
  {
    id: 'dp-30',
    position: '06',
    name: 'Tomás Rizo',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '6ta',
    puntosNum: 610,
    points: '610 pts',
    titulos: 1,
    efectividad: '63%',
    partidosGanados: 8,
    partidosPerdidos: 5,
    parejaReciente: 'Felipe Bustamante',
    edad: '29 yrs',
    altura: '1.75 m',
    peso: '71 kg',
    manoDominante: 'Zurdo',
    mejorGolpe: 'Drive con efecto'
  },
  {
    id: 'dp-31',
    position: '07',
    name: 'Manuel Ortiz',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '6ta',
    puntosNum: 590,
    points: '590 pts',
    titulos: 0,
    efectividad: '62%',
    partidosGanados: 7,
    partidosPerdidos: 5,
    parejaReciente: 'Diego Valdivia',
    edad: '28 yrs',
    altura: '1.73 m',
    peso: '69 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Volea'
  },
  {
    id: 'dp-32',
    position: '08',
    name: 'Diego Valdivia',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=85',
    country: 'PER',
    categoria: '6ta',
    puntosNum: 570,
    points: '570 pts',
    titulos: 0,
    efectividad: '60%',
    partidosGanados: 6,
    partidosPerdidos: 5,
    parejaReciente: 'Manuel Ortiz',
    edad: '27 yrs',
    altura: '1.75 m',
    peso: '71 kg',
    manoDominante: 'Diestro',
    mejorGolpe: 'Revés a dos manos'
  }
];

// Los torneos oficiales del circuito ATAP arrancan desde este año (Temporada Inaugural).
// El archivo histórico almacenará los ciclos anuales oficiales una vez que culminen (31 de Diciembre).
export const INITIAL_SEASONS_ARCHIVE = {};

export const INITIAL_HERO_SLIDES = [
  {
    id: 'slide-1',
    image: getAssetUrl('/assets/hero1.png'),
    eyebrow: 'Vive la pasión del tenis',
    title: 'Grandes torneos, grandes historias',
    description: 'Sé parte de la comunidad de tenis más grande del Perú. Compite, mejora tu ranking y vive la emoción de cada torneo.'
  },
  {
    id: 'slide-2',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1920&q=85',
    eyebrow: 'Circuito Oficial ATAP',
    title: 'Compite al más alto nivel',
    description: 'Participa en torneos oficiales en las mejores canchas del país y acumula puntos para el ranking nacional.'
  },
  {
    id: 'slide-3',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1920&q=85',
    eyebrow: 'Comunidad & Pasión',
    title: 'La emoción del tenis en cada punto',
    description: 'Descubre nuevas categorías, inscríbete en singles o dobles y supera tus propios límites en la cancha.'
  },
  {
    id: 'slide-4',
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1920&q=85',
    eyebrow: 'Ranking Nacional',
    title: 'Forja tu camino hacia la gloria',
    description: 'Cada victoria cuenta. Consulta tu posición, estadísticas de partidos y compite por el trofeo de la temporada.'
  }
];

export const INITIAL_SITE_IMAGES = {
  heroBanner: getAssetUrl('/assets/hero1.png'),
  heroSlides: INITIAL_HERO_SLIDES,
  eventoBanner: getAssetUrl('/assets/Evento.png'),
  logoPlatino: getAssetUrl('/assets/Logo Platino.png'),
  logoAtap: getAssetUrl('/assets/logo.png')
};

export const INITIAL_SPONSORS = [
  { id: 'sponsor-1', name: 'GemLab', logo: '' },
  { id: 'sponsor-2', name: 'Tennis Merits', logo: '' },
  { id: 'sponsor-3', name: 'Puerto Norte', logo: '' },
  { id: 'sponsor-4', name: 'Bordiani', logo: '' },
  { id: 'sponsor-5', name: 'noi', logo: '' },
  { id: 'sponsor-6', name: 'Up Beast', logo: '' },
  { id: 'sponsor-7', name: 'Head', logo: '' },
  { id: 'sponsor-8', name: 'Auspiciador 8', logo: '' },
  { id: 'sponsor-9', name: 'Auspiciador 9', logo: '' }
];

export const INITIAL_HOME_BANNERS = {
  signupBanner: {
    kicker: 'Regístrate ahora',
    title: 'Inscripciones abiertas',
    highlight: 'torneos de tenis',
    description: 'Participa en nuestros torneos y demuestra tu talento en la cancha.',
    buttonText: 'Registrarse',
    buttonAction: 'register',
    buttonLink: '#registro',
    image: getAssetUrl('/assets/Evento.png')
  },
  socialBanner: {
    eyebrow: 'SÍGUENOS EN REDES',
    title: 'Todo el tenis,\nen un solo lugar.',
    description: 'Mantente al día con los torneos, resultados, noticias y mucho más. ¡Sé parte de nuestra comunidad!',
    instagramUrl: 'https://www.instagram.com/atap_tenisperu/',
    whatsappUrl: 'https://wa.me/51977884423',
    image: getAssetUrl('/assets/Redes.png')
  },
  faqSection: {
    title: 'Preguntas\nfrecuentes',
    subtitle: '¿No se resolvió tu duda?',
    buttonText: 'Escríbenos',
    whatsappUrl: 'https://wa.me/51977884423',
    rulesEyebrow: 'Información para jugadores',
    rulesTitle: 'Reglas de torneos',
    rulesList: [
      'Reglas de torneos singles y dobles',
      'Categorías y modalidades',
      'Sistema de puntuación',
      'Código de conducta',
      'Fechas y horarios'
    ]
  }
};

export function emitAtapUpdate(key, data) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('atap_data_updated', {
      detail: { key, data }
    }));
  }
}

// Sincronización transparente con Backend MySQL al cargar la aplicación
export async function syncStorageWithBackend() {
  if (typeof window === 'undefined') return;
  // En entornos estáticos como GitHub Pages no hay servidor backend
  if (window.location.hostname.includes('github.io')) return;

  try {
    // Comprobar disponibilidad rápida del backend antes de disparar peticiones
    const healthCheck = await fetch('/api/health', { method: 'GET' }).catch(() => null);
    if (!healthCheck || !healthCheck.ok) {
      return; // Servidor backend no disponible en este momento, continuar con almacenamiento local
    }
    const healthData = await healthCheck.json().catch(() => null);
    if (healthData?.status !== 'ok') {
      return; // Backend offline o no inicializado, usar almacenamiento local
    }

    // 1. Sincronizar Torneos
    const tourneysRes = await tournamentApi.getAll().catch(() => null);
    if (tourneysRes?.data && Array.isArray(tourneysRes.data) && tourneysRes.data.length > 0) {
      localStorage.setItem(STORAGE_KEYS.TOURNEYS, JSON.stringify(tourneysRes.data));
      emitAtapUpdate(STORAGE_KEYS.TOURNEYS, tourneysRes.data);
    }

    // 2. Sincronizar Ranking Singles
    const rankRes = await rankingApi.getLeaderboard('4ta', 'singles').catch(() => null);
    if (rankRes?.data && Array.isArray(rankRes.data) && rankRes.data.length > 0) {
      localStorage.setItem(STORAGE_KEYS.RANKING, JSON.stringify(rankRes.data));
      emitAtapUpdate(STORAGE_KEYS.RANKING, rankRes.data);
    }

    // 3. Sincronizar Noticias
    const newsRes = await contentApi.getNews().catch(() => null);
    if (newsRes?.data && Array.isArray(newsRes.data) && newsRes.data.length > 0) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(newsRes.data));
      emitAtapUpdate(STORAGE_KEYS.NEWS, newsRes.data);
    }

    // 4. Sincronizar Auspiciadores
    const sponRes = await contentApi.getSponsors().catch(() => null);
    if (sponRes?.data && Array.isArray(sponRes.data) && sponRes.data.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(sponRes.data));
      emitAtapUpdate(STORAGE_KEYS.SPONSORS, sponRes.data);
    }

    // 5. Sincronizar Jugadores Registrados
    const playersRes = await playerApi.getAll().catch(() => null);
    if (playersRes?.data && Array.isArray(playersRes.data) && playersRes.data.length > 0) {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(playersRes.data));
      emitAtapUpdate(STORAGE_KEYS.REGISTERED_USERS, playersRes.data);
    }

    // 6. Sincronizar Configuración de Yape
    const yapeRes = await contentApi.getSetting('atap_yape_config').catch(() => null);
    if (yapeRes?.data && yapeRes.data.numero) {
      localStorage.setItem(STORAGE_KEYS.YAPE_CONFIG, JSON.stringify(yapeRes.data));
      emitAtapUpdate(STORAGE_KEYS.YAPE_CONFIG, yapeRes.data);
    }

    // 7. Sincronizar Banners e Imágenes del Sitio
    const imgsRes = await contentApi.getSetting('atap_site_images').catch(() => null);
    if (imgsRes?.data && typeof imgsRes.data === 'object' && Object.keys(imgsRes.data).length > 0) {
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(imgsRes.data));
      emitAtapUpdate(STORAGE_KEYS.IMAGES, imgsRes.data);
    }

    // 8. Sincronizar Banners del Home
    const bannersRes = await contentApi.getSetting('atap_home_banners').catch(() => null);
    if (bannersRes?.data && typeof bannersRes.data === 'object' && Object.keys(bannersRes.data).length > 0) {
      localStorage.setItem(STORAGE_KEYS.HOME_BANNERS, JSON.stringify(bannersRes.data));
      emitAtapUpdate(STORAGE_KEYS.HOME_BANNERS, bannersRes.data);
    }
  } catch (err) {
    console.warn('Sincronización inicial con MySQL en espera de conexión:', err);
  }
}

// Ejecutar sincronización inicial silenciosa al iniciar en navegador
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncStorageWithBackend();
  }, 1000);
}

// ----------------- TOURNAMENT METHODS -----------------

export function getTournaments() {
  try {
    if (typeof localStorage === 'undefined') return INITIAL_TOURNAMENTS;
    const raw = localStorage.getItem(STORAGE_KEYS.TOURNEYS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TOURNEYS, JSON.stringify(INITIAL_TOURNAMENTS));
      return INITIAL_TOURNAMENTS;
    }
    const parsed = JSON.parse(raw);
    let changed = false;

    // Asegurar que contenga los torneos predeterminados oficiales si faltan por caché previa
    const existingIds = new Set(parsed.map((t) => t.id));
    INITIAL_TOURNAMENTS.forEach((initT) => {
      if (!existingIds.has(initT.id)) {
        parsed.push({ ...initT });
        changed = true;
      }
    });

    const withDetails = parsed.map((t) => {
      let itemChanged = false;
      const updated = { ...t };
      const initMatch = INITIAL_TOURNAMENTS.find((it) => it.id === updated.id);
      if (initMatch) {
        if (!updated.fechaInicio && initMatch.fechaInicio) {
          updated.fechaInicio = initMatch.fechaInicio;
          itemChanged = true;
        }
        if (!updated.fechaFin && initMatch.fechaFin) {
          updated.fechaFin = initMatch.fechaFin;
          itemChanged = true;
        }
        if (!updated.bracket && initMatch.bracket) {
          updated.bracket = initMatch.bracket;
          itemChanged = true;
        }
      }
      if (!updated.modalidad) {
        updated.modalidad = updated.id === 'torneo-2' ? 'dobles' : 'singles';
        itemChanged = true;
      }
      if (!updated.estado) {
        updated.estado = initMatch?.estado || 'inscripciones_abiertas';
        itemChanged = true;
      }
      if (!updated.resultados && initMatch?.resultados) {
        updated.resultados = initMatch.resultados;
        itemChanged = true;
      }
      if (!updated.categorias || !Array.isArray(updated.categorias) || updated.categorias.length === 0) {
        updated.categorias = updated.modalidad === 'dobles' ? [
          { id: 'cat-d4', nombre: '4ta Dobles', cupos: 16 },
          { id: 'cat-d5a', nombre: '5ta A Dobles', cupos: 16 },
          { id: 'cat-d5b', nombre: '5ta B Dobles', cupos: 16 },
          { id: 'cat-d6', nombre: '6ta Dobles', cupos: 16 }
        ] : [
          { id: 'cat-4', nombre: '4ta', cupos: 16 },
          { id: 'cat-5a', nombre: '5ta A', cupos: 16 },
          { id: 'cat-5b', nombre: '5ta B', cupos: 32 },
          { id: 'cat-6', nombre: '6ta', cupos: 32 }
        ];
        itemChanged = true;
      } else {
        // Migrar categorías antiguas en torneos existentes a las oficiales: 4ta, 5ta A, 5ta B, 6ta
        const hasLegacy = updated.categorias.some((c) => /1ra|2da|3ra/i.test(c.nombre));
        if (hasLegacy) {
          updated.categorias = updated.modalidad === 'dobles' ? [
            { id: 'cat-d4', nombre: '4ta Dobles', cupos: 16 },
            { id: 'cat-d5a', nombre: '5ta A Dobles', cupos: 16 },
            { id: 'cat-d5b', nombre: '5ta B Dobles', cupos: 16 },
            { id: 'cat-d6', nombre: '6ta Dobles', cupos: 16 }
          ] : [
            { id: 'cat-4', nombre: '4ta', cupos: 16 },
            { id: 'cat-5a', nombre: '5ta A', cupos: 16 },
            { id: 'cat-5b', nombre: '5ta B', cupos: 32 },
            { id: 'cat-6', nombre: '6ta', cupos: 32 }
          ];
          itemChanged = true;
        }
      }

      // Los torneos oficiales del circuito arrancan desde este año (2026)
      if (updated.date && updated.date.includes('2025')) {
        updated.date = updated.date.replace(/2025/g, '2026');
        itemChanged = true;
      }

      if (updated.inscripciones && Array.isArray(updated.inscripciones)) {
        updated.inscripciones = updated.inscripciones.map((ins) => {
          let modifiedIns = { ...ins };
          if (modifiedIns.fechaRegistro && modifiedIns.fechaRegistro.includes('2025')) {
            modifiedIns.fechaRegistro = modifiedIns.fechaRegistro.replace(/2025/g, '2026');
            itemChanged = true;
          }
          const norm = normalizeCategory(modifiedIns.categoria);
          if (norm === '1ra') { itemChanged = true; modifiedIns.categoria = '4ta'; }
          if (norm === '2da') { itemChanged = true; modifiedIns.categoria = '5ta A'; }
          if (norm === '3ra') { itemChanged = true; modifiedIns.categoria = '5ta B'; }
          return modifiedIns;
        });
      }

      if (updated.resultados && Array.isArray(updated.resultados)) {
        updated.resultados = updated.resultados.map((res) => {
          let modifiedRes = { ...res };
          if (modifiedRes.fechaCarga && modifiedRes.fechaCarga.includes('2025')) {
            modifiedRes.fechaCarga = modifiedRes.fechaCarga.replace(/2025/g, '2026');
            itemChanged = true;
          }
          const norm = normalizeCategory(modifiedRes.categoria);
          if (norm === '1ra') { itemChanged = true; modifiedRes.categoria = '4ta'; }
          if (norm === '2da') { itemChanged = true; modifiedRes.categoria = '5ta A'; }
          if (norm === '3ra') { itemChanged = true; modifiedRes.categoria = '5ta B'; }
          return modifiedRes;
        });
      }

      if (itemChanged) changed = true;
      return updated;
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.TOURNEYS, JSON.stringify(withDetails));
    }
    return withDetails.map((t) => ({
      ...t,
      image: getAssetUrl(t.image || '/assets/Evento.png')
    }));
  } catch (e) {
    console.error('Error reading tournaments:', e);
    return INITIAL_TOURNAMENTS;
  }
}

export function saveTournaments(tournaments) {
  try {
    localStorage.setItem(STORAGE_KEYS.TOURNEYS, JSON.stringify(tournaments));
    emitAtapUpdate(STORAGE_KEYS.TOURNEYS, tournaments);
  } catch (e) {
    console.error('Error saving tournaments:', e);
  }
}

export function getTournamentById(id) {
  const tournaments = getTournaments();
  return tournaments.find((t) => t.id === id) || null;
}

export function parseDateRange(dateStr) {
  if (!dateStr) return { start: '', end: '' };
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    return { start: dateStr.trim(), end: dateStr.trim() };
  }

  const monthsMap = {
    ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
    jul: '07', ago: '08', set: '09', sep: '09', oct: '10', nov: '11', dic: '12',
    jan: '01', apr: '04', aug: '08', dec: '12'
  };

  const clean = dateStr.trim().toLowerCase();
  const yearMatch = clean.match(/20\d\d/);
  const year = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();

  const parts = clean.split('-').map((p) => p.trim());
  if (parts.length === 2) {
    const p1 = parts[0];
    const p2 = parts[1];

    let m1 = null, m2 = null;
    for (const [k, v] of Object.entries(monthsMap)) {
      if (p1.includes(k)) m1 = v;
      if (p2.includes(k)) m2 = v;
    }
    if (!m1 && m2) m1 = m2;
    if (!m2 && m1) m2 = m1;
    if (!m1) m1 = '05';
    if (!m2) m2 = '05';

    const d1Match = p1.match(/\d+/);
    const d2Match = p2.match(/\d+/);
    const d1 = d1Match ? d1Match[0].padStart(2, '0') : '01';
    const d2 = d2Match ? d2Match[0].padStart(2, '0') : '05';

    return {
      start: `${year}-${m1}-${d1}`,
      end: `${year}-${m2}-${d2}`
    };
  } else {
    let m = null;
    for (const [k, v] of Object.entries(monthsMap)) {
      if (clean.includes(k)) m = v;
    }
    if (!m) m = '05';
    const dMatch = clean.match(/\d+/);
    const d = dMatch ? dMatch[0].padStart(2, '0') : '01';
    const fullDate = `${year}-${m}-${d}`;
    return { start: fullDate, end: fullDate };
  }
}

export function isTournamentDateActive(dateStr, startDate, endDate) {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (startDate && endDate) {
    return todayStr >= startDate && todayStr <= endDate;
  }
  if (!dateStr) return false;
  const range = parseDateRange(dateStr);
  if (!range.start || !range.end) return false;
  return todayStr >= range.start && todayStr <= range.end;
}

export function getTournamentStartDate(t) {
  if (!t) return new Date(0);
  if (t.fechaInicio) {
    const d = new Date(t.fechaInicio + 'T00:00:00');
    if (!isNaN(d.getTime())) return d;
  }
  if (t.date) {
    const range = parseDateRange(t.date);
    if (range && range.start) {
      const d = new Date(range.start + 'T00:00:00');
      if (!isNaN(d.getTime())) return d;
    }
  }
  return new Date(0);
}

export function getTournamentEndDate(t) {
  if (!t) return new Date(0);
  if (t.fechaFin) {
    const d = new Date(t.fechaFin + 'T23:59:59');
    if (!isNaN(d.getTime())) return d;
  }
  if (t.date) {
    const range = parseDateRange(t.date);
    if (range && range.end) {
      const d = new Date(range.end + 'T23:59:59');
      if (!isNaN(d.getTime())) return d;
    }
  }
  return new Date(0);
}

export function formatFriendlyDate(dateObjOrStr) {
  if (!dateObjOrStr) return '';
  let d;
  if (typeof dateObjOrStr === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateObjOrStr.trim())) {
      const [y, m, day] = dateObjOrStr.trim().split('-');
      d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(day, 10));
    } else {
      d = new Date(dateObjOrStr);
    }
  } else {
    d = dateObjOrStr;
  }
  if (isNaN(d.getTime())) return '';
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Obtiene siempre 6 torneos para la sección principal del Home:
 * - Prioriza torneos próximos a jugarse ordenados cronológicamente por fecha de inicio (el más cercano primero).
 * - Si hay menos de 6 torneos próximos (ej. solo 3), rellena los cupos restantes con torneos ya jugados/finalizados
 *   ordenados por fecha de finalización (el más reciente primero).
 * - Retorna metadatos claros del diferencial (isUpcoming, isFinished, fechaInicioTexto, fechaFinTexto, campeonNombre).
 */
export function getHomeTournamentsDisplay() {
  const allTournaments = getTournaments();
  if (!allTournaments || allTournaments.length === 0) return [];

  const isFinalizado = (t) => {
    const est = String(t.estado || '').toLowerCase().trim();
    return est === 'finalizado' || est === 'culminado';
  };

  const getChampionName = (t) => {
    if (t.bracket?.champion?.name) return t.bracket.champion.name;
    if (t.bracket?.champion?.nombre) return t.bracket.champion.nombre;
    if (t.bracket?.campeon) return t.bracket.campeon;
    if (Array.isArray(t.resultados) && t.resultados.length > 0) {
      const finalRes = t.resultados.find((r) => /final/i.test(r.ronda || ''));
      if (finalRes?.ganador) return finalRes.ganador;
      if (t.resultados[0]?.ganador) return t.resultados[0].ganador;
    }
    return null;
  };

  const upcoming = [];
  const finished = [];

  allTournaments.forEach((t) => {
    const startD = getTournamentStartDate(t);
    const endD = getTournamentEndDate(t);
    const champ = getChampionName(t);
    const enriched = {
      ...t,
      startDateObj: startD,
      endDateObj: endD,
      campeonNombre: champ,
      fechaInicioTexto: t.fechaInicio ? formatFriendlyDate(t.fechaInicio) : '',
      fechaFinTexto: t.fechaFin ? formatFriendlyDate(t.fechaFin) : ''
    };

    if (isFinalizado(t)) {
      enriched.isFinished = true;
      enriched.isUpcoming = false;
      finished.push(enriched);
    } else {
      enriched.isFinished = false;
      enriched.isUpcoming = true;
      upcoming.push(enriched);
    }
  });

  // 1. Ordenar próximos por fecha de inicio más cercana primero (ascendente)
  upcoming.sort((a, b) => a.startDateObj.getTime() - b.startDateObj.getTime());

  // 2. Ordenar finalizados por fecha de finalización más reciente primero (descendente)
  finished.sort((a, b) => b.endDateObj.getTime() - a.endDateObj.getTime());

  // 3. Tomar hasta 6 próximos
  const selectedUpcoming = upcoming.slice(0, 6);

  // 4. Rellenar con los torneos jugados que sean necesarios para completar exactamente 6
  const slotsRemaining = Math.max(0, 6 - selectedUpcoming.length);
  const selectedFinished = finished.slice(0, slotsRemaining);

  const result = [...selectedUpcoming, ...selectedFinished];

  // Si aún hubiera menos de 6 torneos en el sistema, asegurar completar con los restantes
  if (result.length < 6) {
    const usedIds = new Set(result.map((r) => r.id));
    for (const t of [...upcoming, ...finished]) {
      if (!usedIds.has(t.id)) {
        result.push(t);
        usedIds.add(t.id);
        if (result.length >= 6) break;
      }
    }
  }

  return result.slice(0, 6);
}

export function extractTournamentMatches(tournament) {
  if (!tournament) return { enVivo: [], jugados: [], futuros: [], all: [] };

  const enVivo = [];
  const jugados = [];
  const futuros = [];
  const seenIds = new Set();

  // 1. Fase de Grupos
  const groups = tournament.bracket?.faseGrupos || tournament.faseGrupos || [];
  if (Array.isArray(groups)) {
    groups.forEach((g) => {
      const matches = g.partidos || [];
      if (Array.isArray(matches)) {
        matches.forEach((m, idx) => {
          const matchId = m.id || `group-${g.id || 'g'}-${idx}`;
          if (seenIds.has(matchId)) return;
          seenIds.add(matchId);

          const p1Name = m.player1?.name || (typeof m.player1 === 'string' ? m.player1 : 'Por definir');
          const p2Name = m.player2?.name || (typeof m.player2 === 'string' ? m.player2 : 'Por definir');
          const isPlayed = Boolean(m.winnerSlot || (m.score && m.score.trim()));
          const winnerName = m.winnerSlot === 1 ? p1Name : m.winnerSlot === 2 ? p2Name : m.winnerName || '';
          const isLive = Boolean(m.isLive);

          const item = {
            id: matchId,
            tipo: 'Fase de Grupos',
            etiqueta: g.nombre ? `${g.nombre} • Partido #${m.matchNum || idx + 1}` : `Partido #${m.matchNum || idx + 1}`,
            grupoNombre: g.nombre || 'Grupo',
            categoria: m.categoria || g.categoria || m.player1?.categoria || m.player2?.categoria || tournament.categoria || 'Oficial',
            player1: p1Name,
            player2: p2Name,
            score: m.score || '',
            winnerSlot: m.winnerSlot,
            winnerName,
            cancha: m.cancha || 'Cancha Central',
            hora: m.hora || '',
            horario: m.hora || m.horario || '',
            isPlayed,
            isLive
          };

          if (isLive) {
            enVivo.push(item);
          } else if (isPlayed) {
            jugados.push(item);
          } else {
            futuros.push(item);
          }
        });
      }
    });
  }

  // 2. Cuadro Eliminatorio (Playoffs / Bracket rounds)
  const rounds = tournament.bracket?.rounds || [];
  if (Array.isArray(rounds)) {
    rounds.forEach((r, rIdx) => {
      const matches = r.matches || [];
      if (Array.isArray(matches)) {
        matches.forEach((m, mIdx) => {
          const matchId = m.id || `round-${rIdx}-${mIdx}`;
          if (seenIds.has(matchId)) return;
          seenIds.add(matchId);

          const p1Name = m.player1?.name || (typeof m.player1 === 'string' ? m.player1 : 'Por clasificar');
          const p2Name = m.player2?.name || (typeof m.player2 === 'string' ? m.player2 : 'Por clasificar');
          const isPlayed = Boolean(m.winnerSlot || (m.score && m.score.trim()));
          const winnerName = m.winnerSlot === 1 ? p1Name : m.winnerSlot === 2 ? p2Name : m.winnerName || '';
          const isLive = Boolean(m.isLive);

          const item = {
            id: matchId,
            tipo: 'Cuadro Eliminatorio',
            etiqueta: r.name || 'Eliminatoria',
            roundName: r.name || 'Eliminatoria',
            categoria: m.categoria || r.categoria || m.player1?.categoria || m.player2?.categoria || tournament.categoria || 'Oficial',
            player1: p1Name,
            player2: p2Name,
            score: m.score || '',
            winnerSlot: m.winnerSlot,
            winnerName,
            cancha: m.cancha || 'Cancha Principal',
            hora: m.hora || '',
            horario: m.hora || m.horario || '',
            isPlayed,
            isLive
          };

          if (isLive) {
            enVivo.push(item);
          } else if (isPlayed) {
            jugados.push(item);
          } else {
            futuros.push(item);
          }
        });
      }
    });
  }

  // 3. Resultados oficiales registrados
  const resultados = tournament.resultados || [];
  if (Array.isArray(resultados)) {
    resultados.forEach((res, resIdx) => {
      const matchId = res.id || `res-${resIdx}`;
      if (seenIds.has(matchId)) return;
      seenIds.add(matchId);

      jugados.push({
        id: matchId,
        tipo: 'Resultado Oficial',
        etiqueta: res.ronda || 'Partido Oficial',
        categoria: res.categoria || tournament.categoria || '4ta',
        player1: res.jugador1,
        player2: res.jugador2,
        score: res.score || '',
        winnerSlot: res.ganador === res.jugador1 ? 1 : 2,
        winnerName: res.ganador,
        cancha: 'Cancha Central',
        hora: '',
        horario: '',
        puntos: res.puntos,
        observaciones: res.observaciones,
        isPlayed: true,
        isLive: false
      });
    });
  }

  return {
    enVivo,
    jugados,
    futuros,
    all: [...enVivo, ...jugados, ...futuros]
  };
}

export function updateTournamentPrice(tournamentId, newPrice) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index !== -1) {
    tournaments[index].precio = Number(newPrice);
    saveTournaments(tournaments);
    return tournaments[index];
  }
  return null;
}

export function createTournament(data) {
  const tournaments = getTournaments();
  const defaultImages = [
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=500&q=85',
    'https://images.unsplash.com/photo-1530915365347-9b4b6e0b3d16?auto=format&fit=crop&w=500&q=85',
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=500&q=85',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=500&q=85'
  ];
  const randomImg = defaultImages[Math.floor(Math.random() * defaultImages.length)];
  const modalidad = data.modalidad || 'singles';

  const defaultCats = modalidad === 'dobles' ? [
    { id: 'cat-d4', nombre: '4ta Dobles', cupos: 16 },
    { id: 'cat-d5a', nombre: '5ta A Dobles', cupos: 16 },
    { id: 'cat-d5b', nombre: '5ta B Dobles', cupos: 16 },
    { id: 'cat-d6', nombre: '6ta Dobles', cupos: 16 }
  ] : modalidad === 'grupal' ? [
    { id: 'cat-g4', nombre: '4ta Equipos', cupos: 8 },
    { id: 'cat-g5a', nombre: '5ta A Equipos', cupos: 8 },
    { id: 'cat-g5b', nombre: '5ta B Equipos', cupos: 16 },
    { id: 'cat-g6', nombre: '6ta Equipos', cupos: 16 }
  ] : [
    { id: 'cat-4', nombre: '4ta', cupos: 16 },
    { id: 'cat-5a', nombre: '5ta A', cupos: 16 },
    { id: 'cat-5b', nombre: '5ta B', cupos: 32 },
    { id: 'cat-6', nombre: '6ta', cupos: 32 }
  ];

  const newTourney = {
    id: 'torneo-' + Date.now(),
    title: (data.title || '').trim() || 'Nuevo Torneo ATAP',
    date: (data.date || '').trim() || 'Fecha por definir',
    place: (data.place || '').trim() || 'Lima, Perú',
    precio: Number(data.precio) || 100,
    level: data.level || 'Nacional',
    modalidad: modalidad,
    categorias: (data.categorias && Array.isArray(data.categorias) && data.categorias.length > 0)
      ? data.categorias
      : defaultCats,
    image: (data.image || '').trim() || randomImg,
    estado: data.estado || 'inscripciones_abiertas',
    inscripciones: [],
    resultados: data.resultados || [],
    bracket: null
  };

  tournaments.push(newTourney);
  saveTournaments(tournaments);
  tournamentApi.create(newTourney).catch((err) => {
    console.warn('[ATAP] Sincronización de creación de torneo con servidor pendiente:', err);
  });
  return newTourney;
}

export function deleteTournament(tournamentId) {
  const tournaments = getTournaments();
  const filtered = tournaments.filter((t) => t.id !== tournamentId);
  saveTournaments(filtered);
  tournamentApi.delete(tournamentId).catch((err) => {
    console.warn('[ATAP] Sincronización de eliminación de torneo con servidor pendiente:', err);
  });
  return filtered;
}

export function updateTournament(tournamentId, updatedData) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1) return null;

  const current = tournaments[index];
  tournaments[index] = {
    ...current,
    title: updatedData.title !== undefined ? updatedData.title.trim() : current.title,
    date: updatedData.date !== undefined ? updatedData.date.trim() : current.date,
    place: updatedData.place !== undefined ? updatedData.place.trim() : current.place,
    precio: updatedData.precio !== undefined ? Number(updatedData.precio) : current.precio,
    level: updatedData.level || current.level,
    estado: updatedData.estado !== undefined ? updatedData.estado : (current.estado || 'inscripciones_abiertas'),
    modalidad: updatedData.modalidad !== undefined ? updatedData.modalidad : (current.modalidad || 'singles'),
    categorias: updatedData.categorias !== undefined
      ? updatedData.categorias
      : (current.categorias || [
          { id: 'cat-4', nombre: '4ta', cupos: 16 },
          { id: 'cat-5a', nombre: '5ta A', cupos: 16 },
          { id: 'cat-5b', nombre: '5ta B', cupos: 32 },
          { id: 'cat-6', nombre: '6ta', cupos: 32 }
        ]),
    image: updatedData.image !== undefined ? updatedData.image.trim() : current.image,
    resultados: updatedData.resultados !== undefined ? updatedData.resultados : (current.resultados || [])
  };

  saveTournaments(tournaments);
  tournamentApi.update(tournamentId, tournaments[index]).catch((err) => {
    console.warn('[ATAP] Sincronización de actualización de torneo con servidor pendiente:', err);
  });
  return tournaments[index];
}

export function updateTournamentStatus(tournamentId, newStatus) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index !== -1) {
    tournaments[index].estado = newStatus;
    saveTournaments(tournaments);
    return tournaments[index];
  }
  return null;
}

export function addTournamentResult(tournamentId, resultData) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1) return { error: 'Torneo no encontrado' };

  if (!tournaments[index].resultados) {
    tournaments[index].resultados = [];
  }

  const scoreStr = resultData.score?.trim() || [resultData.set1, resultData.set2, resultData.set3].filter(Boolean).join(', ');

  const p1 = (resultData.jugador1 || '').trim();
  const p2 = (resultData.jugador2 || '').trim();
  const ganador = (resultData.ganador || '').trim();

  const ptsP1 = resultData.puntosJugador1 !== undefined ? Number(resultData.puntosJugador1) : (ganador === p1 ? Number(resultData.puntos) || 0 : 0);
  const ptsP2 = resultData.puntosJugador2 !== undefined ? Number(resultData.puntosJugador2) : (ganador === p2 ? Number(resultData.puntos) || 0 : 0);
  const ptsWinner = ganador === p1 ? ptsP1 : (ganador === p2 ? ptsP2 : (Number(resultData.puntos) || ptsP1 || ptsP2 || 0));

  const newResult = {
    id: 'res-' + Date.now(),
    categoria: resultData.categoria || '4ta',
    ronda: resultData.ronda || 'Gran Final',
    jugador1: p1,
    jugador2: p2,
    set1: (resultData.set1 || '').trim(),
    set2: (resultData.set2 || '').trim(),
    set3: (resultData.set3 || '').trim(),
    score: scoreStr,
    ganador: ganador,
    puntos: ptsWinner,
    puntosJugador1: ptsP1,
    puntosJugador2: ptsP2,
    observaciones: (resultData.observaciones || '').trim(),
    fechaCarga: new Date().toISOString().split('T')[0]
  };

  tournaments[index].resultados.unshift(newResult);

  const mod = tournaments[index].modalidad || 'singles';
  const shouldSumP1 = resultData.sumarRankingP1 !== undefined ? Boolean(resultData.sumarRankingP1) : Boolean(resultData.sumarRanking);
  const shouldSumP2 = resultData.sumarRankingP2 !== undefined ? Boolean(resultData.sumarRankingP2) : (Boolean(resultData.sumarRanking) && ganador === p2);

  if (shouldSumP1 && p1 && ptsP1 > 0) {
    awardPointsToPlayer(p1, ptsP1, mod);
  }
  if (shouldSumP2 && p2 && ptsP2 > 0) {
    awardPointsToPlayer(p2, ptsP2, mod);
  }

  saveTournaments(tournaments);
  return { success: true, resultado: newResult, torneo: tournaments[index] };
}

export function updateTournamentResult(tournamentId, resultId, updatedData) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1) return { error: 'Torneo no encontrado' };

  if (!tournaments[index].resultados) tournaments[index].resultados = [];
  const rIdx = tournaments[index].resultados.findIndex((r) => r.id === resultId);
  if (rIdx === -1) return { error: 'Resultado no encontrado' };

  const current = tournaments[index].resultados[rIdx];
  const scoreStr = updatedData.score?.trim() || [
    updatedData.set1 !== undefined ? updatedData.set1 : current.set1,
    updatedData.set2 !== undefined ? updatedData.set2 : current.set2,
    updatedData.set3 !== undefined ? updatedData.set3 : current.set3
  ].filter(Boolean).join(', ');

  const p1 = updatedData.jugador1 !== undefined ? (updatedData.jugador1 || '').trim() : current.jugador1;
  const p2 = updatedData.jugador2 !== undefined ? (updatedData.jugador2 || '').trim() : current.jugador2;
  const ganador = updatedData.ganador !== undefined ? (updatedData.ganador || '').trim() : current.ganador;

  const ptsP1 = updatedData.puntosJugador1 !== undefined ? Number(updatedData.puntosJugador1) : (current.puntosJugador1 !== undefined ? current.puntosJugador1 : (ganador === p1 ? current.puntos : 0));
  const ptsP2 = updatedData.puntosJugador2 !== undefined ? Number(updatedData.puntosJugador2) : (current.puntosJugador2 !== undefined ? current.puntosJugador2 : (ganador === p2 ? current.puntos : 0));
  const ptsWinner = ganador === p1 ? ptsP1 : (ganador === p2 ? ptsP2 : (updatedData.puntos !== undefined ? Number(updatedData.puntos) : current.puntos));

  tournaments[index].resultados[rIdx] = {
    ...current,
    ...updatedData,
    puntos: ptsWinner,
    puntosJugador1: ptsP1,
    puntosJugador2: ptsP2,
    score: scoreStr
  };

  saveTournaments(tournaments);
  return { success: true, resultado: tournaments[index].resultados[rIdx], torneo: tournaments[index] };
}

export function deleteTournamentResult(tournamentId, resultId) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1) return { error: 'Torneo no encontrado' };

  if (tournaments[index].resultados) {
    tournaments[index].resultados = tournaments[index].resultados.filter((r) => r.id !== resultId);
    saveTournaments(tournaments);
  }
  return { success: true, torneo: tournaments[index] };
}

export function updateTournamentModality(tournamentId, newModality) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index !== -1) {
    tournaments[index].modalidad = newModality;
    saveTournaments(tournaments);
    return tournaments[index];
  }
  return null;
}

export function getCategoryOccupancy(tournament, categoriaName) {
  if (!tournament) return { total: 16, used: 0, remaining: 16, isFull: false };
  const cats = tournament.categorias || [];
  const cat = cats.find((c) => normalizeCategory(c.nombre) === normalizeCategory(categoriaName));
  const total = cat ? Number(cat.cupos) || 16 : 16;
  const inscripciones = tournament.inscripciones || [];
  const used = inscripciones.filter((i) => normalizeCategory(i.categoria) === normalizeCategory(categoriaName)).length;
  return {
    total,
    used,
    remaining: Math.max(0, total - used),
    isFull: used >= total
  };
}

export function registerPlayerToTournament(tournamentId, playerData) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1) return null;

  const currentTourney = tournaments[index];
  const isDobles = currentTourney.modalidad === 'dobles' || playerData.modalidad === 'dobles';
  const isGrupal = currentTourney.modalidad === 'grupal' || currentTourney.modalidad === 'equipos' || playerData.modalidad === 'grupal' || playerData.modalidad === 'equipos';

  const newRegistration = {
    id: 'insc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    nombre: isGrupal
      ? `${playerData.nombreEquipo || 'Equipo'} (${playerData.nombre})`
      : (isDobles && playerData.nombreJugador2
        ? `${playerData.nombre} / ${playerData.nombreJugador2}`
        : playerData.nombre),
    email: playerData.email,
    dni: maskDni(playerData.dni),
    telefono: playerData.telefono || '',
    categoria: playerData.categoria || '4ta',
    modalidad: isGrupal ? 'grupal' : (isDobles ? 'dobles' : 'singles'),
    esDobles: isDobles,
    esGrupal: isGrupal,
    nombreEquipo: isGrupal ? (playerData.nombreEquipo || '').trim() : undefined,
    fotoEquipo: isGrupal ? (playerData.fotoEquipo || '').trim() : undefined,
    jugador1: {
      nombre: playerData.nombre,
      dni: maskDni(playerData.dni),
      email: playerData.email || '',
      telefono: playerData.telefono || '',
      rol: 'Capitán / Titular 1'
    },
    jugador2: (isDobles || isGrupal) ? {
      nombre: playerData.nombreJugador2 || '',
      dni: maskDni(playerData.dniJugador2),
      email: playerData.emailJugador2 || '',
      telefono: playerData.telefonoJugador2 || '',
      rol: isGrupal ? 'Titular 2' : 'Compañero'
    } : null,
    jugador3: isGrupal ? {
      nombre: playerData.nombreJugador3 || '',
      dni: maskDni(playerData.dniJugador3),
      email: playerData.emailJugador3 || '',
      telefono: playerData.telefonoJugador3 || '',
      rol: 'Titular 3'
    } : null,
    jugador4: (isGrupal && (playerData.nombreJugador4 || playerData.dniJugador4)) ? {
      nombre: playerData.nombreJugador4 || '',
      dni: maskDni(playerData.dniJugador4),
      email: playerData.emailJugador4 || '',
      telefono: playerData.telefonoJugador4 || '',
      rol: 'Jugador 4 (Opcional)',
      esOpcional: true
    } : null,
    jugador5: (isGrupal && (playerData.nombreJugador5 || playerData.dniJugador5)) ? {
      nombre: playerData.nombreJugador5 || '',
      dni: maskDni(playerData.dniJugador5),
      email: playerData.emailJugador5 || '',
      telefono: playerData.telefonoJugador5 || '',
      rol: 'Jugador 5 (Suplente / Opcional)',
      esSuplente: true,
      esOpcional: true
    } : null,
    integrantes: isGrupal ? [
      { rol: 'Capitán / Titular 1', nombre: playerData.nombre, dni: maskDni(playerData.dni), email: playerData.email || '', telefono: playerData.telefono || '' },
      { rol: 'Titular 2', nombre: playerData.nombreJugador2 || '', dni: maskDni(playerData.dniJugador2), email: playerData.emailJugador2 || '', telefono: playerData.telefonoJugador2 || '' },
      { rol: 'Titular 3', nombre: playerData.nombreJugador3 || '', dni: maskDni(playerData.dniJugador3), email: playerData.emailJugador3 || '', telefono: playerData.telefonoJugador3 || '' },
      ...(playerData.nombreJugador4 ? [{ rol: 'Jugador 4 (Opcional)', nombre: playerData.nombreJugador4, dni: maskDni(playerData.dniJugador4), email: playerData.emailJugador4 || '', telefono: playerData.telefonoJugador4 || '' }] : []),
      ...(playerData.nombreJugador5 ? [{ rol: 'Jugador 5 (Suplente / Opcional)', nombre: playerData.nombreJugador5, dni: maskDni(playerData.dniJugador5), email: playerData.emailJugador5 || '', telefono: playerData.telefonoJugador5 || '' }] : [])
    ] : undefined,
    estadoPago: Number(tournaments[index].precio) === 0 ? 'aprobado' : 'pendiente',
    fechaRegistro: new Date().toISOString().split('T')[0],
    metodoPago: playerData.metodoPago || 'Yape',
    comprobanteInfo: playerData.comprobanteInfo || ''
  };

  if (!tournaments[index].inscripciones) {
    tournaments[index].inscripciones = [];
  }

  tournaments[index].inscripciones.push(newRegistration);
  saveTournaments(tournaments);

  // Sincronizar inscripción con backend MySQL / SiteGround
  tournamentApi.createInscription(tournamentId, {
    ...playerData,
    ...newRegistration
  }).catch((err) => {
    console.warn('[ATAP] Sincronización de inscripción con servidor pendiente:', err);
  });

  return newRegistration;
}

export function updateRegistrationStatus(tournamentId, registrationId, newStatus) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1) return false;

  const inscList = tournaments[index].inscripciones || [];
  const insc = inscList.find((i) => i.id === registrationId);
  if (insc) {
    insc.estadoPago = newStatus;
    saveTournaments(tournaments);

    // Sincronizar estado en MySQL
    tournamentApi.updateInscriptionStatus(registrationId, newStatus).catch((err) => {
      console.warn('[ATAP] Sincronización de estado de inscripción pendiente:', err);
    });

    return true;
  }
  return false;
}

// ----------------- BRACKET / FIXTURE METHODS -----------------

export function generateTournamentBracket(tournamentId) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1) return { error: 'Torneo no encontrado.' };

  const tournament = tournaments[index];
  const approved = (tournament.inscripciones || []).filter((i) => i.estadoPago === 'aprobado');

  if (approved.length < 2) {
    return {
      error: 'Se necesitan al menos 2 jugadores con pago aprobado para realizar el sorteo.'
    };
  }

  // Shuffle players randomly (Fisher-Yates)
  const pool = [...approved];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = pool[i];
    pool[i] = pool[j];
    pool[j] = temp;
  }

  // Determine bracket size: dynamically support 4, 8, 16, 32, 64
  let bracketSize = 4;
  if (pool.length > 32) {
    bracketSize = 64;
  } else if (pool.length > 16) {
    bracketSize = 32;
  } else if (pool.length > 8) {
    bracketSize = 16;
  } else if (pool.length >= 6) {
    bracketSize = 8;
  } else {
    bracketSize = 4;
  }

  // Complete pool if needed with ranking players
  const rankings = getRanking();
  let rankIdx = 0;
  while (pool.length < bracketSize) {
    const rankP = rankings[rankIdx % rankings.length] || { name: `Jugador ${pool.length + 1}`, categoria: '4ta' };
    rankIdx++;
    pool.push({
      id: 'seed-' + pool.length,
      nombre: rankP.name,
      categoria: rankP.categoria,
      image: rankP.image
    });
  }

  const participants = pool.slice(0, bracketSize);
  const rounds = generateKnockoutStructure(bracketSize);

  // Populate first round with participants
  if (rounds.length > 0 && rounds[0].matches) {
    rounds[0].matches.forEach((m, i) => {
      const p1 = participants[i * 2];
      const p2 = participants[i * 2 + 1];
      if (p1) m.player1 = { name: p1.nombre, categoria: p1.categoria };
      if (p2) m.player2 = { name: p2.nombre, categoria: p2.categoria };
    });
  }

  tournament.bracket = {
    size: bracketSize,
    generatedAt: new Date().toISOString(),
    rounds: rounds,
    champion: null
  };
  tournament.estado = 'en_curso';

  saveTournaments(tournaments);
  return { success: true, bracket: tournament.bracket };
}

// ----------------- REGISTERED USERS METHODS -----------------

export function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    let users = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(users)) users = [];

    // 1. Asegurar cuenta Admin
    const adminIdx = users.findIndex(
      (u) => u.dni === '00000000' || u.dni === '*****000' || u.email?.toLowerCase() === 'vladimiryt18@gmail.com'
    );
    if (adminIdx === -1) {
      users.unshift(INITIAL_REGISTERED_USERS[0]);
    }

    // 2. Obtener lista del ranking leyendo de localStorage o INITIAL_RANKING directamente (sin llamada recursiva)
    const rawRanking = localStorage.getItem(STORAGE_KEYS.RANKING);
    let rankingList = rawRanking ? JSON.parse(rawRanking) : INITIAL_RANKING;
    if (!Array.isArray(rankingList) || rankingList.length === 0) {
      rankingList = INITIAL_RANKING;
    }

    let hasChanged = false;

    // Sincronizar e incorporar todos los jugadores del circuito hacia la gestión de jugadores
    rankingList.forEach((rp) => {
      const rpDni = maskDni((rp.dni || '').toString().trim().replace(/\s+/g, ''));
      const rpName = (rp.name || rp.nombre || '').trim();
      if (!rpName) return;

      const userIdx = users.findIndex((u) => {
        const uDni = (u.dni || u.documentoIdentidad || '').toString().trim().replace(/\s+/g, '');
        const uName = (u.nombre || u.name || '').trim().toLowerCase();
        return (rpDni && uDni && (rpDni === uDni || uDni.endsWith(rpDni.slice(-3)))) || (uName === rpName.toLowerCase());
      });

      const rpPointsNum = rp.puntosNum !== undefined ? Number(rp.puntosNum) : 0;
      const rpPointsStr = rp.points || `${rpPointsNum.toLocaleString()} pts`;

      if (userIdx !== -1) {
        if (users[userIdx].puntosNum !== rpPointsNum) {
          users[userIdx].puntosNum = rpPointsNum;
          users[userIdx].points = rpPointsStr;
          hasChanged = true;
        }
        if ((!users[userIdx].dni || !users[userIdx].dni.includes('*')) && rpDni) {
          users[userIdx].dni = rpDni;
          users[userIdx].documentoIdentidad = rpDni;
          hasChanged = true;
        }
        if (rp.image && (!users[userIdx].avatar || users[userIdx].avatar === '/assets/logo.png')) {
          users[userIdx].avatar = rp.image;
          users[userIdx].image = rp.image;
          hasChanged = true;
        }
        if (!users[userIdx].categoria && rp.categoria) {
          users[userIdx].categoria = rp.categoria;
          hasChanged = true;
        }
      } else {
        const genDni = rpDni || maskDni('7000' + Math.floor(1000 + Math.random() * 9000));
        users.push({
          id: rp.id || 'p-' + (genDni.slice(-3) || Date.now()) + '-' + Date.now(),
          dni: genDni,
          documentoIdentidad: genDni,
          nombre: rpName,
          email: rp.email || '',
          telefono: rp.telefono || '',
          whatsapp: rp.telefono || '',
          categoria: rp.categoria || '4ta',
          puntosNum: rpPointsNum,
          points: rpPointsStr,
          avatar: rp.image || rp.avatar || '/assets/logo.png',
          image: rp.image || rp.avatar || '/assets/logo.png',
          perfilIncompleto: rp.perfilIncompleto !== undefined ? rp.perfilIncompleto : false,
          completadoOnboarding: true,
          fechaRegistro: new Date().toISOString().split('T')[0]
        });
        hasChanged = true;
      }
    });

    if (hasChanged) {
      try {
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
      } catch (e) {}
    }

    return users;
  } catch (e) {
    console.error('Error reading registered users:', e);
    return INITIAL_REGISTERED_USERS;
  }
}

export function saveRegisteredUser(userData) {
  if (!userData) return null;
  const users = getRegisteredUsers();
  const rawDni = (userData.dni || userData.documentoIdentidad || '').toString().trim();
  const cleanDni = rawDni.replace(/\s+/g, '');
  const maskedDni = maskDni(cleanDni);
  const origDni = (userData.originalDni || '').toString().trim().replace(/\s+/g, '');
  const origMasked = origDni ? maskDni(origDni) : '';

  if (!cleanDni) return null;

  const index = users.findIndex(
    (u) => {
      const uDni = (u.dni || u.documentoIdentidad || '').toString().trim().replace(/\s+/g, '');
      const matchOrig = origDni && (uDni === origDni || uDni === origMasked || (origDni.length >= 3 && uDni.endsWith(origDni.slice(-3))));
      const matchClean = uDni === cleanDni || uDni === maskedDni || (cleanDni.length >= 3 && uDni.endsWith(cleanDni.slice(-3)));
      const matchEmail = u.email && userData.email && u.email.toLowerCase() === userData.email.toLowerCase();
      return matchOrig || matchClean || matchEmail;
    }
  );

  const pointsNum = userData.puntosNum !== undefined
    ? Number(userData.puntosNum)
    : (userData.puntos !== undefined
      ? Number(userData.puntos)
      : (index !== -1 && users[index].puntosNum !== undefined ? Number(users[index].puntosNum) : 0));
  const pointsStr = userData.points || `${pointsNum.toLocaleString()} pts`;

  const titulosNum = userData.titulosGanados !== undefined
    ? Math.max(0, parseInt(userData.titulosGanados, 10) || 0)
    : (userData.titulos !== undefined
      ? Math.max(0, parseInt(userData.titulos, 10) || 0)
      : (index !== -1 && users[index].titulosGanados !== undefined
        ? Math.max(0, parseInt(users[index].titulosGanados, 10) || 0)
        : (index !== -1 && users[index].titulos !== undefined ? Math.max(0, parseInt(users[index].titulos, 10) || 0) : 0)));

  const cleanUser = {
    ...(index !== -1 ? users[index] : {}),
    ...userData,
    dni: maskedDni,
    documentoIdentidad: maskedDni,
    dniReal: (!cleanDni.includes('*') && !cleanDni.includes('•') && cleanDni.length >= 5)
      ? cleanDni
      : (index !== -1 && users[index].dniReal ? users[index].dniReal : (userData.dniReal || cleanDni)),
    nombre: (userData.nombre || (index !== -1 ? users[index].nombre : '') || '').trim() || 'Jugador ATAP',
    email: (userData.email || (index !== -1 ? users[index].email : '') || '').trim(),
    telefono: (userData.telefono || userData.whatsapp || (index !== -1 ? (users[index].telefono || users[index].whatsapp) : '') || '').trim(),
    whatsapp: (userData.whatsapp || userData.telefono || (index !== -1 ? (users[index].whatsapp || users[index].telefono) : '') || '').trim(),
    categoria: userData.categoria || (index !== -1 ? users[index].categoria : '') || '4ta',
    puntosNum: pointsNum,
    points: pointsStr,
    titulosGanados: titulosNum,
    titulos: titulosNum,
    avatar: userData.avatar || (index !== -1 ? users[index].avatar : '/assets/logo.png') || '/assets/logo.png',
    image: userData.image || (index !== -1 ? users[index].image : '/assets/logo.png') || '/assets/logo.png',
    perfilIncompleto: userData.perfilIncompleto !== undefined ? Boolean(userData.perfilIncompleto) : (index !== -1 ? users[index].perfilIncompleto : true),
    fechaRegistro: userData.fechaRegistro || (index !== -1 ? users[index].fechaRegistro : null) || new Date().toISOString().split('T')[0]
  };

  // Si el usuario ya completó el onboarding o tiene perfil explícitamente completo
  if (userData.completadoOnboarding || userData.perfilIncompleto === false) {
    cleanUser.perfilIncompleto = false;
  }

  if (index !== -1) {
    users[index] = { ...users[index], ...cleanUser };
  } else {
    users.push(cleanUser);
  }

  try {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
    emitAtapUpdate(STORAGE_KEYS.REGISTERED_USERS, users);
  } catch (e) {
    console.error('Error saving registered user:', e);
  }

  // SINCRONIZAR AUTOMÁTICAMENTE CON EL RANKING DEL CIRCUITO (TODO DEBE TENER RELACIÓN)
  if (cleanUser.dni !== '00000000' && cleanUser.dni !== '*****000' && cleanUser.email?.toLowerCase() !== 'vladimiryt18@gmail.com') {
    try {
      const rawRank = localStorage.getItem(STORAGE_KEYS.RANKING);
      let ranking = rawRank ? JSON.parse(rawRank) : INITIAL_RANKING;
      const rankIdx = ranking.findIndex(
        (p) => {
          const pDni = (p.dni || '').toString().trim().replace(/\s+/g, '');
          const matchOrig = origDni && (pDni === origDni || pDni === origMasked || (origDni.length >= 3 && pDni.endsWith(origDni.slice(-3))));
          const matchClean = pDni === cleanDni || pDni === maskedDni || (cleanDni.length >= 3 && pDni.endsWith(cleanDni.slice(-3)));
          const matchEmail = p.email && cleanUser.email && p.email.toLowerCase() === cleanUser.email.toLowerCase();
          const matchName = p.name && p.name.trim().toLowerCase() === cleanUser.nombre.toLowerCase();
          return matchOrig || matchClean || matchEmail || matchName;
        }
      );

      if (rankIdx !== -1) {
        ranking[rankIdx] = {
          ...ranking[rankIdx],
          name: cleanUser.nombre,
          categoria: cleanUser.categoria || ranking[rankIdx].categoria || '4ta',
          dni: maskedDni,
          puntosNum: cleanUser.puntosNum,
          points: cleanUser.points,
          titulosGanados: titulosNum,
          titulos: titulosNum,
          email: cleanUser.email || ranking[rankIdx].email || '',
          telefono: cleanUser.telefono || cleanUser.whatsapp || ranking[rankIdx].telefono || '',
          instagram: cleanUser.instagram || cleanUser.ig || ranking[rankIdx].instagram || '',
          avatar: cleanUser.avatar || ranking[rankIdx].avatar || '/assets/logo.png',
          image: cleanUser.image || cleanUser.avatar || ranking[rankIdx].image || '/assets/logo.png'
        };
      } else {
        ranking.push({
          id: 'p-' + (cleanDni.slice(-3) || Date.now()) + '-' + Date.now(),
          name: cleanUser.nombre,
          dni: maskedDni,
          country: 'PER',
          puntosNum: cleanUser.puntosNum,
          points: cleanUser.points,
          categoria: cleanUser.categoria || '4ta',
          titulos: titulosNum,
          titulosGanados: titulosNum,
          golpe: 'Drive cruzado',
          mejorGolpe: 'Drive cruzado',
          mano: 'Diestro',
          manoDominante: 'Diestro',
          efectividad: '70%',
          instagram: cleanUser.instagram || cleanUser.ig || '',
          image: cleanUser.image || cleanUser.avatar || '/assets/logo.png',
          avatar: cleanUser.avatar || cleanUser.image || '/assets/logo.png',
          email: cleanUser.email || '',
          telefono: cleanUser.telefono || cleanUser.whatsapp || '',
          zonas: ['Lima Centro', 'Lima Sur'],
          disponibilidad: ['SAB', 'DOM'],
          perfilIncompleto: cleanUser.perfilIncompleto || false
        });
      }
      ranking.sort((a, b) => (b.puntosNum || 0) - (a.puntosNum || 0));
      saveRanking(ranking);
      emitAtapUpdate(STORAGE_KEYS.RANKING, ranking);
    } catch (e) {
      console.error('Error syncing registered user with ranking:', e);
    }
  }

  // SINCRONIZAR CON INSCRIPCIONES EN TORNEOS SI CAMBIÓ NOMBRE, CATEGORÍA O FOTO
  try {
    const tournaments = getTournaments();
    let tourneysUpdated = false;
    tournaments.forEach((t) => {
      if (t.inscripciones && t.inscripciones.length > 0) {
        t.inscripciones.forEach((insc) => {
          const iDni = (insc.dni || insc.documentoIdentidad || '').toString().trim().replace(/\s+/g, '');
          const iName = (insc.nombre || insc.name || '').toString().trim().toLowerCase();
          const matchDni = (origDni && (iDni === origDni || iDni === origMasked || (origDni.length >= 3 && iDni.endsWith(origDni.slice(-3))))) ||
                           (cleanDni && (iDni === cleanDni || iDni === maskedDni || (cleanDni.length >= 3 && iDni.endsWith(cleanDni.slice(-3)))));
          const matchName = cleanUser.nombre && iName === cleanUser.nombre.toLowerCase();
          if (matchDni || matchName) {
            insc.nombre = cleanUser.nombre;
            insc.name = cleanUser.nombre;
            insc.dni = maskedDni;
            insc.documentoIdentidad = maskedDni;
            insc.categoria = cleanUser.categoria;
            insc.avatar = cleanUser.avatar;
            insc.image = cleanUser.image;
            tourneysUpdated = true;
          }
        });
      }
    });
    if (tourneysUpdated) {
      saveTournaments(tournaments);
      emitAtapUpdate(STORAGE_KEYS.TOURNEYS, tournaments);
    }
  } catch (e) {
    console.error('Error syncing user edits with tournaments:', e);
  }

  return cleanUser;
}

export function deleteRegisteredUser(dniOrEmailOrName) {
  if (!dniOrEmailOrName) return false;
  const target = dniOrEmailOrName.toString().trim().toLowerCase().replace(/\s+/g, '');
  if (target === 'vladimiryt18@gmail.com' || target === '00000000' || target === '*****000') {
    return false; // Proteger la cuenta del administrador
  }

  const users = getRegisteredUsers();
  // Obtener datos del usuario antes de eliminar para tener todos los identificadores (DNI, email, nombre)
  const foundUser = users.find((u) => {
    const cleanDni = (u.dni || u.documentoIdentidad || '').toString().trim().replace(/\s+/g, '').toLowerCase();
    const cleanEmail = (u.email || '').toString().trim().toLowerCase();
    const cleanName = (u.nombre || '').toString().trim().toLowerCase();
    return cleanDni === target || (target.length >= 3 && cleanDni.endsWith(target.slice(-3))) || cleanEmail === target || cleanName === target;
  });

  const targetDni = foundUser ? (foundUser.dni || foundUser.documentoIdentidad || '').toString().trim().replace(/\s+/g, '').toLowerCase() : target;
  const targetEmail = foundUser ? (foundUser.email || '').toString().trim().toLowerCase() : target;
  const targetName = foundUser ? (foundUser.nombre || '').toString().trim().toLowerCase() : target;

  const filteredUsers = users.filter((u) => {
    const cleanDni = (u.dni || u.documentoIdentidad || '').toString().trim().replace(/\s+/g, '').toLowerCase();
    const cleanEmail = (u.email || '').toString().trim().toLowerCase();
    const cleanName = (u.nombre || '').toString().trim().toLowerCase();
    const matchDni = cleanDni === targetDni || cleanDni === target || (target.length >= 3 && cleanDni.endsWith(target.slice(-3)));
    return !matchDni && cleanEmail !== targetEmail && cleanName !== targetName;
  });

  let hasChanged = false;

  if (filteredUsers.length !== users.length) {
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(filteredUsers));
      emitAtapUpdate(STORAGE_KEYS.REGISTERED_USERS, filteredUsers);
      hasChanged = true;
    } catch (e) {
      console.error('Error deleting registered user:', e);
    }
  }

  // ELIMINAR TAMBIÉN DE RANKING DEL CIRCUITO (TODO DEBE TENER RELACIÓN)
  try {
    const rawRank = localStorage.getItem(STORAGE_KEYS.RANKING);
    let ranking = rawRank ? JSON.parse(rawRank) : INITIAL_RANKING;
    const initialRankLen = ranking.length;
    const filteredRanking = ranking.filter((p) => {
      const pDni = (p.dni || '').toString().trim().replace(/\s+/g, '').toLowerCase();
      const pEmail = (p.email || '').toString().trim().toLowerCase();
      const pName = (p.name || '').toString().trim().toLowerCase();
      const matchDni = targetDni && pDni && (pDni === targetDni || pDni === target || (target.length >= 3 && pDni.endsWith(target.slice(-3))));
      const matchEmail = targetEmail && pEmail && (pEmail === targetEmail || pEmail === target);
      const matchName = targetName && pName && (pName === targetName || pName === target);
      return !matchDni && !matchEmail && !matchName;
    });

    if (filteredRanking.length !== initialRankLen) {
      saveRanking(filteredRanking);
      emitAtapUpdate(STORAGE_KEYS.RANKING, filteredRanking);
      hasChanged = true;
    }
  } catch (e) {
    console.error('Error removing player from ranking:', e);
  }

  // ELIMINAR TAMBIÉN DE INSCRIPCIONES EN TORNEOS
  try {
    const tournaments = getTournaments();
    let tourneysUpdated = false;
    tournaments.forEach((t) => {
      if (t.inscripciones && t.inscripciones.length > 0) {
        const origInscLen = t.inscripciones.length;
        t.inscripciones = t.inscripciones.filter((insc) => {
          const iDni = (insc.dni || insc.documentoIdentidad || '').toString().trim().replace(/\s+/g, '').toLowerCase();
          const iEmail = (insc.email || '').toString().trim().toLowerCase();
          const iName = (insc.nombre || insc.name || '').toString().trim().toLowerCase();
          const matchDni = targetDni && iDni && (iDni === targetDni || iDni === target || (target.length >= 3 && iDni.endsWith(target.slice(-3))));
          const matchEmail = targetEmail && iEmail && (iEmail === targetEmail || iEmail === target);
          const matchName = targetName && iName && (iName === targetName || iName === target);
          return !matchDni && !matchEmail && !matchName;
        });
        if (t.inscripciones.length !== origInscLen) {
          tourneysUpdated = true;
        }
      }
    });
    if (tourneysUpdated) {
      saveTournaments(tournaments);
      emitAtapUpdate(STORAGE_KEYS.TOURNEYS, tournaments);
      hasChanged = true;
    }
  } catch (e) {
    console.error('Error removing player from tournaments:', e);
  }

  return hasChanged;
}

export function addPlayerToTournamentBank(tournamentId, playerOrUserData) {
  if (!tournamentId || !playerOrUserData) return null;
  const tournaments = getTournaments();
  const tIdx = tournaments.findIndex((t) => t.id === tournamentId);
  if (tIdx === -1) return null;

  const currentTourney = tournaments[tIdx];
  if (!currentTourney.inscripciones) {
    currentTourney.inscripciones = [];
  }

  const rawDni = (playerOrUserData.dni || playerOrUserData.documentoIdentidad || '').toString().trim();
  const cleanDni = rawDni.replace(/\s+/g, '');
  const maskedDni = maskDni(cleanDni);
  const cleanNombre = (playerOrUserData.nombre || playerOrUserData.name || '').trim();

  // Verificar si ya existe en las inscripciones
  const existingInscIdx = currentTourney.inscripciones.findIndex(
    (i) => {
      const iDni = (i.dni || i.documentoIdentidad || '').toString().trim().replace(/\s+/g, '');
      const matchDni = cleanDni && (iDni === cleanDni || iDni === maskedDni || (cleanDni.length >= 3 && iDni.endsWith(cleanDni.slice(-3))));
      const matchName = cleanNombre && (i.nombre || i.name || '').trim().toLowerCase() === cleanNombre.toLowerCase();
      return matchDni || matchName;
    }
  );

  if (existingInscIdx !== -1) {
    // Si ya existe, asegurar que su estado sea aprobado
    currentTourney.inscripciones[existingInscIdx].estadoPago = 'aprobado';
    if (maskedDni) {
      currentTourney.inscripciones[existingInscIdx].dni = maskedDni;
      currentTourney.inscripciones[existingInscIdx].documentoIdentidad = maskedDni;
    }
    saveTournaments(tournaments);
    return currentTourney;
  }

  const newRegistration = {
    id: 'insc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    nombre: cleanNombre || 'Jugador ATAP',
    dni: maskedDni,
    documentoIdentidad: maskedDni,
    email: playerOrUserData.email || '',
    telefono: playerOrUserData.telefono || playerOrUserData.whatsapp || '',
    categoria: playerOrUserData.categoria || currentTourney.categoria || '4ta',
    avatar: playerOrUserData.avatar || playerOrUserData.image || '/assets/logo.png',
    image: playerOrUserData.image || playerOrUserData.avatar || '/assets/logo.png',
    puntosNum: playerOrUserData.puntosNum !== undefined ? Number(playerOrUserData.puntosNum) : 0,
    points: playerOrUserData.points || `${playerOrUserData.puntosNum || 0} pts`,
    estadoPago: 'aprobado',
    fechaRegistro: new Date().toISOString().split('T')[0],
    metodoPago: 'Aprobado por Administración',
    comprobanteInfo: 'Agregado al banco de participantes'
  };

  currentTourney.inscripciones.push(newRegistration);
  saveTournaments(tournaments);
  emitAtapUpdate(STORAGE_KEYS.TOURNEYS, tournaments);
  return currentTourney;
}

export function resetAllRegisteredUsersToAdminOnly() {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(INITIAL_REGISTERED_USERS));

    const currentUserRaw = localStorage.getItem(STORAGE_KEYS.USER);
    if (currentUserRaw) {
      try {
        const u = JSON.parse(currentUserRaw);
        if (u.email?.toLowerCase() !== 'vladimiryt18@gmail.com') {
          localStorage.removeItem(STORAGE_KEYS.USER);
        }
      } catch {}
    }

    const tourneysRaw = localStorage.getItem(STORAGE_KEYS.TOURNEYS);
    if (tourneysRaw) {
      const tourneys = JSON.parse(tourneysRaw);
      let tChanged = false;
      tourneys.forEach((t) => {
        if (t.inscripciones && t.inscripciones.length > 0) {
          t.inscripciones = t.inscripciones.filter(
            (i) => i.email?.toLowerCase() === 'vladimiryt18@gmail.com' || i.dni === '00000000' || i.dni === '*****000'
          );
          tChanged = true;
        }
      });
      if (tChanged) {
        localStorage.setItem(STORAGE_KEYS.TOURNEYS, JSON.stringify(tourneys));
      }
    }

    emitAtapUpdate(STORAGE_KEYS.REGISTERED_USERS, INITIAL_REGISTERED_USERS);
    return true;
  } catch (e) {
    console.error('Error resetting registered users to admin only:', e);
    return false;
  }
}

export function isUserProfileIncomplete(user) {
  if (!user) return true;
  if (user.perfilIncompleto === true) return true;
  const emailValid = Boolean(user.email && user.email.trim().length > 3 && user.email.includes('@'));
  const phoneValid = Boolean(user.telefono && user.telefono.trim().length >= 6);
  return !emailValid || !phoneValid;
}

export function quickCreateTournamentPlayer({ tournamentId, nombre, dni, categoria }) {
  if (!nombre || !dni) {
    return { error: 'Nombre y DNI son obligatorios para registrar al jugador.' };
  }

  const cleanNombre = nombre.trim();
  const cleanDni = dni.toString().trim().replace(/\s+/g, '');
  const maskedDni = maskDni(cleanDni);

  if (!cleanDni || cleanDni.length < 5) {
    return { error: 'El DNI ingresado no es válido (mínimo 5 caracteres).' };
  }

  // 1. Guardar o actualizar en Usuarios Registrados con perfilIncompleto = true y logo ATAP
  const users = getRegisteredUsers();
  const existingIdx = users.findIndex(
    (u) => {
      const uDni = (u.dni || u.documentoIdentidad || '').toString().trim().replace(/\s+/g, '');
      return uDni === cleanDni || uDni === maskedDni || (cleanDni.length >= 3 && uDni.endsWith(cleanDni.slice(-3)));
    }
  );

  let registeredUser;
  if (existingIdx !== -1) {
    registeredUser = {
      ...users[existingIdx],
      dni: maskedDni,
      documentoIdentidad: maskedDni,
      nombre: cleanNombre,
      categoria: categoria || users[existingIdx].categoria || '4ta',
      avatar: users[existingIdx].avatar || '/assets/logo.png',
      image: users[existingIdx].image || '/assets/logo.png'
    };
    users[existingIdx] = registeredUser;
  } else {
    registeredUser = {
      dni: maskedDni,
      documentoIdentidad: maskedDni,
      nombre: cleanNombre,
      email: '',
      telefono: '',
      categoria: categoria || '4ta',
      avatar: '/assets/logo.png',
      image: '/assets/logo.png',
      perfilIncompleto: true,
      creadoPorAdminEnTorneo: tournamentId || null,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    users.push(registeredUser);
  }

  try {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
    emitAtapUpdate(STORAGE_KEYS.REGISTERED_USERS, users);
  } catch (e) {
    console.error('Error saving quick player to registered users:', e);
  }

  // 2. Si hay un torneo seleccionado (finalizado), agregarlo a inscripciones como aprobado
  let updatedTournament = null;
  if (tournamentId) {
    const tournaments = getTournaments();
    const tIdx = tournaments.findIndex((t) => t.id === tournamentId);
    if (tIdx !== -1) {
      if (!tournaments[tIdx].inscripciones) {
        tournaments[tIdx].inscripciones = [];
      }

      const alreadyInscribed = tournaments[tIdx].inscripciones.some(
        (i) => {
          const iDni = (i.dni || i.documentoIdentidad || '').toString().trim().replace(/\s+/g, '');
          const matchDni = cleanDni && (iDni === cleanDni || iDni === maskedDni || (cleanDni.length >= 3 && iDni.endsWith(cleanDni.slice(-3))));
          const matchName = (i.nombre || '').trim().toLowerCase() === cleanNombre.toLowerCase();
          return matchDni || matchName;
        }
      );

      if (!alreadyInscribed) {
        const newInsc = {
          id: 'insc-quick-' + Date.now(),
          nombre: cleanNombre,
          dni: maskedDni,
          documentoIdentidad: maskedDni,
          email: '',
          telefono: '',
          categoria: categoria || '4ta',
          estadoPago: 'aprobado',
          fechaRegistro: new Date().toISOString().split('T')[0],
          metodoPago: 'Yape / Presencial',
          comprobanteInfo: 'Cargado administrativamente por torneo finalizado'
        };
        tournaments[tIdx].inscripciones.push(newInsc);
        saveTournaments(tournaments);
      }
      updatedTournament = tournaments[tIdx];
    }
  }

  // 3. Registrar o sincronizar en Ranking con logo oficial ATAP (/assets/logo.png)
  const ranking = getRanking();
  const rankIdx = ranking.findIndex(
    (p) => {
      const pDni = (p.dni || '').toString().trim().replace(/\s+/g, '');
      const matchDni = cleanDni && (pDni === cleanDni || pDni === maskedDni || (cleanDni.length >= 3 && pDni.endsWith(cleanDni.slice(-3))));
      const matchName = (p.name || '').trim().toLowerCase() === cleanNombre.toLowerCase();
      return matchDni || matchName;
    }
  );

  if (rankIdx === -1) {
    const newRankingPlayer = {
      id: 'p-' + (cleanDni.slice(-3) || Date.now()) + '-' + Date.now(),
      name: cleanNombre,
      dni: maskedDni,
      country: 'PER',
      puntosNum: 0,
      points: '0 pts',
      categoria: categoria || '4ta',
      titulos: 0,
      golpe: 'Drive cruzado',
      mano: 'Diestro',
      efectividad: '70%',
      image: '/assets/logo.png',
      avatar: '/assets/logo.png',
      perfilIncompleto: true
    };
    ranking.push(newRankingPlayer);
    saveRanking(ranking);
  } else {
    ranking[rankIdx].dni = maskedDni;
    if (!ranking[rankIdx].image) {
      ranking[rankIdx].image = '/assets/logo.png';
    }
    saveRanking(ranking);
  }

  return { success: true, user: registeredUser, tournament: updatedTournament };
}

export function findUserByDni(dni) {
  if (!dni) return null;
  const clean = dni.toString().trim().replace(/\s+/g, '');
  if (!clean) return null;
  const masked = maskDni(clean);
  const last3 = clean.length >= 3 ? clean.slice(-3) : clean;
  const users = getRegisteredUsers();
  return (
    users.find((u) => {
      const uDni = (u.dni || u.documentoIdentidad || '').toString().trim().replace(/\s+/g, '');
      if (!uDni) return false;
      return (
        uDni === clean ||
        uDni === masked ||
        (clean.length >= 3 && uDni.endsWith(last3))
      );
    }) || null
  );
}

// ----------------- MANUAL DRAW & GROUP STAGE METHODS -----------------

export function createDefaultGroups(tournament) {
  return [
    { id: 'grupo-a', nombre: 'Grupo A', participantes: [], partidos: [] },
    { id: 'grupo-b', nombre: 'Grupo B', participantes: [], partidos: [] },
    { id: 'grupo-c', nombre: 'Grupo C', participantes: [], partidos: [] },
    { id: 'grupo-d', nombre: 'Grupo D', participantes: [], partidos: [] }
  ];
}

export function generateGroupMatches(participantes, grupoId, grupoNombre, isGrupal = false) {
  if (!participantes || participantes.length < 2) return [];
  const matches = [];
  let matchIndex = 1;
  let fechaIndex = 1;

  for (let i = 0; i < participantes.length; i++) {
    for (let j = i + 1; j < participantes.length; j++) {
      const p1 = participantes[i];
      const p2 = participantes[j];

      // Detección robusta de modalidad grupal / por equipos
      const esModalidadGrupal = Boolean(
        isGrupal ||
        p1.esGrupal ||
        p2.esGrupal ||
        p1.nombreEquipo ||
        p2.nombreEquipo ||
        (p1.integrantes && p1.integrantes.length > 0) ||
        (p2.integrantes && p2.integrantes.length > 0)
      );

      if (esModalidadGrupal) {
        const team1Name = (p1.nombreEquipo || p1.nombre || `Equipo ${i + 1}`).trim();
        const team2Name = (p2.nombreEquipo || p2.nombre || `Equipo ${j + 1}`).trim();
        const serieTitulo = `${team1Name} vs ${team2Name}`;

        // En torneos grupales por cada fecha se juegan: 2 partidos de singles y 1 de dobles
        // 1. Partido Singles 1
        matches.push({
          id: `pg-${grupoId}-f${fechaIndex}-s1`,
          grupoId: grupoId,
          grupoNombre: grupoNombre,
          fechaNum: fechaIndex,
          matchNum: matchIndex++,
          round: `${grupoNombre} - Fecha ${fechaIndex} (Singles 1)`,
          serieNombre: serieTitulo,
          subtipo: 'Singles 1',
          modalidad: 'singles',
          esGrupal: true,
          team1: team1Name,
          team2: team2Name,
          player1: {
            name: `${team1Name} (Singles 1)`,
            teamName: team1Name,
            categoria: p1.categoria || '',
            subtipo: 'Singles 1'
          },
          player2: {
            name: `${team2Name} (Singles 1)`,
            teamName: team2Name,
            categoria: p2.categoria || '',
            subtipo: 'Singles 1'
          },
          score: '',
          winnerSlot: null,
          winnerName: null,
          nextMatchId: null,
          nextSlot: null
        });

        // 2. Partido Singles 2
        matches.push({
          id: `pg-${grupoId}-f${fechaIndex}-s2`,
          grupoId: grupoId,
          grupoNombre: grupoNombre,
          fechaNum: fechaIndex,
          matchNum: matchIndex++,
          round: `${grupoNombre} - Fecha ${fechaIndex} (Singles 2)`,
          serieNombre: serieTitulo,
          subtipo: 'Singles 2',
          modalidad: 'singles',
          esGrupal: true,
          team1: team1Name,
          team2: team2Name,
          player1: {
            name: `${team1Name} (Singles 2)`,
            teamName: team1Name,
            categoria: p1.categoria || '',
            subtipo: 'Singles 2'
          },
          player2: {
            name: `${team2Name} (Singles 2)`,
            teamName: team2Name,
            categoria: p2.categoria || '',
            subtipo: 'Singles 2'
          },
          score: '',
          winnerSlot: null,
          winnerName: null,
          nextMatchId: null,
          nextSlot: null
        });

        // 3. Partido de Dobles
        matches.push({
          id: `pg-${grupoId}-f${fechaIndex}-dobles`,
          grupoId: grupoId,
          grupoNombre: grupoNombre,
          fechaNum: fechaIndex,
          matchNum: matchIndex++,
          round: `${grupoNombre} - Fecha ${fechaIndex} (Dobles)`,
          serieNombre: serieTitulo,
          subtipo: 'Dobles',
          modalidad: 'dobles',
          esGrupal: true,
          team1: team1Name,
          team2: team2Name,
          player1: {
            name: `${team1Name} (Dobles)`,
            teamName: team1Name,
            categoria: p1.categoria || '',
            subtipo: 'Dobles'
          },
          player2: {
            name: `${team2Name} (Dobles)`,
            teamName: team2Name,
            categoria: p2.categoria || '',
            subtipo: 'Dobles'
          },
          score: '',
          winnerSlot: null,
          winnerName: null,
          nextMatchId: null,
          nextSlot: null
        });

        fechaIndex++;
      } else {
        // Modalidad individual estándar (1 partido por enfrentamiento)
        matches.push({
          id: `pg-${grupoId}-${matchIndex}`,
          grupoId: grupoId,
          grupoNombre: grupoNombre,
          round: `${grupoNombre} - Partido ${matchIndex}`,
          matchNum: matchIndex++,
          player1: { name: p1.nombre, categoria: p1.categoria || '' },
          player2: { name: p2.nombre, categoria: p2.categoria || '' },
          score: '',
          winnerSlot: null,
          winnerName: null,
          nextMatchId: null,
          nextSlot: null
        });
      }
    }
  }
  return matches;
}

export function generateKnockoutStructure(size = 4) {
  const sizeNum = Number(size) || 4;

  const ALL_ROUNDS_CONFIG = [
    { size: 64, matchesCount: 32, name: '32-avos de final', prefix: 'm-r32-', nextPrefix: 'm-r16-' },
    { size: 32, matchesCount: 16, name: 'Dieciseisavos de final', prefix: 'm-r16-', nextPrefix: 'm-of-' },
    { size: 16, matchesCount: 8,  name: 'Octavos de final', prefix: 'm-of-',  nextPrefix: 'm-qf-' },
    { size: 8,  matchesCount: 4,  name: 'Cuartos de final', prefix: 'm-qf-',  nextPrefix: 'm-sf-' },
    { size: 4,  matchesCount: 2,  name: 'Semifinales',      prefix: 'm-sf-',  nextPrefix: 'm-f-' },
    { size: 2,  matchesCount: 1,  name: 'Gran Final',       prefix: 'm-f-',   nextPrefix: null }
  ];

  let startIdx = ALL_ROUNDS_CONFIG.findIndex((r) => r.size === sizeNum);
  if (startIdx === -1) {
    if (sizeNum >= 64) startIdx = 0;
    else if (sizeNum >= 32) startIdx = 1;
    else if (sizeNum >= 16) startIdx = 2;
    else if (sizeNum >= 8) startIdx = 3;
    else startIdx = 4;
  }

  const roundsToGenerate = ALL_ROUNDS_CONFIG.slice(startIdx);
  let globalMatchNum = 1;

  return roundsToGenerate.map((cfg) => {
    const matches = [];
    for (let i = 0; i < cfg.matchesCount; i++) {
      matches.push({
        id: `${cfg.prefix}${i + 1}`,
        round: cfg.name,
        matchNum: globalMatchNum++,
        player1: null,
        player2: null,
        score: '',
        winnerSlot: null,
        winnerName: null,
        nextMatchId: cfg.nextPrefix ? `${cfg.nextPrefix}${Math.floor(i / 2) + 1}` : null,
        nextSlot: cfg.nextPrefix ? (i % 2) + 1 : null
      });
    }
    return {
      name: cfg.name,
      matches
    };
  });
}

export function saveManualFixture(tournamentId, { faseGrupos, rounds, bracket, size }) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1) return { error: 'Torneo no encontrado.' };

  if (faseGrupos !== undefined) {
    tournaments[index].faseGrupos = faseGrupos;
    if (!tournaments[index].bracket) {
      tournaments[index].bracket = {};
    }
    tournaments[index].bracket.faseGrupos = faseGrupos;
  }
  if (rounds !== undefined || bracket !== undefined || size !== undefined) {
    const determinedSize = size || bracket?.size || tournaments[index].bracket?.size || (rounds?.[0]?.matches?.length === 4 ? 8 : 4);
    tournaments[index].bracket = {
      ...(tournaments[index].bracket || {}),
      size: determinedSize,
      rounds: rounds || tournaments[index].bracket?.rounds || [],
      champion: bracket?.champion || tournaments[index].bracket?.champion || null
    };
    if (faseGrupos !== undefined) {
      tournaments[index].bracket.faseGrupos = faseGrupos;
    }
  }

  saveTournaments(tournaments);

  // Sincronizar fixtures con backend MySQL / SiteGround
  tournamentApi.update(tournamentId, {
    bracket: tournaments[index].bracket,
    faseGrupos: tournaments[index].faseGrupos,
    grupos: tournaments[index].faseGrupos
  }).catch((err) => {
    console.warn('[ATAP] Sincronización de fixture con servidor pendiente:', err);
  });

  return { success: true, torneo: tournaments[index] };
}

export function updateMatchScore(tournamentId, matchId, matchData) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1) return { error: 'Torneo no encontrado.' };

  const tournament = tournaments[index];
  let targetMatch = null;
  let allMatches = [];

  // Check in bracket knockout rounds
  const bracket = tournament.bracket;
  if (bracket && bracket.rounds) {
    bracket.rounds.forEach((r) => {
      if (r.matches) {
        allMatches.push(...r.matches);
        const found = r.matches.find((m) => m.id === matchId);
        if (found) targetMatch = found;
      }
    });
  }

  // Check in manual groups fixture if not found
  if (!targetMatch && tournament.faseGrupos) {
    tournament.faseGrupos.forEach((g) => {
      if (g.partidos) {
        allMatches.push(...g.partidos);
        const found = g.partidos.find((m) => m.id === matchId);
        if (found) targetMatch = found;
      }
    });
  }

  if (!targetMatch) {
    return { error: 'Partido no encontrado en el torneo.' };
  }

  // Update match details
  if (matchData.hora !== undefined) {
    targetMatch.hora = (matchData.hora || '').trim();
  }
  if (matchData.isLive !== undefined) {
    targetMatch.isLive = Boolean(matchData.isLive);
  }

  // If this is a live score update without concluding the match
  if (matchData.isLive && !matchData.isFinal && (matchData.winnerSlot === null || matchData.winnerSlot === undefined)) {
    targetMatch.score = matchData.score || '';
    saveTournaments(tournaments);
    return { success: true, match: targetMatch, isLive: true };
  }

  // Concluding the match
  targetMatch.isLive = false;
  const winnerSlot = Number(matchData.winnerSlot);
  const winnerPlayer = winnerSlot === 1 ? targetMatch.player1 : targetMatch.player2;
  let pointsAward = Number(matchData.pointsAward) || 0;

  targetMatch.score = matchData.score || '';
  targetMatch.winnerSlot = winnerSlot;
  targetMatch.winnerName = winnerPlayer?.name || '';

  // Advance winner if next match exists (knockout bracket)
  if (targetMatch.nextMatchId) {
    const nextMatch = allMatches.find((m) => m.id === targetMatch.nextMatchId);
    if (nextMatch) {
      if (targetMatch.nextSlot === 1) {
        nextMatch.player1 = { ...winnerPlayer };
      } else {
        nextMatch.player2 = { ...winnerPlayer };
      }
    }
  } else if (targetMatch.round && targetMatch.round.toLowerCase().includes('final') && !targetMatch.grupoId) {
    // This was the Gran Final!
    if (tournament.bracket) {
      tournament.bracket.champion = { ...winnerPlayer };
    }
    tournament.estado = 'finalizado';
    pointsAward = Math.max(pointsAward, 250); // Champion bonus
  }

  // Award points to winner and update live ranking
  if (winnerPlayer && winnerPlayer.name && !winnerPlayer.isBye && winnerPlayer.name.toUpperCase() !== 'BYE' && pointsAward > 0) {
    awardPointsToPlayer(winnerPlayer.name, pointsAward);
  }

  saveTournaments(tournaments);

  // Sincronizar marcador con backend MySQL / SiteGround
  tournamentApi.recordMatchScore(tournamentId, matchId, {
    score: matchData.score,
    winnerSlot,
    pointsAward
  }).catch((err) => {
    console.warn('[ATAP] Sincronización de marcador con servidor pendiente:', err);
  });

  return { success: true, match: targetMatch, champion: tournament.bracket?.champion };
}

export function updateMatchSchedule(tournamentId, matchId, hora) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1) return { error: 'Torneo no encontrado.' };

  const tournament = tournaments[index];
  let targetMatch = null;

  if (tournament.bracket && tournament.bracket.rounds) {
    tournament.bracket.rounds.forEach((r) => {
      if (r.matches) {
        const found = r.matches.find((m) => m.id === matchId);
        if (found) targetMatch = found;
      }
    });
  }
  if (!targetMatch && tournament.faseGrupos) {
    tournament.faseGrupos.forEach((g) => {
      if (g.partidos) {
        const found = g.partidos.find((m) => m.id === matchId);
        if (found) targetMatch = found;
      }
    });
  }

  if (!targetMatch) return { error: 'Partido no encontrado.' };
  targetMatch.hora = (hora || '').trim();
  saveTournaments(tournaments);
  return { success: true, match: targetMatch };
}

export function setMatchLiveStatus(tournamentId, matchId, isLive) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1) return { error: 'Torneo no encontrado.' };

  const tournament = tournaments[index];
  let targetMatch = null;

  if (tournament.bracket && tournament.bracket.rounds) {
    tournament.bracket.rounds.forEach((r) => {
      if (r.matches) {
        const found = r.matches.find((m) => m.id === matchId);
        if (found) targetMatch = found;
      }
    });
  }
  if (!targetMatch && tournament.faseGrupos) {
    tournament.faseGrupos.forEach((g) => {
      if (g.partidos) {
        const found = g.partidos.find((m) => m.id === matchId);
        if (found) targetMatch = found;
      }
    });
  }

  if (!targetMatch) return { error: 'Partido no encontrado.' };
  targetMatch.isLive = Boolean(isLive);
  saveTournaments(tournaments);
  return { success: true, match: targetMatch };
}

export function updateLiveMatchScore(tournamentId, matchId, { score = '', hora = undefined, isLive = true }) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1) return { error: 'Torneo no encontrado.' };

  const tournament = tournaments[index];
  let targetMatch = null;

  if (tournament.bracket && tournament.bracket.rounds) {
    tournament.bracket.rounds.forEach((r) => {
      if (r.matches) {
        const found = r.matches.find((m) => m.id === matchId);
        if (found) targetMatch = found;
      }
    });
  }
  if (!targetMatch && tournament.faseGrupos) {
    tournament.faseGrupos.forEach((g) => {
      if (g.partidos) {
        const found = g.partidos.find((m) => m.id === matchId);
        if (found) targetMatch = found;
      }
    });
  }

  if (!targetMatch) return { error: 'Partido no encontrado.' };
  targetMatch.score = score;
  targetMatch.isLive = Boolean(isLive);
  if (hora !== undefined) {
    targetMatch.hora = (hora || '').trim();
  }
  saveTournaments(tournaments);
  return { success: true, match: targetMatch };
}

export function recordMatchResult(tournamentId, matchId, winnerSlot, scoreString, pointsAward = 100, hora = undefined) {
  return updateMatchScore(tournamentId, matchId, {
    winnerSlot,
    score: scoreString,
    pointsAward,
    isLive: false,
    hora
  });
}

export function recordByeMatch(tournamentId, matchId, winnerSlot, pointsAward = 100) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1) return { error: 'Torneo no encontrado.' };

  const tournament = tournaments[index];
  const allMatches = [];
  let targetMatch = null;

  if (tournament.bracket && tournament.bracket.rounds) {
    tournament.bracket.rounds.forEach((r) => {
      if (r.matches) {
        allMatches.push(...r.matches);
        const found = r.matches.find((m) => m.id === matchId);
        if (found) targetMatch = found;
      }
    });
  }

  if (!targetMatch && tournament.faseGrupos) {
    tournament.faseGrupos.forEach((g) => {
      if (g.partidos) {
        allMatches.push(...g.partidos);
        const found = g.partidos.find((m) => m.id === matchId);
        if (found) targetMatch = found;
      }
    });
  }

  if (!targetMatch) {
    return { error: 'Partido no encontrado en el torneo.' };
  }

  const wSlot = Number(winnerSlot);
  const byeSlot = wSlot === 1 ? 2 : 1;
  const byeObj = {
    id: 'bye',
    name: 'BYE',
    nombre: 'BYE',
    categoria: 'Pase Libre',
    grupoNombre: 'Pase Libre',
    isBye: true
  };

  if (byeSlot === 1) targetMatch.player1 = byeObj;
  else targetMatch.player2 = byeObj;

  const winnerPlayer = wSlot === 1 ? targetMatch.player1 : targetMatch.player2;
  if (!winnerPlayer || winnerPlayer.isBye || winnerPlayer.name === 'BYE') {
    return { error: 'Se requiere un jugador válido para otorgarle la victoria por BYE.' };
  }

  targetMatch.isBye = true;
  targetMatch.score = 'BYE';
  targetMatch.winnerSlot = wSlot;
  targetMatch.winnerName = winnerPlayer.name;

  let points = Number(pointsAward) || 0;

  // Advance winner if next match exists (knockout bracket)
  if (targetMatch.nextMatchId) {
    const nextMatch = allMatches.find((m) => m.id === targetMatch.nextMatchId);
    if (nextMatch) {
      if (targetMatch.nextSlot === 1) {
        nextMatch.player1 = { ...winnerPlayer };
      } else {
        nextMatch.player2 = { ...winnerPlayer };
      }
    }
  } else if (targetMatch.round && targetMatch.round.toLowerCase().includes('final') && !targetMatch.grupoId) {
    // This was the Gran Final!
    if (tournament.bracket) {
      tournament.bracket.champion = { ...winnerPlayer };
    }
    tournament.estado = 'finalizado';
    points = Math.max(points, 250);
  }

  if (points > 0 && winnerPlayer.name) {
    awardPointsToPlayer(winnerPlayer.name, points);
  }

  saveTournaments(tournaments);
  return { success: true, match: targetMatch, champion: tournament.bracket?.champion };
}

// ----------------- RANKING METHODS -----------------

export function getRanking() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RANKING);
    let list = raw ? JSON.parse(raw) : INITIAL_RANKING;

    // RECONCILIACIÓN AUTOMÁTICA CON USUARIOS REGISTRADOS (TODO DEBE TENER RELACIÓN)
    const registeredUsers = getRegisteredUsers();
    const validDnis = new Set(registeredUsers.map(u => (u.dni || u.documentoIdentidad || '').toString().trim().replace(/\s+/g, '').toLowerCase()).filter(Boolean));
    const validEmails = new Set(registeredUsers.map(u => (u.email || '').toString().trim().toLowerCase()).filter(Boolean));
    const validNames = new Set(registeredUsers.map(u => (u.nombre || '').toString().trim().toLowerCase()).filter(Boolean));

    const initialNames = new Set(INITIAL_RANKING.map(i => (i.name || '').toLowerCase().trim()));
    const initialIds = new Set(INITIAL_RANKING.map(i => i.id));

    const origCount = list.length;
    // 1. Depurar jugadores huérfanos que NO son del seed oficial inicial y que fueron eliminados de usuarios registrados
    list = list.filter((p) => {
      if (initialIds.has(p.id) || initialNames.has((p.name || '').toLowerCase().trim())) {
        return true;
      }
      const pDni = (p.dni || '').toString().trim().replace(/\s+/g, '').toLowerCase();
      const pEmail = (p.email || '').toString().trim().toLowerCase();
      const pName = (p.name || '').toString().trim().toLowerCase();

      return (pDni && validDnis.has(pDni)) ||
             (pEmail && validEmails.has(pEmail)) ||
             (pName && validNames.has(pName));
    });

    // 2. Asegurar que los usuarios registrados válidos (no admin) existan y estén sincronizados en el ranking
    registeredUsers.forEach((u) => {
      const uDni = maskDni((u.dni || u.documentoIdentidad || '').toString().trim().replace(/\s+/g, ''));
      if (uDni === '00000000' || uDni === '*****000' || u.email?.toLowerCase() === 'vladimiryt18@gmail.com') return;

      const foundIdx = list.findIndex((p) => {
        const pDni = (p.dni || '').toString().trim().replace(/\s+/g, '');
        const pEmail = (p.email || '').toLowerCase().trim();
        const pName = (p.name || '').toLowerCase().trim();
        const matchDni = uDni && pDni && (uDni === pDni || pDni.endsWith(uDni.slice(-3)));
        return matchDni ||
               (u.email && pEmail && u.email.toLowerCase() === pEmail) ||
               (u.nombre && pName && u.nombre.toLowerCase().trim() === pName);
      });

      if (foundIdx !== -1) {
        list[foundIdx].name = u.nombre || list[foundIdx].name;
        list[foundIdx].categoria = u.categoria || list[foundIdx].categoria;
        list[foundIdx].dni = uDni || maskDni(list[foundIdx].dni);
        list[foundIdx].image = u.image || u.avatar || list[foundIdx].image || '/assets/logo.png';
        list[foundIdx].avatar = u.avatar || u.image || list[foundIdx].avatar || '/assets/logo.png';
        if (u.titulosGanados !== undefined || u.titulos !== undefined) {
          const tVal = Math.max(0, parseInt(u.titulosGanados !== undefined ? u.titulosGanados : u.titulos, 10) || 0);
          list[foundIdx].titulosGanados = tVal;
          list[foundIdx].titulos = tVal;
        }
      } else {
        const initTitulos = Math.max(0, parseInt(u.titulosGanados !== undefined ? u.titulosGanados : (u.titulos || 0), 10) || 0);
        list.push({
          id: 'p-' + (uDni.slice(-3) || Date.now()) + '-' + Date.now(),
          name: u.nombre || 'Jugador ATAP',
          dni: uDni,
          country: 'PER',
          puntosNum: 0,
          points: '0 pts',
          categoria: u.categoria || '4ta',
          titulos: initTitulos,
          titulosGanados: initTitulos,
          golpe: 'Drive cruzado',
          mejorGolpe: 'Drive cruzado',
          mano: 'Diestro',
          manoDominante: 'Diestro',
          efectividad: '70%',
          image: u.image || u.avatar || '/assets/logo.png',
          avatar: u.avatar || u.image || '/assets/logo.png',
          email: u.email || '',
          telefono: u.telefono || u.whatsapp || '',
          zonas: ['Lima Centro', 'Lima Sur'],
          disponibilidad: ['SAB', 'DOM'],
          perfilIncompleto: u.perfilIncompleto || false
        });
      }
    });

    if (list.length !== origCount) {
      try {
        localStorage.setItem(STORAGE_KEYS.RANKING, JSON.stringify(list));
      } catch (e) {}
    }

    const OFFICIAL_LIMA_ZONES = ['Lima Norte', 'Lima Centro', 'Lima Sur', 'Lima Este', 'Lima Oeste'];
    const ZONE_MAP = {
      // Lima Oeste
      'Miraflores': 'Lima Oeste',
      'San Isidro': 'Lima Oeste',
      'Magdalena': 'Lima Oeste',
      'San Miguel': 'Lima Oeste',
      'Pueblo Libre': 'Lima Oeste',
      'San Borja': 'Lima Oeste',
      'Lima Oeste': 'Lima Oeste',
      // Lima Centro
      'Cercado': 'Lima Centro',
      'Breña': 'Lima Centro',
      'Lince': 'Lima Centro',
      'Jesús María': 'Lima Centro',
      'Jesus Maria': 'Lima Centro',
      'La Victoria': 'Lima Centro',
      'Rímac': 'Lima Centro',
      'Rimac': 'Lima Centro',
      'Lima Centro': 'Lima Centro',
      // Lima Sur
      'Surco': 'Lima Sur',
      'Barranco': 'Lima Sur',
      'Chorrillos': 'Lima Sur',
      'SJM': 'Lima Sur',
      'VES': 'Lima Sur',
      'VMT': 'Lima Sur',
      'Lurín': 'Lima Sur',
      'Lurin': 'Lima Sur',
      'Lima Sur': 'Lima Sur',
      // Lima Este
      'La Molina': 'Lima Este',
      'Ate': 'Lima Este',
      'Santa Anita': 'Lima Este',
      'San Luis': 'Lima Este',
      'SJL': 'Lima Este',
      'Cieneguilla': 'Lima Este',
      'Lima Este': 'Lima Este',
      // Lima Norte
      'Los Olivos': 'Lima Norte',
      'SMP': 'Lima Norte',
      'Independencia': 'Lima Norte',
      'Comas': 'Lima Norte',
      'Carabayllo': 'Lima Norte',
      'Puente Piedra': 'Lima Norte',
      'Lima Norte': 'Lima Norte'
    };

    // Merge in default profile fields if missing from previous cache
    list = list.map((p) => {
      const initMatch = INITIAL_RANKING.find((init) => init.id === p.id || (init.name && p.name && init.name.toLowerCase() === p.name.toLowerCase()));
      const rawZonas = (p.zonas && p.zonas.length > 0) ? p.zonas : (initMatch?.zonas || ['Lima Centro', 'Lima Sur']);
      const normalizedZonas = Array.from(new Set(rawZonas.map((z) => ZONE_MAP[z] || (OFFICIAL_LIMA_ZONES.includes(z) ? z : 'Lima Centro'))));

      let cat = p.categoria || initMatch?.categoria || '4ta';
      const normCat = normalizeCategory(cat);
      if (normCat === '1ra') cat = '4ta';
      else if (normCat === '2da') cat = '5ta A';
      else if (normCat === '3ra') cat = '5ta B';

      return {
        ...(initMatch || {}),
        ...p,
        categoria: cat,
        dni: maskDni(p.dni || initMatch?.dni || ''),
        manoDominante: p.manoDominante || p.mano || initMatch?.manoDominante || 'Diestro',
        mejorGolpe: p.mejorGolpe || p.golpe || initMatch?.mejorGolpe || 'Drive cruzado',
        titulos: Math.max(0, parseInt(p.titulosGanados !== undefined ? p.titulosGanados : (p.titulos !== undefined ? p.titulos : (initMatch?.titulosGanados || 0)), 10) || 0),
        titulosGanados: Math.max(0, parseInt(p.titulosGanados !== undefined ? p.titulosGanados : (p.titulos !== undefined ? p.titulos : (initMatch?.titulosGanados || 0)), 10) || 0),
        zonas: normalizedZonas,
        disponibilidad: (p.disponibilidad && p.disponibilidad.length > 0) ? p.disponibilidad : (initMatch?.disponibilidad || ['SAB', 'DOM']),
        genero: p.genero || initMatch?.genero || 'Masculino',
        email: p.email || initMatch?.email || '',
        telefono: p.telefono || initMatch?.telefono || '',
        altura: p.altura || initMatch?.altura || '1.75 m',
        peso: p.peso || initMatch?.peso || '70 kg',
        club: p.club || initMatch?.club || 'Club de Tenis Lima',
        calibracionGolpes: p.calibracionGolpes || initMatch?.calibracionGolpes || { drive: 80, reves: 75, saque: 78, drop: 72, slice: 75 }
      };
    });

    list.sort((a, b) => (b.puntosNum || 0) - (a.puntosNum || 0));
    list = list.map((p, idx) => {
      const pos = String(idx + 1).padStart(2, '0');
      return {
        ...p,
        image: getAssetUrl(p.image || '/assets/logo.png'),
        avatar: getAssetUrl(p.avatar || p.image || '/assets/logo.png'),
        position: pos,
        points: (p.puntosNum || 0).toLocaleString() + ' pts'
      };
    });

    return list;
  } catch (e) {
    console.error('Error getting ranking:', e);
    return INITIAL_RANKING;
  }
}

export function saveRanking(rankingList) {
  try {
    rankingList.sort((a, b) => (b.puntosNum || 0) - (a.puntosNum || 0));
    const normalized = rankingList.map((p, idx) => ({
      ...p,
      position: String(idx + 1).padStart(2, '0'),
      points: (p.puntosNum || 0).toLocaleString() + ' pts'
    }));
    localStorage.setItem(STORAGE_KEYS.RANKING, JSON.stringify(normalized));
    emitAtapUpdate(STORAGE_KEYS.RANKING, normalized);
  } catch (e) {
    console.error('Error saving ranking:', e);
  }
}

export function getDoublesRanking() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOUBLES_RANKING);
    let list = raw ? JSON.parse(raw) : INITIAL_DOUBLES_RANKING;

    // Detect if old duo format is stored in localStorage (has player1 or name with '&')
    if (list && list.length > 0 && (list[0].player1 || (list[0].name && list[0].name.includes('&')))) {
      list = INITIAL_DOUBLES_RANKING;
      localStorage.setItem(STORAGE_KEYS.DOUBLES_RANKING, JSON.stringify(list));
    }

    // Merge in default fields if missing
    list = list.map((d) => {
      const initMatch = INITIAL_DOUBLES_RANKING.find(
        (init) => init.id === d.id || (init.name && d.name && init.name.toLowerCase() === d.name.toLowerCase())
      );

      let cat = d.categoria || initMatch?.categoria || '4ta';
      const normCat = normalizeCategory(cat);
      if (normCat === '1ra') cat = '4ta';
      else if (normCat === '2da') cat = '5ta A';
      else if (normCat === '3ra') cat = '5ta B';

      return {
        ...(initMatch || {}),
        ...d,
        categoria: cat,
        parejaReciente: d.parejaReciente || initMatch?.parejaReciente || 'Circuito Dobles',
        image: d.image || initMatch?.image || '/assets/logo.png'
      };
    });

    list.sort((a, b) => (b.puntosNum || 0) - (a.puntosNum || 0));
    list = list.map((d, idx) => ({
      ...d,
      image: getAssetUrl(d.image || '/assets/logo.png'),
      avatar: getAssetUrl(d.avatar || d.image || '/assets/logo.png'),
      position: String(idx + 1).padStart(2, '0'),
      points: (d.puntosNum || 0).toLocaleString() + ' pts'
    }));

    return list;
  } catch (e) {
    console.error('Error getting doubles ranking:', e);
    return INITIAL_DOUBLES_RANKING;
  }
}

export function saveDoublesRanking(doublesList) {
  try {
    doublesList.sort((a, b) => (b.puntosNum || 0) - (a.puntosNum || 0));
    const normalized = doublesList.map((d, idx) => ({
      ...d,
      position: String(idx + 1).padStart(2, '0'),
      points: (d.puntosNum || 0).toLocaleString() + ' pts'
    }));
    localStorage.setItem(STORAGE_KEYS.DOUBLES_RANKING, JSON.stringify(normalized));
    emitAtapUpdate(STORAGE_KEYS.DOUBLES_RANKING, normalized);
  } catch (e) {
    console.error('Error saving doubles ranking:', e);
  }
}

// ----------------- SEASONS & ANNUAL RANKING ROLLOVER -----------------

export function getActiveSeasonYear() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_SEASON);
    return stored ? String(stored) : '2026';
  } catch (e) {
    return '2026';
  }
}

export function setActiveSeasonYear(year) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SEASON, String(year));
    emitAtapUpdate(STORAGE_KEYS.ACTIVE_SEASON, String(year));
  } catch (e) {
    console.error('Error setting active season year:', e);
  }
}

export function getSeasonsArchive() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SEASONS_ARCHIVE);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    // Depurar datos de prueba anteriores al arranque oficial de este año si existiesen
    let changed = false;
    if (parsed['2025'] && parsed['2024']) {
      delete parsed['2025'];
      delete parsed['2024'];
      changed = true;
    }
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.SEASONS_ARCHIVE, JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    console.error('Error getting seasons archive:', e);
    return {};
  }
}

export function saveSeasonsArchive(archive) {
  try {
    localStorage.setItem(STORAGE_KEYS.SEASONS_ARCHIVE, JSON.stringify(archive));
    emitAtapUpdate(STORAGE_KEYS.SEASONS_ARCHIVE, archive);
  } catch (e) {
    console.error('Error saving seasons archive:', e);
  }
}

export function getAvailableSeasons() {
  const activeYear = getActiveSeasonYear();
  const archive = getSeasonsArchive();
  const archivedYears = Object.keys(archive)
    .filter((y) => String(y) !== String(activeYear))
    .sort((a, b) => Number(b) - Number(a));

  const list = [
    {
      year: activeYear,
      nombre: `Temporada ${activeYear}`,
      estado: 'activa',
      periodo: `1 de Enero - 31 de Diciembre ${activeYear}`,
      esActiva: true,
      esInaugural: archivedYears.length === 0
    },
    ...archivedYears.map((y) => ({
      year: String(y),
      nombre: archive[y]?.nombre || `Temporada ${y}`,
      estado: 'finalizada',
      periodo: archive[y]?.periodo || `1 de Enero - 31 de Diciembre ${y}`,
      fechaCierre: archive[y]?.fechaCierre || `31 de Diciembre, ${y}`,
      campeonSingles: archive[y]?.campeonSingles || 'Por definir',
      campeonDobles: archive[y]?.campeonDobles || 'Por definir',
      esActiva: false
    }))
  ];

  return list;
}

export function getSeasonRanking(year, modality = 'singles') {
  const activeYear = getActiveSeasonYear();
  if (!year || String(year) === String(activeYear)) {
    return modality === 'dobles' ? getDoublesRanking() : getRanking();
  }

  const archive = getSeasonsArchive();
  const seasonData = archive[String(year)];
  if (!seasonData) {
    return modality === 'dobles' ? getDoublesRanking() : getRanking();
  }

  const list = modality === 'dobles' ? (seasonData.dobles || []) : (seasonData.singles || []);
  return list;
}

export function closeAnnualSeason(yearToClose, nextYear) {
  try {
    const yrClose = String(yearToClose || getActiveSeasonYear());
    const yrNext = String(nextYear || (Number(yrClose) + 1));

    // 1. Get current active rankings to freeze
    const currentSingles = getRanking();
    const currentDoubles = getDoublesRanking();

    // Top champions
    const topSingles4ta = currentSingles.find((p) => normalizeCategory(p.categoria) === '4ta');
    const topDobles4ta = currentDoubles.find((d) => normalizeCategory(d.categoria) === '4ta');

    // 2. Save snapshot into SEASONS_ARCHIVE
    const archive = getSeasonsArchive();
    archive[yrClose] = {
      year: yrClose,
      nombre: `Temporada ${yrClose}`,
      estado: 'finalizada',
      periodo: `1 de Enero - 31 de Diciembre ${yrClose}`,
      fechaCierre: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      campeonSingles: topSingles4ta ? `${topSingles4ta.name} (4ta)` : 'Por definir',
      campeonDobles: topDobles4ta ? `${topDobles4ta.name} (4ta)` : 'Por definir',
      singles: JSON.parse(JSON.stringify(currentSingles)),
      dobles: JSON.parse(JSON.stringify(currentDoubles))
    };
    saveSeasonsArchive(archive);

    // 3. Reset points to 0 for all active players in the new season, preserving profile data
    const resetSingles = currentSingles.map((p, idx) => ({
      ...p,
      position: String(idx + 1).padStart(2, '0'),
      puntosNum: 0,
      points: '0 pts',
      partidosGanados: 0,
      partidosPerdidos: 0
    }));

    const resetDoubles = currentDoubles.map((d, idx) => ({
      ...d,
      position: String(idx + 1).padStart(2, '0'),
      puntosNum: 0,
      points: '0 pts',
      partidosGanados: 0,
      partidosPerdidos: 0
    }));

    // 4. Persist reset active rankings and updated active season
    localStorage.setItem(STORAGE_KEYS.RANKING, JSON.stringify(resetSingles));
    localStorage.setItem(STORAGE_KEYS.DOUBLES_RANKING, JSON.stringify(resetDoubles));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SEASON, yrNext);

    emitAtapUpdate(STORAGE_KEYS.RANKING, resetSingles);
    emitAtapUpdate(STORAGE_KEYS.DOUBLES_RANKING, resetDoubles);
    emitAtapUpdate(STORAGE_KEYS.ACTIVE_SEASON, yrNext);

    return {
      success: true,
      closedYear: yrClose,
      newSeason: yrNext,
      message: `La Temporada ${yrClose} ha sido cerrada y archivada con éxito. La nueva Temporada ${yrNext} ha iniciado con todos los jugadores en 0 puntos.`
    };
  } catch (e) {
    console.error('Error closing annual season:', e);
    return { success: false, error: e.message };
  }
}

export function autoCheckAnnualRollover() {
  try {
    const activeYear = Number(getActiveSeasonYear());
    const currentCalYear = new Date().getFullYear();
    if (currentCalYear > activeYear) {
      console.log(`Auto-rollover: Año calendario ${currentCalYear} superó temporada activa ${activeYear}. Cerrando temporada...`);
      closeAnnualSeason(activeYear, currentCalYear);
    }
  } catch (e) {
    console.error('Error in autoCheckAnnualRollover:', e);
  }
}

export function awardPointsToPlayer(playerName, pointsToAdd, modality = 'singles') {
  if (!playerName || playerName.trim().toUpperCase() === 'BYE') return null;
  const numPoints = Number(pointsToAdd) || 0;
  if (numPoints <= 0) return null;

  if (modality === 'dobles') {
    const doublesRank = getDoublesRanking();
    let dPlayer = doublesRank.find((p) => p.name.toLowerCase() === playerName.toLowerCase());
    if (dPlayer) {
      dPlayer.puntosNum = (dPlayer.puntosNum || 0) + Number(pointsToAdd);
      saveDoublesRanking(doublesRank);
      return dPlayer;
    }
  }

  const ranking = getRanking();
  let player = ranking.find((p) => p.name.toLowerCase() === playerName.toLowerCase());

  if (!player) {
    player = {
      id: 'p-' + Date.now(),
      name: playerName,
      country: 'PER',
      puntosNum: Number(pointsToAdd),
      points: Number(pointsToAdd).toLocaleString() + ' pts',
      categoria: '4ta',
      titulos: 1,
      golpe: 'Drive cruzado',
      mano: 'Diestro',
      efectividad: '75%',
      image: '/assets/logo.png'
    };
    ranking.push(player);
  } else {
    player.puntosNum = (player.puntosNum || 0) + Number(pointsToAdd);
    player.points = player.puntosNum.toLocaleString() + ' pts';
  }

  saveRanking(ranking);
  emitAtapUpdate(STORAGE_KEYS.RANKING, ranking);

  // Sincronizar también con la base de datos de usuarios registrados (Gestión de Jugadores)
  try {
    const rawUsers = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (rawUsers) {
      const users = JSON.parse(rawUsers);
      const u = users.find((u) => (u.nombre || u.name || '').trim().toLowerCase() === playerName.trim().toLowerCase());
      if (u) {
        u.puntosNum = player.puntosNum;
        u.points = (player.puntosNum || 0).toLocaleString() + ' pts';
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
        emitAtapUpdate(STORAGE_KEYS.REGISTERED_USERS, users);
      }
    }
  } catch (e) {}

  return player;
}

export function getPlayerBothProfiles(playerNameOrId) {
  if (!playerNameOrId) return { singles: null, dobles: null };
  const clean = String(playerNameOrId).trim().toLowerCase();

  const singlesList = getRanking();
  const doublesList = getDoublesRanking();

  const singles = singlesList.find(
    (p) => (p.name && p.name.toLowerCase() === clean) || (p.id && String(p.id).toLowerCase() === clean)
  ) || null;

  const dobles = doublesList.find(
    (d) => (d.name && d.name.toLowerCase() === clean) || (d.id && String(d.id).toLowerCase() === clean)
  ) || null;

  return { singles, dobles };
}

export function getPlayerMatchHistory(playerNameOrId) {
  if (!playerNameOrId) return [];
  const cleanName = String(playerNameOrId).trim().toLowerCase();

  // Find player info
  const ranking = getRanking();
  const doublesRank = getDoublesRanking();
  const player = ranking.find((p) => p.name.toLowerCase() === cleanName || p.id === cleanName) ||
                 doublesRank.find((d) => d.name.toLowerCase() === cleanName || d.id === cleanName) ||
                 { name: playerNameOrId, categoria: '4ta', parejaReciente: 'Mateo Rojas' };

  const cat = player.categoria || '4ta';
  const partner = player.parejaReciente || 'Mateo Rojas';

  // Curated match histories for key circuit players
  const curatedHistory = {
    'diego sánchez': [
      {
        id: 'm-ds-1',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '15 Mar 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Gran Final 🏆',
        pareja: 'Mateo Rojas',
        rivales: 'Carlos Benavides & Fernando Gálvez',
        marcador: '6-4, 7-5',
        resultado: 'victoria',
        puntosGanados: 250,
        detalle: 'Campeón Oficial Dobles 4ta'
      },
      {
        id: 'm-ds-2',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '14 Mar 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Semifinal',
        pareja: 'Mateo Rojas',
        rivales: 'Gonzalo Ugarte & Javier Prado',
        marcador: '7-6, 6-3',
        resultado: 'victoria',
        puntosGanados: 150,
        detalle: 'Pase a la Gran Final Dobles'
      },
      {
        id: 'm-ds-3',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '15 Mar 2026',
        categoria: '4ta',
        modalidad: 'singles',
        ronda: 'Gran Final 🏆',
        rivales: 'Luciana Pérez',
        marcador: '6-3, 4-6, 6-4',
        resultado: 'victoria',
        puntosGanados: 300,
        detalle: 'Campeón Oficial Singles 4ta'
      },
      {
        id: 'm-ds-4',
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '28 Feb 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Semifinal',
        pareja: 'Gonzalo Ugarte',
        rivales: 'Carlos Benavides & Mateo Rojas',
        marcador: '4-6, 6-7',
        resultado: 'derrota',
        puntosGanados: 90,
        detalle: 'Semifinalista Dobles (Dupla con Gonzalo Ugarte)'
      },
      {
        id: 'm-ds-5',
        torneo: 'Copa Verano ATAP',
        fecha: '12 Feb 2026',
        categoria: '4ta',
        modalidad: 'singles',
        ronda: 'Semifinal',
        rivales: 'Carlos Benavides',
        marcador: '6-2, 6-4',
        resultado: 'victoria',
        puntosGanados: 140,
        detalle: 'Victoria en Semifinal Singles'
      },
      {
        id: 'm-ds-6',
        torneo: 'Copa Verano ATAP',
        fecha: '08 Feb 2026',
        categoria: '4ta',
        modalidad: 'singles',
        ronda: 'Cuartos de final',
        rivales: 'Fernando Gálvez',
        marcador: '6-3, 6-2',
        resultado: 'victoria',
        puntosGanados: 90,
        detalle: 'Clasificación a Semifinales Singles'
      },
      {
        id: 'm-ds-7',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '11 Mar 2026',
        categoria: '4ta',
        modalidad: 'singles',
        ronda: 'Octavos de final',
        rivales: 'Rodrigo Alva',
        marcador: '6-4, 6-1',
        resultado: 'victoria',
        puntosGanados: 60,
        detalle: 'Victoria en Ronda de Octavos Singles'
      },
      {
        id: 'm-ds-8',
        torneo: 'Copa Verano ATAP',
        fecha: '06 Feb 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Cuartos de final',
        pareja: 'Mateo Rojas',
        rivales: 'Javier Prado & Gonzalo Ugarte',
        marcador: '6-3, 6-4',
        resultado: 'victoria',
        puntosGanados: 100,
        detalle: 'Pase a Semifinales Dobles'
      }
    ],
    'luciana pérez': [
      {
        id: 'm-lp-1',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '15 Mar 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Gran Final 🏆',
        pareja: 'Valeria Torres',
        rivales: 'Camila Mendoza & Andrea Flores',
        marcador: '6-3, 6-4',
        resultado: 'victoria',
        puntosGanados: 250,
        detalle: 'Campeona Oficial Dobles 4ta'
      },
      {
        id: 'm-lp-2',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '15 Mar 2026',
        categoria: '4ta',
        modalidad: 'singles',
        ronda: 'Gran Final 🥈',
        rivales: 'Diego Sánchez',
        marcador: '3-6, 6-4, 4-6',
        resultado: 'derrota',
        puntosGanados: 180,
        detalle: 'Finalista Oficial Singles 4ta'
      },
      {
        id: 'm-lp-3',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '14 Mar 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Semifinal',
        pareja: 'Valeria Torres',
        rivales: 'Daniela Vega & Sofía Paredes',
        marcador: '6-2, 6-1',
        resultado: 'victoria',
        puntosGanados: 150,
        detalle: 'Pase a la Gran Final Dobles'
      },
      {
        id: 'm-lp-4',
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '01 Mar 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Final 🏆',
        pareja: 'Andrea Flores',
        rivales: 'Valeria Torres & Camila Mendoza',
        marcador: '7-5, 6-3',
        resultado: 'victoria',
        puntosGanados: 220,
        detalle: 'Campeona con Andrea Flores en Dobles'
      },
      {
        id: 'm-lp-5',
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '27 Feb 2026',
        categoria: '4ta',
        modalidad: 'singles',
        ronda: 'Semifinal',
        rivales: 'Valeria Torres',
        marcador: '6-4, 6-2',
        resultado: 'victoria',
        puntosGanados: 150,
        detalle: 'Pase a la Final Singles'
      },
      {
        id: 'm-lp-6',
        torneo: 'Copa Verano ATAP',
        fecha: '12 Feb 2026',
        categoria: '4ta',
        modalidad: 'singles',
        ronda: 'Gran Final 🏆',
        rivales: 'Camila Mendoza',
        marcador: '6-3, 6-1',
        resultado: 'victoria',
        puntosGanados: 250,
        detalle: 'Campeona Oficial Singles 4ta'
      },
      {
        id: 'm-lp-7',
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '25 Feb 2026',
        categoria: '4ta',
        modalidad: 'singles',
        ronda: 'Cuartos de final',
        rivales: 'Andrea Flores',
        marcador: '6-2, 6-3',
        resultado: 'victoria',
        puntosGanados: 100,
        detalle: 'Pase a Semifinales Singles'
      },
      {
        id: 'm-lp-8',
        torneo: 'Copa Verano ATAP',
        fecha: '11 Feb 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Gran Final 🏆',
        pareja: 'Valeria Torres',
        rivales: 'Daniela Vega & Sofía Paredes',
        marcador: '6-4, 6-2',
        resultado: 'victoria',
        puntosGanados: 250,
        detalle: 'Campeona Oficial Dobles con Valeria Torres'
      },
      {
        id: 'm-lp-9',
        torneo: 'Copa Verano ATAP',
        fecha: '09 Feb 2026',
        categoria: '4ta',
        modalidad: 'singles',
        ronda: 'Semifinal',
        rivales: 'Daniela Vega',
        marcador: '6-3, 6-1',
        resultado: 'victoria',
        puntosGanados: 140,
        detalle: 'Victoria en Semifinales Singles'
      }
    ],
    'mateo rojas': [
      {
        id: 'm-mr-1',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '15 Mar 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Gran Final 🏆',
        pareja: 'Diego Sánchez',
        rivales: 'Carlos Benavides & Fernando Gálvez',
        marcador: '6-4, 7-5',
        resultado: 'victoria',
        puntosGanados: 250,
        detalle: 'Campeón Oficial Dobles 4ta'
      },
      {
        id: 'm-mr-2',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '14 Mar 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Semifinal',
        pareja: 'Diego Sánchez',
        rivales: 'Gonzalo Ugarte & Javier Prado',
        marcador: '7-6, 6-3',
        resultado: 'victoria',
        puntosGanados: 150,
        detalle: 'Victoria en Semifinal Dobles'
      },
      {
        id: 'm-mr-3',
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '28 Feb 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Gran Final 🏆',
        pareja: 'Carlos Benavides',
        rivales: 'Diego Sánchez & Gonzalo Ugarte',
        marcador: '6-4, 7-6',
        resultado: 'victoria',
        puntosGanados: 220,
        detalle: 'Campeón Dobles con Carlos Benavides'
      },
      {
        id: 'm-mr-4',
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '27 Feb 2026',
        categoria: '4ta',
        modalidad: 'singles',
        ronda: 'Cuartos de final',
        rivales: 'Fernando Gálvez',
        marcador: '6-4, 3-6, 10-7',
        resultado: 'victoria',
        puntosGanados: 90,
        detalle: 'Clasificación a Cuartos Singles'
      },
      {
        id: 'm-mr-5',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '13 Mar 2026',
        categoria: '5ta A',
        modalidad: 'singles',
        ronda: 'Semifinal',
        rivales: 'Rodrigo Alva',
        marcador: '6-4, 6-3',
        resultado: 'victoria',
        puntosGanados: 150,
        detalle: 'Semifinalista Singles'
      },
      {
        id: 'm-mr-6',
        torneo: 'Copa Verano ATAP',
        fecha: '15 Feb 2026',
        categoria: '5ta A',
        modalidad: 'singles',
        ronda: 'Gran Final 🏆',
        rivales: 'Joaquín Vargas',
        marcador: '7-5, 6-4',
        resultado: 'victoria',
        puntosGanados: 250,
        detalle: 'Campeón Oficial Singles 5ta A'
      },
      {
        id: 'm-mr-7',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '11 Mar 2026',
        categoria: '5ta A',
        modalidad: 'singles',
        ronda: 'Octavos de final',
        rivales: 'Carlos Benavides',
        marcador: '6-4, 5-7, 10-8',
        resultado: 'victoria',
        puntosGanados: 70,
        detalle: 'Victoria en Ronda de Octavos Singles'
      },
      {
        id: 'm-mr-8',
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '26 Feb 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Semifinal',
        pareja: 'Carlos Benavides',
        rivales: 'Rodrigo Alva & Joaquín Vargas',
        marcador: '6-3, 6-4',
        resultado: 'victoria',
        puntosGanados: 140,
        detalle: 'Victoria en Semifinal Dobles'
      }
    ],
    'valeria torres': [
      {
        id: 'm-vt-1',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '15 Mar 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Gran Final 🏆',
        pareja: 'Luciana Pérez',
        rivales: 'Camila Mendoza & Andrea Flores',
        marcador: '6-3, 6-4',
        resultado: 'victoria',
        puntosGanados: 250,
        detalle: 'Campeona Oficial Dobles 4ta'
      },
      {
        id: 'm-vt-2',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '14 Mar 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Semifinal',
        pareja: 'Luciana Pérez',
        rivales: 'Daniela Vega & Sofía Paredes',
        marcador: '6-2, 6-1',
        resultado: 'victoria',
        puntosGanados: 150,
        detalle: 'Pase a la Gran Final Dobles'
      },
      {
        id: 'm-vt-3',
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '01 Mar 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Final 🥈',
        pareja: 'Camila Mendoza',
        rivales: 'Luciana Pérez & Andrea Flores',
        marcador: '5-7, 3-6',
        resultado: 'derrota',
        puntosGanados: 160,
        detalle: 'Finalista con Camila Mendoza en Dobles'
      },
      {
        id: 'm-vt-4',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '15 Mar 2026',
        categoria: '5ta A',
        modalidad: 'singles',
        ronda: 'Gran Final 🏆',
        rivales: 'Camila Mendoza',
        marcador: '6-2, 6-3',
        resultado: 'victoria',
        puntosGanados: 300,
        detalle: 'Campeona Oficial Singles 5ta A'
      },
      {
        id: 'm-vt-5',
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '27 Feb 2026',
        categoria: '5ta A',
        modalidad: 'singles',
        ronda: 'Semifinal',
        rivales: 'Luciana Pérez',
        marcador: '4-6, 2-6',
        resultado: 'derrota',
        puntosGanados: 120,
        detalle: 'Semifinalista Singles'
      },
      {
        id: 'm-vt-6',
        torneo: 'Copa Verano ATAP',
        fecha: '14 Feb 2026',
        categoria: '5ta A',
        modalidad: 'singles',
        ronda: 'Gran Final 🥈',
        rivales: 'Luciana Pérez',
        marcador: '4-6, 3-6',
        resultado: 'derrota',
        puntosGanados: 180,
        detalle: 'Finalista Oficial Singles 5ta A'
      },
      {
        id: 'm-vt-7',
        torneo: 'Copa Verano ATAP',
        fecha: '10 Feb 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Semifinal',
        pareja: 'Luciana Pérez',
        rivales: 'Andrea Flores & Daniela Vega',
        marcador: '6-3, 6-4',
        resultado: 'victoria',
        puntosGanados: 150,
        detalle: 'Pase a la Gran Final Dobles con Luciana Pérez'
      }
    ],
    'carlos benavides': [
      {
        id: 'm-cb-1',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '15 Mar 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Gran Final 🥈',
        pareja: 'Fernando Gálvez',
        rivales: 'Diego Sánchez & Mateo Rojas',
        marcador: '4-6, 5-7',
        resultado: 'derrota',
        puntosGanados: 180,
        detalle: 'Finalista Oficial Dobles 4ta'
      },
      {
        id: 'm-cb-2',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '14 Mar 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Semifinal',
        pareja: 'Fernando Gálvez',
        rivales: 'Rodrigo Alva & Joaquín Vargas',
        marcador: '6-3, 6-4',
        resultado: 'victoria',
        puntosGanados: 150,
        detalle: 'Clasificación a la Final Dobles'
      },
      {
        id: 'm-cb-3',
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '28 Feb 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Gran Final 🏆',
        pareja: 'Mateo Rojas',
        rivales: 'Diego Sánchez & Gonzalo Ugarte',
        marcador: '6-4, 7-6',
        resultado: 'victoria',
        puntosGanados: 220,
        detalle: 'Campeón con Mateo Rojas en Dobles'
      },
      {
        id: 'm-cb-4',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '15 Mar 2026',
        categoria: '4ta',
        modalidad: 'singles',
        ronda: 'Semifinal',
        rivales: 'Diego Sánchez',
        marcador: '2-6, 4-6',
        resultado: 'derrota',
        puntosGanados: 140,
        detalle: 'Semifinalista Singles 4ta'
      },
      {
        id: 'm-cb-5',
        torneo: 'Copa Verano ATAP',
        fecha: '14 Feb 2026',
        categoria: '4ta',
        modalidad: 'singles',
        ronda: 'Gran Final 🏆',
        rivales: 'Fernando Gálvez',
        marcador: '6-4, 7-5',
        resultado: 'victoria',
        puntosGanados: 250,
        detalle: 'Campeón Oficial Singles 4ta'
      },
      {
        id: 'm-cb-6',
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '25 Feb 2026',
        categoria: '4ta',
        modalidad: 'singles',
        ronda: 'Semifinal',
        rivales: 'Diego Sánchez',
        marcador: '4-6, 5-7',
        resultado: 'derrota',
        puntosGanados: 90,
        detalle: 'Semifinalista Singles'
      },
      {
        id: 'm-cb-7',
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '24 Feb 2026',
        categoria: '4ta',
        modalidad: 'dobles',
        ronda: 'Semifinal',
        pareja: 'Fernando Gálvez',
        rivales: 'Javier Prado & Gonzalo Ugarte',
        marcador: '7-5, 6-3',
        resultado: 'victoria',
        puntosGanados: 140,
        detalle: 'Victoria en Semifinales Dobles'
      },
      {
        id: 'm-cb-8',
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '12 Mar 2026',
        categoria: '4ta',
        modalidad: 'singles',
        ronda: 'Cuartos de final',
        rivales: 'Mateo Rojas',
        marcador: '6-3, 6-4',
        resultado: 'victoria',
        puntosGanados: 110,
        detalle: 'Pase a Semifinales Singles'
      }
    ]
  };

  let baseMatches = [];
  for (const [key, matches] of Object.entries(curatedHistory)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      baseMatches = [...matches];
      break;
    }
  }

  // Si no tiene historial curado, generar partidos realistas en ambas modalidades
  if (baseMatches.length === 0) {
    const rivalsList = [
      'Carlos Benavides', 'Fernando Gálvez', 'Gonzalo Ugarte',
      'Javier Prado', 'Rodrigo Alva', 'Joaquín Vargas', 'Mateo Rojas'
    ].filter(r => r.toLowerCase() !== cleanName);

    const rival1 = rivalsList[0] || 'Carlos Benavides';
    const rival2 = rivalsList[1] || 'Fernando Gálvez';
    const rival3 = rivalsList[2] || 'Gonzalo Ugarte';
    const rival4 = rivalsList[3] || 'Javier Prado';

    baseMatches = [
      {
        id: `m-${cleanName.slice(0, 4)}-1`,
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '15 Mar 2026',
        categoria: cat,
        modalidad: 'dobles',
        ronda: 'Gran Final 🏆',
        pareja: partner,
        rivales: `${rival1} & ${rival2}`,
        marcador: '6-4, 6-3',
        resultado: 'victoria',
        puntosGanados: 220,
        detalle: `Podio Oficial Dobles ${cat}`
      },
      {
        id: `m-${cleanName.slice(0, 4)}-2`,
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '14 Mar 2026',
        categoria: cat,
        modalidad: 'dobles',
        ronda: 'Semifinal',
        pareja: partner,
        rivales: `${rival2} & ${rival3}`,
        marcador: '7-5, 6-4',
        resultado: 'victoria',
        puntosGanados: 140,
        detalle: 'Victoria en Semifinal Dobles'
      },
      {
        id: `m-${cleanName.slice(0, 4)}-3`,
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '28 Feb 2026',
        categoria: cat,
        modalidad: 'dobles',
        ronda: 'Gran Final 🥈',
        pareja: partner,
        rivales: `${rival3} & ${rival4}`,
        marcador: '4-6, 6-7',
        resultado: 'derrota',
        puntosGanados: 160,
        detalle: 'Finalista Oficial Dobles'
      },
      {
        id: `m-${cleanName.slice(0, 4)}-4`,
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '27 Feb 2026',
        categoria: cat,
        modalidad: 'dobles',
        ronda: 'Cuartos de final',
        pareja: partner,
        rivales: `${rival1} & ${rival4}`,
        marcador: '6-3, 6-4',
        resultado: 'victoria',
        puntosGanados: 90,
        detalle: 'Pase a Semifinales Dobles'
      },
      {
        id: `m-${cleanName.slice(0, 4)}-5`,
        torneo: 'Copa Verano ATAP',
        fecha: '10 Feb 2026',
        categoria: cat,
        modalidad: 'dobles',
        ronda: 'Cuartos de final',
        pareja: rival3,
        rivales: `${rival1} & ${rival2}`,
        marcador: '4-6, 5-7',
        resultado: 'derrota',
        puntosGanados: 60,
        detalle: `Cuartos de final Dobles`
      },
      {
        id: `m-${cleanName.slice(0, 4)}-6`,
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '15 Mar 2026',
        categoria: cat,
        modalidad: 'singles',
        ronda: 'Gran Final 🏆',
        rivales: rival1,
        marcador: '6-3, 6-4',
        resultado: 'victoria',
        puntosGanados: 250,
        detalle: `Campeón Oficial Singles ${cat}`
      },
      {
        id: `m-${cleanName.slice(0, 4)}-7`,
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '13 Mar 2026',
        categoria: cat,
        modalidad: 'singles',
        ronda: 'Semifinal',
        rivales: rival2,
        marcador: '6-4, 7-5',
        resultado: 'victoria',
        puntosGanados: 140,
        detalle: 'Victoria en Semifinal Singles'
      },
      {
        id: `m-${cleanName.slice(0, 4)}-8`,
        torneo: 'Copa Verano ATAP',
        fecha: '26 Feb 2026',
        categoria: cat,
        modalidad: 'singles',
        ronda: 'Fase Clasificatoria',
        rivales: rival3,
        marcador: '6-3, 4-6, 10-6',
        resultado: 'victoria',
        puntosGanados: 100,
        detalle: 'Victoria en Round Robin Singles'
      },
      {
        id: `m-${cleanName.slice(0, 4)}-9`,
        torneo: 'Torneo Apertura ATAP 2026',
        fecha: '12 Mar 2026',
        categoria: cat,
        modalidad: 'singles',
        ronda: 'Cuartos de final',
        rivales: rival4,
        marcador: '6-4, 7-5',
        resultado: 'victoria',
        puntosGanados: 120,
        detalle: 'Victoria en Cuartos Singles'
      },
      {
        id: `m-${cleanName.slice(0, 4)}-10`,
        torneo: 'Copa Primavera Lawn Tennis',
        fecha: '25 Feb 2026',
        categoria: cat,
        modalidad: 'singles',
        ronda: 'Semifinal',
        rivales: rival1,
        marcador: '4-6, 3-6',
        resultado: 'derrota',
        puntosGanados: 90,
        detalle: 'Semifinalista Singles'
      }
    ];
  }

  // Conexión dinámica en tiempo real con los resultados cargados en torneos
  try {
    const tournaments = getTournaments();
    const liveMatches = [];
    if (Array.isArray(tournaments)) {
      tournaments.forEach((t) => {
        if (Array.isArray(t.resultados)) {
          t.resultados.forEach((res, idx) => {
            const p1 = (res.jugador1 || '').toLowerCase().trim();
            const p2 = (res.jugador2 || '').toLowerCase().trim();
            const isP1 = p1.includes(cleanName) || cleanName.includes(p1);
            const isP2 = p2.includes(cleanName) || cleanName.includes(p2);

            if (isP1 || isP2) {
              const ganador = (res.ganador || '').toLowerCase().trim();
              const isWinner = (isP1 && (ganador.includes(p1) || ganador === 'jugador 1')) ||
                               (isP2 && (ganador.includes(p2) || ganador === 'jugador 2')) ||
                               (ganador.includes(cleanName));
              const pts = isP1
                ? (res.puntosJugador1 !== undefined ? res.puntosJugador1 : (isWinner ? (res.puntos || 0) : 0))
                : (res.puntosJugador2 !== undefined ? res.puntosJugador2 : (isWinner ? (res.puntos || 0) : 0));

              const rival = isP1 ? (res.jugador2 || 'Rival oficial') : (res.jugador1 || 'Rival oficial');
              const tMod = t.modalidad || (res.modalidad || 'singles');

              liveMatches.push({
                id: res.id || `live-m-${t.id}-${idx}`,
                torneo: t.title || 'Torneo Oficial ATAP',
                fecha: res.fechaCarga || 'Reciente',
                categoria: res.categoria || t.categoria || cat,
                modalidad: tMod === 'dobles' ? 'dobles' : 'singles',
                ronda: res.ronda || 'Fase Eliminatoria',
                pareja: tMod === 'dobles' ? partner : undefined,
                rivales: rival,
                marcador: res.score || [res.set1, res.set2, res.set3].filter(Boolean).join(', ') || 'Finalizado',
                resultado: isWinner ? 'victoria' : 'derrota',
                puntosGanados: Number(pts) || 0,
                detalle: res.observaciones || `${res.ronda || 'Partido'} en ${t.title || 'Torneo ATAP'}`
              });
            }
          });
        }
      });
    }

    if (liveMatches.length > 0) {
      const liveIds = new Set(liveMatches.map(m => m.id));
      const filteredBase = baseMatches.filter(m => !liveIds.has(m.id));
      return [...liveMatches, ...filteredBase];
    }
  } catch (err) {
    console.warn('Error sincronizando partidos dinámicos:', err);
  }

  return baseMatches;
}

export function getPlayerTournamentBreakdown(playerNameOrId, modality = 'singles', season = '2026') {
  if (!playerNameOrId) {
    return {
      season: season || '2026',
      totalPuntos: 0,
      totalTorneos: 0,
      titulos: 0,
      finales: 0,
      victorias: 0,
      derrotas: 0,
      torneos: []
    };
  }

  const cleanName = String(playerNameOrId).trim().toLowerCase();
  const allMatches = getPlayerMatchHistory(playerNameOrId);

  // Filtrar partidos por modalidad ('singles' o 'dobles')
  const modalityMatches = allMatches.filter((m) => {
    if (modality === 'dobles') return m.modalidad === 'dobles';
    return m.modalidad === 'singles';
  });

  // Filtrar por temporada (por defecto 2026)
  const targetSeason = String(season || '2026').trim();
  let seasonMatches = modalityMatches.filter((m) => {
    const fecha = String(m.fecha || '');
    const torneo = String(m.torneo || '');
    return fecha.includes(targetSeason) || torneo.includes(targetSeason);
  });

  // Si no se encontraron con la temporada exacta pero hay partidos de la modalidad, incluirlos
  if (seasonMatches.length === 0 && modalityMatches.length > 0) {
    seasonMatches = modalityMatches;
  }

  // Agrupar por torneo
  const tourneyMap = new Map();

  seasonMatches.forEach((m) => {
    const tName = (m.torneo || 'Torneo Oficial ATAP').trim();
    if (!tourneyMap.has(tName)) {
      tourneyMap.set(tName, []);
    }
    tourneyMap.get(tName).push(m);
  });

  const torneosBreakdown = [];
  let totalPuntosAcumulados = 0;
  let totalTitulos = 0;
  let totalFinales = 0;
  let victoriasAcumuladas = 0;
  let derrotasAcumuladas = 0;

  for (const [tName, matches] of tourneyMap.entries()) {
    // Calcular puntos sumados en este torneo
    const puntosTorneo = matches.reduce((acc, match) => acc + (Number(match.puntosGanados) || 0), 0);
    totalPuntosAcumulados += puntosTorneo;

    // Victorias y derrotas en este torneo
    const wins = matches.filter((match) => match.resultado === 'victoria').length;
    const losses = matches.filter((match) => match.resultado === 'derrota').length;
    victoriasAcumuladas += wins;
    derrotasAcumuladas += losses;

    // Determinar la etapa o ronda más avanzada
    let etapa = 'Fase Clasificatoria';
    let tipoEtapa = 'ronda';
    let badgeColor = '#64727A';

    const hasFinalMatch = matches.find((m) => {
      const r = (m.ronda || '').toLowerCase();
      return r.includes('final') && !r.includes('semi') && !r.includes('cuartos') && !r.includes('octavos');
    });

    if (hasFinalMatch) {
      const isWinner = hasFinalMatch.resultado === 'victoria' ||
                       hasFinalMatch.ronda?.includes('🏆') ||
                       hasFinalMatch.detalle?.toLowerCase().includes('campeón') ||
                       hasFinalMatch.detalle?.toLowerCase().includes('campeona');
      if (isWinner) {
        etapa = 'Campeón 🏆';
        tipoEtapa = 'campeon';
        badgeColor = '#FFD700';
        totalTitulos += 1;
      } else {
        etapa = 'Finalista 🥈';
        tipoEtapa = 'finalista';
        badgeColor = '#E0E0E0';
        totalFinales += 1;
      }
    } else if (matches.some((m) => (m.ronda || '').toLowerCase().includes('semi'))) {
      etapa = 'Semifinalista 🥉';
      tipoEtapa = 'semifinal';
      badgeColor = '#00CFA0';
    } else if (matches.some((m) => (m.ronda || '').toLowerCase().includes('cuarto'))) {
      etapa = 'Cuartos de final';
      tipoEtapa = 'cuartos';
      badgeColor = '#4DA8DA';
    } else if (matches.some((m) => (m.ronda || '').toLowerCase().includes('octavo'))) {
      etapa = 'Octavos de final';
      tipoEtapa = 'octavos';
      badgeColor = '#808B96';
    } else if (matches.some((m) => (m.ronda || '').toLowerCase().includes('dieciseis'))) {
      etapa = 'Dieciseisavos de final';
      tipoEtapa = 'dieciseisavos';
      badgeColor = '#808B96';
    } else if (matches.some((m) => (m.ronda || '').toLowerCase().includes('grupo') || (m.ronda || '').toLowerCase().includes('robin'))) {
      etapa = 'Fase de Grupos';
      tipoEtapa = 'grupos';
      badgeColor = '#808B96';
    } else {
      etapa = matches[0].ronda || 'Fase Eliminatoria';
      tipoEtapa = 'ronda';
    }

    const fecha = matches[0].fecha || `${targetSeason}`;
    const categoria = matches[0].categoria || '4ta';
    const pareja = matches.find((m) => m.pareja)?.pareja;

    torneosBreakdown.push({
      id: `tb-${tName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      nombre: tName,
      fecha: fecha,
      categoria: categoria,
      modalidad: modality,
      etapa: etapa,
      tipoEtapa: tipoEtapa,
      badgeColor: badgeColor,
      puntosGanados: puntosTorneo,
      victorias: wins,
      derrotas: losses,
      record: `${wins}V - ${losses}D`,
      pareja: pareja,
      partidos: matches
    });
  }

  // Ordenar torneos: campeonatos primero, luego por puntos ganados descendente
  torneosBreakdown.sort((a, b) => {
    if (a.tipoEtapa === 'campeon' && b.tipoEtapa !== 'campeon') return -1;
    if (b.tipoEtapa === 'campeon' && a.tipoEtapa !== 'campeon') return 1;
    return b.puntosGanados - a.puntosGanados;
  });

  return {
    season: targetSeason,
    totalPuntos: totalPuntosAcumulados,
    totalTorneos: torneosBreakdown.length,
    titulos: totalTitulos,
    finales: totalFinales,
    victorias: victoriasAcumuladas,
    derrotas: derrotasAcumuladas,
    torneos: torneosBreakdown
  };
}


export function updatePlayerAvatar(playerNameOrId, newAvatarUrl) {
  const ranking = getRanking();
  const searchClean = (playerNameOrId || '').toString().trim();
  const searchMasked = maskDni(searchClean);
  const player = ranking.find(
    (p) =>
      p.id === searchClean ||
      (p.dni && (p.dni.toString().trim() === searchClean || p.dni.toString().trim() === searchMasked || (searchClean.length >= 3 && p.dni.endsWith(searchClean.slice(-3))))) ||
      p.name.toLowerCase() === searchClean.toLowerCase()
  );

  if (player) {
    player.image = newAvatarUrl;
    player.avatar = newAvatarUrl;
    saveRanking(ranking);
    emitAtapUpdate(STORAGE_KEYS.RANKING, ranking);

    // Sincronizar también con Usuarios Registrados (TODO DEBE TENER RELACIÓN)
    try {
      const users = getRegisteredUsers();
      let usersChanged = false;
      const targetName = player.name.toLowerCase().trim();
      const targetDni = (player.dni || '').toString().trim().replace(/\s+/g, '');

      users.forEach((u) => {
        const uName = (u.nombre || '').toLowerCase().trim();
        const uDni = (u.dni || u.documentoIdentidad || '').toString().trim().replace(/\s+/g, '');
        const matchDni = targetDni && uDni && (uDni === targetDni || (targetDni.length >= 3 && uDni.endsWith(targetDni.slice(-3))));
        if (matchDni || (targetName && uName === targetName)) {
          u.avatar = newAvatarUrl;
          u.image = newAvatarUrl;
          usersChanged = true;
        }
      });

      if (usersChanged) {
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));
        emitAtapUpdate(STORAGE_KEYS.REGISTERED_USERS, users);
      }
    } catch (e) {
      console.error('Error syncing avatar to registered users:', e);
    }

    // Sincronizar con inscripciones de torneos
    try {
      const tournaments = getTournaments();
      let tourneysChanged = false;
      const targetName = player.name.toLowerCase().trim();
      const targetDni = (player.dni || '').toString().trim().replace(/\s+/g, '');

      tournaments.forEach((t) => {
        if (t.inscripciones && t.inscripciones.length > 0) {
          t.inscripciones.forEach((insc) => {
            const iName = (insc.nombre || insc.name || '').toLowerCase().trim();
            const iDni = (insc.dni || insc.documentoIdentidad || '').toString().trim().replace(/\s+/g, '');
            const matchDni = targetDni && iDni && (iDni === targetDni || (targetDni.length >= 3 && iDni.endsWith(targetDni.slice(-3))));
            if (matchDni || (targetName && iName === targetName)) {
              insc.avatar = newAvatarUrl;
              insc.image = newAvatarUrl;
              tourneysChanged = true;
            }
          });
        }
      });

      if (tourneysChanged) {
        saveTournaments(tournaments);
        emitAtapUpdate(STORAGE_KEYS.TOURNEYS, tournaments);
      }
    } catch (e) {
      console.error('Error syncing avatar to tournaments:', e);
    }

    // Also sync with active user session if matching
    try {
      const activeUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
      if (activeUser && activeUser.nombre && activeUser.nombre.toLowerCase() === player.name.toLowerCase()) {
        activeUser.avatar = newAvatarUrl;
        activeUser.image = newAvatarUrl;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(activeUser));
        emitAtapUpdate(STORAGE_KEYS.USER, activeUser);
      }
    } catch (e) {}

    return true;
  }
  return false;
}

// ----------------- SITE IMAGES METHODS -----------------

export function getSiteImages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.IMAGES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(INITIAL_SITE_IMAGES));
      return INITIAL_SITE_IMAGES;
    }
    const parsed = JSON.parse(raw);
    let changed = false;
    if (!parsed.heroSlides || !Array.isArray(parsed.heroSlides) || parsed.heroSlides.length === 0) {
      parsed.heroSlides = [...INITIAL_HERO_SLIDES];
      if (parsed.heroBanner && !parsed.heroBanner.includes('hero1.png')) {
        parsed.heroSlides[0] = { ...parsed.heroSlides[0], image: parsed.heroBanner };
      }
      changed = true;
    }
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(parsed));
    }
    const combined = { ...INITIAL_SITE_IMAGES, ...parsed };
    return {
      ...combined,
      heroBanner: getAssetUrl(combined.heroBanner || '/assets/hero1.png'),
      eventoBanner: getAssetUrl(combined.eventoBanner || '/assets/Evento.png'),
      logoPlatino: getAssetUrl(combined.logoPlatino || '/assets/Logo Platino.png'),
      logoAtap: getAssetUrl(combined.logoAtap || '/assets/logo.png'),
      heroSlides: (combined.heroSlides || []).map((s) => ({
        ...s,
        image: getAssetUrl(s.image || '/assets/hero1.png')
      }))
    };
  } catch (e) {
    console.error('Error getting site images:', e);
    return INITIAL_SITE_IMAGES;
  }
}

export function saveHeroSlides(slides) {
  try {
    const current = getSiteImages();
    current.heroSlides = slides;
    if (slides.length > 0 && slides[0].image) {
      current.heroBanner = slides[0].image;
    }
    localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(current));
    emitAtapUpdate(STORAGE_KEYS.IMAGES, current);

    // Sincronizar con backend MySQL / SiteGround
    contentApi.saveSetting('atap_site_images', current).catch((err) => {
      console.warn('[ATAP] Sincronización de hero slides con servidor pendiente:', err);
    });

    return true;
  } catch (e) {
    console.error('Error saving hero slides:', e);
    return false;
  }
}

export function saveSiteImage(imageKey, newUrl) {
  try {
    const current = getSiteImages();
    current[imageKey] = newUrl;
    if (imageKey === 'heroBanner' && current.heroSlides && current.heroSlides.length > 0) {
      current.heroSlides[0] = { ...current.heroSlides[0], image: newUrl };
    }
    if (imageKey === 'eventoBanner') {
      try {
        const rawBanners = localStorage.getItem(STORAGE_KEYS.HOME_BANNERS);
        const parsedBanners = rawBanners ? JSON.parse(rawBanners) : {};
        parsedBanners.signupBanner = { ...(parsedBanners.signupBanner || {}), image: newUrl };
        localStorage.setItem(STORAGE_KEYS.HOME_BANNERS, JSON.stringify(parsedBanners));
        emitAtapUpdate(STORAGE_KEYS.HOME_BANNERS, parsedBanners);
        contentApi.saveSetting('atap_home_banners', parsedBanners).catch(() => {});
      } catch (err) {
        console.warn('Error syncing signupBanner image:', err);
      }
    }
    localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(current));
    emitAtapUpdate(STORAGE_KEYS.IMAGES, current);

    // Sincronizar con backend MySQL / SiteGround
    contentApi.saveSetting('atap_site_images', current).catch((err) => {
      console.warn('[ATAP] Sincronización de imagen de sitio con servidor pendiente:', err);
    });

    return true;
  } catch (e) {
    console.error('Error saving site image:', e);
    return false;
  }
}

// ----------------- HOME BANNERS METHODS -----------------

export function getHomeBanners() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOME_BANNERS);
    let parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== 'object') {
      parsed = {};
    }
    const siteImgs = getSiteImages();
    const defaultEventImg = siteImgs?.eventoBanner || getAssetUrl('/assets/Evento.png');

    return {
      signupBanner: {
        ...INITIAL_HOME_BANNERS.signupBanner,
        image: defaultEventImg,
        ...(parsed.signupBanner || {})
      },
      socialBanner: {
        ...INITIAL_HOME_BANNERS.socialBanner,
        ...(parsed.socialBanner || {})
      },
      faqSection: {
        ...INITIAL_HOME_BANNERS.faqSection,
        ...(parsed.faqSection || {})
      }
    };
  } catch (e) {
    console.error('Error getting home banners:', e);
    return INITIAL_HOME_BANNERS;
  }
}

export function saveHomeBanners(banners) {
  try {
    const current = getHomeBanners();
    const updated = {
      ...current,
      ...banners,
      signupBanner: {
        ...current.signupBanner,
        ...(banners?.signupBanner || {})
      },
      socialBanner: {
        ...current.socialBanner,
        ...(banners?.socialBanner || {})
      },
      faqSection: {
        ...current.faqSection,
        ...(banners?.faqSection || {})
      }
    };
    localStorage.setItem(STORAGE_KEYS.HOME_BANNERS, JSON.stringify(updated));
    if (updated.signupBanner?.image) {
      const siteImgs = getSiteImages();
      siteImgs.eventoBanner = updated.signupBanner.image;
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(siteImgs));
      emitAtapUpdate(STORAGE_KEYS.IMAGES, siteImgs);
      contentApi.saveSetting('atap_site_images', siteImgs).catch(() => {});
    }
    emitAtapUpdate(STORAGE_KEYS.HOME_BANNERS, updated);

    // Sincronizar con backend MySQL / SiteGround
    contentApi.saveSetting('atap_home_banners', updated).catch((err) => {
      console.warn('[ATAP] Sincronización de banners de home con servidor pendiente:', err);
    });

    return true;
  } catch (e) {
    console.error('Error saving home banners:', e);
    return false;
  }
}

// ----------------- SPONSORS METHODS -----------------

export function getSponsors() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SPONSORS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(INITIAL_SPONSORS));
      return INITIAL_SPONSORS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(INITIAL_SPONSORS));
      return INITIAL_SPONSORS;
    }
    return parsed;
  } catch (e) {
    console.error('Error getting sponsors:', e);
    return INITIAL_SPONSORS;
  }
}

export function saveSponsors(sponsors) {
  try {
    localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(sponsors));
    emitAtapUpdate(STORAGE_KEYS.SPONSORS, sponsors);
    return true;
  } catch (e) {
    console.error('Error saving sponsors:', e);
    return false;
  }
}

export function addSponsor(logo = '', name = '') {
  try {
    const current = getSponsors();
    const newSponsor = {
      id: `sponsor-${Date.now()}`,
      name: name || `Auspiciador ${current.length + 1}`,
      logo: logo || ''
    };
    const updated = [...current, newSponsor];
    saveSponsors(updated);
    return updated;
  } catch (e) {
    console.error('Error adding sponsor:', e);
    return getSponsors();
  }
}

export function updateSponsor(id, newLogo, newName) {
  try {
    const current = getSponsors();
    const updated = current.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          logo: newLogo !== undefined ? newLogo : s.logo,
          name: newName !== undefined ? newName : s.name
        };
      }
      return s;
    });
    saveSponsors(updated);
    return updated;
  } catch (e) {
    console.error('Error updating sponsor:', e);
    return getSponsors();
  }
}

export function deleteSponsor(id) {
  try {
    const current = getSponsors();
    const updated = current.filter((s) => s.id !== id);
    saveSponsors(updated);
    return updated;
  } catch (e) {
    console.error('Error deleting sponsor:', e);
    return getSponsors();
  }
}

// ----------------- COMUNIDAD & NOTICIAS METHODS -----------------

export const INITIAL_NEWS = [
  {
    id: 'news-1',
    tipo: 'imagen', // 'imagen' | 'texto'
    tieneImagen: true,
    titulo: 'Gran Apertura de Temporada 2026: Circuito Nacional Amateur ATAP',
    categoria: 'Torneos',
    fecha: '15 de Marzo, 2026',
    resumen: 'Más de 120 tenistas de Lima y regiones competirán en el Club Lawn Tennis de la Exposición en la fecha inaugural del año.',
    contenido: 'La Asociación de Tenistas Amateur del Perú (ATAP) anuncia con entusiasmo el inicio oficial de la temporada 2026. Con el firme compromiso de impulsar la competitividad y la camaradería del tenis nacional, este año el circuito contará con 4 grandes paradas en las categorías oficiales: 4ta, 5ta A, 5ta B y 6ta, tanto en modalidad Singles como Dobles.\n\nLas inscripciones ya se encuentran disponibles desde la plataforma web con cupos limitados por categoría para garantizar cuadros equilibrados y programación fluida.\n\n"Queremos que cada fin de semana sea una fiesta deportiva para toda la familia tenística", señaló la directiva de ATAP.',
    imagen: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=85',
    autor: 'Prensa ATAP',
    destacada: true,
    createdAt: '2026-03-15T10:00:00.000Z'
  },
  {
    id: 'news-2',
    tipo: 'texto',
    tieneImagen: false,
    titulo: 'Comunicado Oficial: Actualización del Baremo de Puntajes y Ascenso de Categorías',
    categoria: 'Comunicado',
    fecha: '12 de Marzo, 2026',
    resumen: 'La Comisión Técnica informa sobre los nuevos criterios de asignación de puntos en ranking y el sistema de promoción deportiva.',
    contenido: 'A toda la comunidad tenística de ATAP:\n\nPor medio del presente comunicado, la Comisión Técnica y Directiva de ATAP hace de conocimiento público las nuevas normas de puntuación válidas para el Ranking Oficial 2026:\n\n1. ASIGNACIÓN DE PUNTOS: Los campeones de cada torneo sumarán 500 puntos para el ranking oficial de su modalidad (Singles o Dobles), mientras que los finalistas obtendrán 300 puntos.\n2. ASCENSO DE CATEGORÍA: Aquellos jugadores que alcancen dos títulos oficiales consecutivos en su categoría serán evaluados para el ascenso automático a la categoría inmediata superior.\n3. DNI Y AFILIACIÓN: Es obligatorio que todo participante cuente con su registro previo en la plataforma para validar su identidad en los cuadros.\n\nAgradecemos su constante respaldo y compromiso con el juego limpio y los valores del tenis.',
    imagen: '',
    autor: 'Comisión Técnica ATAP',
    destacada: false,
    createdAt: '2026-03-12T14:30:00.000Z'
  },
  {
    id: 'news-3',
    tipo: 'imagen',
    tieneImagen: true,
    titulo: 'Estrategias de Saque y Volea: Claves para Dominar en la Modalidad de Dobles',
    categoria: 'Tips',
    fecha: '08 de Marzo, 2026',
    resumen: 'Descubre cómo coordinar los desplazamientos en la red y optimizar el primer servicio para definir puntos rápidos con tu compañero.',
    contenido: 'En la modalidad de dobles, el dominio de la red es el factor determinante. Los entrenadores del circuito ATAP comparten tres claves fundamentales:\n\n1. COLOCACIÓN ANTES QUE POTENCIA: Un primer saque con efecto hacia la ' + "T" + ' o abierto al revés permite que tu compañero anticipe la devolución en la red.\n2. COMUNICACIÓN PREVIA AL PUNTO: Señala con la mano o conversa brevemente si jugarás cruzado o buscarás la paralela.\n3. POSICIÓN DE ESPERA ACTIVA: En la red, mantén el marco de la raqueta a la altura de los ojos y da un paso adelante al momento del impacto del rival.',
    imagen: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=85',
    autor: 'Staff Técnico ATAP',
    destacada: false,
    createdAt: '2026-03-08T09:15:00.000Z'
  },
  {
    id: 'news-4',
    tipo: 'texto',
    tieneImagen: false,
    titulo: 'Convenio Deportivo: Nuevas Franjas Horarias de Práctica en Lima Sur y Lima Centro',
    categoria: 'Comunidad',
    fecha: '01 de Marzo, 2026',
    resumen: 'Convenio con clubes aliados permitirá a miembros registrados acceder a canchas de arcilla los fines de semana con tarifa preferencial.',
    contenido: 'Nos complace anunciar que, gracias a las coordinaciones de la Dirección de Comunidad de ATAP, a partir de este mes los jugadores registrados podrán acceder a canchas de arcilla en horarios preferenciales los días sábados y domingos por la tarde.\n\nPara validar el beneficio en los clubes asociados (Surco, Miraflores y Jesús María), solo deberás mostrar tu perfil de jugador activo desde la app web de ATAP.\n\n¡Sigamos jugando y haciendo crecer el tenis amateur en todo el país!',
    imagen: '',
    autor: 'Dirección de Comunidad',
    destacada: false,
    createdAt: '2026-03-01T12:00:00.000Z'
  }
];

export function getNews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NEWS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(INITIAL_NEWS));
      return INITIAL_NEWS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(INITIAL_NEWS));
      return INITIAL_NEWS;
    }
    return parsed;
  } catch (e) {
    console.error('Error getting news from storage:', e);
    return INITIAL_NEWS;
  }
}

export function saveNews(newsList) {
  try {
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(newsList));
    emitAtapUpdate(STORAGE_KEYS.NEWS, newsList);
  } catch (e) {
    console.error('Error saving news to storage:', e);
  }
}

export function createNews(data) {
  try {
    const current = getNews();
    const hasImg = data.tipo === 'imagen' && Boolean(data.imagen && data.imagen.trim());
    const newPost = {
      id: `news-${Date.now()}`,
      tipo: data.tipo || (hasImg ? 'imagen' : 'texto'),
      tieneImagen: hasImg,
      titulo: data.titulo?.trim() || 'Nueva Noticia ATAP',
      categoria: data.categoria || 'Comunidad',
      fecha: data.fecha || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      resumen: data.resumen?.trim() || '',
      contenido: data.contenido?.trim() || '',
      imagen: hasImg ? data.imagen.trim() : '',
      autor: data.autor?.trim() || 'Prensa ATAP',
      destacada: Boolean(data.destacada),
      createdAt: new Date().toISOString()
    };
    
    // Si se marca como destacada, las demás dejan de serlo para mantener 1 destacada principal
    let updated = [newPost, ...current];
    if (newPost.destacada) {
      updated = updated.map((item) => (item.id === newPost.id ? item : { ...item, destacada: false }));
    }
    saveNews(updated);
    return newPost;
  } catch (e) {
    console.error('Error creating news post:', e);
    return null;
  }
}

export function updateNews(id, data) {
  try {
    const current = getNews();
    const hasImg = data.tipo === 'imagen' && Boolean(data.imagen && data.imagen.trim());
    let updated = current.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...data,
          tipo: data.tipo || (hasImg ? 'imagen' : 'texto'),
          tieneImagen: hasImg,
          imagen: hasImg ? data.imagen.trim() : '',
          destacada: Boolean(data.destacada)
        };
      }
      return item;
    });

    if (data.destacada) {
      updated = updated.map((item) => (item.id === id ? item : { ...item, destacada: false }));
    }
    saveNews(updated);
    return updated.find((n) => n.id === id);
  } catch (e) {
    console.error('Error updating news post:', e);
    return null;
  }
}

export function deleteNews(id) {
  try {
    const current = getNews();
    const updated = current.filter((item) => item.id !== id);
    saveNews(updated);
    return updated;
  } catch (e) {
    console.error('Error deleting news post:', e);
    return getNews();
  }
}

export function toggleFeatureNews(id) {
  try {
    const current = getNews();
    const target = current.find((n) => n.id === id);
    if (!target) return current;
    const willBeFeatured = !target.destacada;

    const updated = current.map((item) => {
      if (item.id === id) {
        return { ...item, destacada: willBeFeatured };
      }
      // Solo una noticia destacada a la vez
      if (willBeFeatured && item.destacada) {
        return { ...item, destacada: false };
      }
      return item;
    });

    saveNews(updated);
    return updated;
  } catch (e) {
    console.error('Error toggling feature news:', e);
    return getNews();
  }
}

// ----------------- POLÍTICAS & REGLAS OFICIALES ATAP -----------------

export const DEFAULT_POLICIES_AND_RULES = [
  {
    id: 'uso-imagen',
    num: 1,
    title: '1. Uso de Imagen',
    summary: 'Autorización voluntaria para difusión deportiva sin fines comerciales directos.',
    content: `ATAP – Asociación de Tenistas Amateur del Perú podrá tomar y utilizar fotografías y/o videos durante el desarrollo del torneo, en los que pueda aparecer mi imagen, con fines promocionales y de difusión deportiva, en redes sociales, página web y material audiovisual del evento, sin fines comerciales directos.

Esta autorización es voluntaria y no condiciona la participación en el torneo. Este consentimiento se adjunta en el formulario de inscripción.`
  },
  {
    id: 'categorizacion',
    num: 2,
    title: '2. Categorización de Jugador',
    summary: 'Declaración de buena fe, filtros ATAP, ascensos, 5ta Principiante y regla de múltiples categorías.',
    content: `Declaración de Categoría
Cada jugador deberá inscribirse indicando su nivel dentro de las siguientes categorías:
5ta P – 5ta B – 5ta A – 4ta – 3ra
 
ATAP asumirá de buena fe la categoría declarada por el jugador. Nuestro objetivo es mantener:
• Competitividad real
• Equilibrio deportivo
• Juego justo
• Buen ambiente entre participantes

Queremos que todos compitan en categorías acordes a su nivel y disfruten la esencia del torneo.

Nuevos Filtros ATAP
Para garantizar equilibrio competitivo, la organización podrá:
• Revisar antecedentes en otros torneos (los jugadores que fueron aprobados por nuestro filtro, se colocará en su perfil como perfil con categoría verificada).
• Evaluar desempeño en ediciones anteriores de ATAP (historial interno).
• Aplicar recategorización según rendimiento comprobado.
• Asistir a partidos desde fase de grupos si existen observaciones formales.

Subir de categoría
El jugador puede inscribirse en:
• Su categoría correspondiente
• Una categoría superior (si desea probar su nivel)
Esto fomenta el crecimiento deportivo.

No está permitido bajar de categoría
No se permitirá la inscripción en una categoría inferior al nivel real del jugador.
En caso de detectarse:
• La organización podrá recategorizar al jugador.
• No se realizará devolución de inscripción.
• El jugador podrá ser retirado del torneo si corresponde.
ATAP prioriza el juego justo sobre cualquier otro interés.

¿Es tu primer torneo? ¿No sabes tu categoría?
Si es tu primera participación: Comunícate con nosotros.
Un asesor ATAP evaluará tu experiencia, frecuencia de juego y antecedentes para ayudarte a ubicarte correctamente.
Queremos que empieces en el lugar adecuado.

7MA CATEGORÍA / 5TA PRINCIPIANTE
El jugador puede inscribirse en esta categoría, cumpliendo los siguientes requisitos:
• No haber campeonado antes en algún otro torneo de tenis.
• Participar como máximo en 3 torneos de esta categoría y no haber pasado de 8vos de final. Al pasar de 8vos de final, se considerará para la próxima edición como 5ta B o 6ta categoría.
Esto fomenta el crecimiento deportivo para los principiantes, de lo contrario se considera 5ta B o 6ta Categoría. De encontrar incidencias, o reportes donde se compruebe que no perteneces a esta categoría, se descalifica al jugador y no hay derecho a devolución del monto de inscripción.

¿Cómo reportar un jugador mal categorizado?
Si consideras que un jugador compite en una categoría que no le corresponde:
1. Comunícate formalmente con la organización.
2. Se realizará una investigación contrastando:
   – Participaciones en otros torneos.
   – Resultados previos.
   – Observación directa en el siguiente partido.
3. Si se confirma la irregularidad:
   – Se adjudicará el partido al jugador afectado.
   – El jugador será removido del torneo.
   – Podrá aplicarse suspensión en futuras ediciones.

Regla de participación en múltiples categorías (Actualizado 13/06 – Retroactiva)
Los jugadores podrán inscribirse en un máximo de dos categorías dentro del torneo.

FASE DE GRUPOS: En caso de que un jugador finalice en el primer lugar de la fase de grupos en ambas categorías, deberá continuar únicamente en una de ellas. En este caso, estará obligado a competir en la categoría de mayor nivel, quedando automáticamente retirado de la categoría inferior. Esta medida se aplica al considerarse que el jugador presenta un nivel competitivo superior (sobrecalificación) para la categoría menor. No hay devolución del pago de inscripción.

FASE ELIMINATORIA: En caso de que un jugador llegue en ambas categorías a la final, deberá continuar únicamente en una de ellas. En este caso, estará obligado a competir en la categoría de mayor nivel, quedando automáticamente retirado de la categoría inferior. Esta medida se aplica al considerarse que el jugador presenta un nivel competitivo superior (sobrecalificación) para la categoría menor. No hay devolución del pago de inscripción.

ATAP protege la transparencia competitiva.`
  },
  {
    id: 'reglas-torneo',
    num: 3,
    title: '3. Reglas del Torneo',
    summary: 'Formato Round Robin, marcadores, super tie-break, walk over y reserva de canchas.',
    content: `Formato Round Robin
Este torneo se juega bajo el formato Round Robin, donde cada jugador agenda sus propios partidos directamente con sus rivales, lo que te permite competir con total flexibilidad. Todos los jugadores disputarán 3 encuentros garantizados en fase de grupos, acumulando puntos para el ranking de cada categoría.

Formato Oficial para Torneos Grupales (Equipos):
En los torneos grupales por equipos, por cada fecha (serie entre dos equipos) se disputan obligatoriamente tres (3) partidos oficiales:
• Dos (2) partidos de Singles (Singles 1 y Singles 2).
• Un (1) partido de Dobles.
El equipo ganador de la serie de la fecha será aquel que consiga la victoria en al menos dos (2) de los tres partidos disputados.

¿Cómo Resulto Ganador del Partido?
Los partidos se disputarán al mejor de tres (3) sets.
En caso de empate a un set por lado, el tercer set se jugará en formato Super Tie Break a 10 puntos.

¿Cuándo se genera Walk Over?
• No Asistir al Partido Pactado: Faltar sin previo aviso.
• Llegar tarde al Partido Pactado: Se tendrá una tolerancia de 15 minutos. Pasado ese tiempo, solo podrían jugarlo si ambos jugadores están de acuerdo.
El resultado del partido será 6/0 – 6/0, y el jugador ausente deberá asumir el costo de la cancha.

¿Cuántos partidos se juega por semana?
Se disputará un partido por semana. De ser necesario por programación, los jugadores podrán disputar hasta dos partidos en una misma semana, previa coordinación.
Si un jugador no cumple con la programación de partidos durante las tres (3) semanas de la fase de grupos, la organización se reserva el derecho de definir el resultado mediante sorteo.

Reserva de Canchas
Ambos jugadores serán responsables de cubrir los gastos del partido (cancha y pelotas).
La organización podrá gestionar la reserva de canchas en una sede neutral para las semifinales, con el objetivo de garantizar condiciones equitativas, juego limpio y máxima competitividad en instancias decisivas.
Los gastos de alquiler serán asumidos por los jugadores semifinalistas.
En caso de que los jugadores prefieran no utilizar la gestión de ATAP, podrán coordinar de manera interna y disputar el encuentro en otra sede. Sin embargo, ante cualquier reclamo relacionado con cancha, condiciones de juego u organización en instancias finales, ATAP no podrá asumir responsabilidad si la sede no fue gestionada por la organización.

La final será cubierta íntegramente por la organización (cancha, recogebolas y pelotas).
La final no tendrá reprogramaciones. En caso de que un finalista no pueda asistir, deberá coordinar una nueva fecha y asumir los gastos correspondientes a dicho encuentro. El resultado se debe tener, antes de la final oficial, para la premiación en el evento.`
  },
  {
    id: 'cambio-condiciones',
    num: 4,
    title: '4. Cambio de Condiciones del Torneo',
    summary: 'Modificaciones por condiciones climáticas, disponibilidad de canchas o fuerza mayor.',
    content: `La organización de ATAP se reserva el derecho de modificar horarios, fechas de inicio, sedes, formato de competencia o cualquier condición operativa del torneo cuando existan razones justificadas, tales como condiciones climáticas, disponibilidad de canchas, fuerza mayor o situaciones que afecten el normal desarrollo del evento.

Cualquier modificación será comunicada oportunamente a los jugadores a través de los canales oficiales del torneo.

Estas decisiones se tomarán siempre priorizando:
• El correcto desarrollo del campeonato
• La equidad competitiva
• La seguridad de los participantes
• La calidad organizativa del evento

La inscripción en el torneo implica la aceptación de esta cláusula.`
  },
  {
    id: 'reglas-complementarias',
    num: 5,
    title: '5. Reglas Complementarias',
    summary: 'Congelamiento de categoría, ascenso automático y Comité de Evaluación.',
    content: `Congelamiento de Categoría
Una vez iniciado el torneo, no se podrá cambiar de categoría hasta la siguiente edición. Excepto si es por una penalización.

Ascenso Automático
Si se da una de las 2 circunstancias en un jugador 5ta B & A / 6ta & 5ta:
• Gana 2 torneos en una misma categoría, te asciende automáticamente.
• Gana 1 torneo con clara superioridad (ej: cede muy pocos games).

Si se da una de las 3 circunstancias en un jugador 5ta P / 7ma:
• Gana 1 torneo en la categoría, te asciende automáticamente.
• Participar hasta 2 torneos en la categoría y clasificar a Fases Eliminatorias en al menos 1 ocasión.
• Participar hasta 3 torneos en la categoría. Para la 4ta ocasión participarás en 5ta B / 6ta.

Comité de Evaluación
La decisión final de categorización será responsabilidad exclusiva del Comité ATAP y será inapelable durante el torneo en curso.`
  },
  {
    id: 'politica-devolucion',
    num: 6,
    title: '6. Política de Devolución',
    summary: 'Aceptación de condiciones de inscripción y causas no reembolsables.',
    content: `El pago de la inscripción al torneo constituye la aceptación total de las presentes condiciones.

No se realizarán devoluciones cuando el incumplimiento o inconveniente sea atribuible al participante. Esto incluye, de manera enunciativa mas no limitativa, los siguientes casos:
• Registro incompleto o incorrecto en el formulario de inscripción.
• Envío del formulario fuera de los plazos establecidos por la organización.
• Errores en los datos consignados por el participante.
• No presentación a los partidos programados.
• Retiro voluntario del torneo por decisión del participante.

La organización del torneo ATAP se reserva el derecho de evaluar y resolver, de manera discrecional, situaciones excepcionales debidamente justificadas. En caso de que la organización determine que el inconveniente es atribuible al participante, no procederá devolución alguna del monto pagado por concepto de inscripción.`
  }
];

export function getPoliciesAndRules() {
  try {
    if (typeof localStorage === 'undefined') return DEFAULT_POLICIES_AND_RULES;
    const raw = localStorage.getItem(STORAGE_KEYS.POLICIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(DEFAULT_POLICIES_AND_RULES));
      return DEFAULT_POLICIES_AND_RULES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_POLICIES_AND_RULES;
    }
    return parsed;
  } catch (e) {
    console.error('Error loading policies and rules:', e);
    return DEFAULT_POLICIES_AND_RULES;
  }
}

export function savePoliciesAndRules(sections) {
  try {
    if (typeof localStorage === 'undefined') return sections;
    const list = Array.isArray(sections) ? sections : DEFAULT_POLICIES_AND_RULES;
    localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(list));
    emitAtapUpdate(STORAGE_KEYS.POLICIES, list);
    return list;
  } catch (e) {
    console.error('Error saving policies and rules:', e);
    return DEFAULT_POLICIES_AND_RULES;
  }
}

export function resetPoliciesAndRules() {
  return savePoliciesAndRules(DEFAULT_POLICIES_AND_RULES);
}

// ----------------- CONTACT AND SUPPORT INFO -----------------

export const DEFAULT_CONTACT_INFO = {
  header: {
    eyebrow: 'ATENCIÓN AL JUGADOR Y AFILIADOS',
    title: 'Contacto y Soporte Oficial ATAP',
    description: '¿Tienes dudas sobre los torneos, validación de pagos, emparejamientos o el ranking oficial? Nuestro equipo de coordinación técnica y administrativa está listo para ayudarte.'
  },
  whatsapp: {
    title: 'WhatsApp Oficial',
    phone: '+51 977 884 423',
    number: '51977884423',
    subtext: 'Atención ágil para envío de comprobantes de pago y consultas en tiempo real.',
    btnText: 'Iniciar Chat WhatsApp'
  },
  email: {
    title: 'Correo Electrónico',
    email: 'contacto@atap.pe',
    subtext: 'Para consultas formales, solicitudes de auspicios y asuntos administrativos.',
    writeBtnText: 'Escribir Correo',
    copyBtnText: 'Copiar'
  },
  sede: {
    title: 'Sedes del Circuito',
    location: 'Lima Metropolitana, Perú',
    subtext: 'Club Lawn Tennis de la Exposición y clubes asociados del circuito amateur.',
    tagText: 'Canchas Oficiales'
  },
  horario: {
    visible: false, // Por indicación del usuario: actualmente no tienen horario de servicio fijo
    title: 'Horarios de Atención',
    primary: 'Lun a Sáb: 8:00 AM - 9:00 PM',
    subtext: 'Domingos y días de torneo: 8:00 AM - 2:00 PM con soporte en cancha.',
    tagText: 'Soporte Activo'
  }
};

export function getContactInfo() {
  try {
    if (typeof localStorage === 'undefined') return DEFAULT_CONTACT_INFO;
    const raw = localStorage.getItem(STORAGE_KEYS.CONTACT_INFO);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CONTACT_INFO, JSON.stringify(DEFAULT_CONTACT_INFO));
      return DEFAULT_CONTACT_INFO;
    }
    const parsed = JSON.parse(raw);
    return {
      header: { ...DEFAULT_CONTACT_INFO.header, ...(parsed.header || {}) },
      whatsapp: { ...DEFAULT_CONTACT_INFO.whatsapp, ...(parsed.whatsapp || {}) },
      email: { ...DEFAULT_CONTACT_INFO.email, ...(parsed.email || {}) },
      sede: { ...DEFAULT_CONTACT_INFO.sede, ...(parsed.sede || {}) },
      horario: { ...DEFAULT_CONTACT_INFO.horario, ...(parsed.horario || {}) }
    };
  } catch (e) {
    console.error('Error loading contact info:', e);
    return DEFAULT_CONTACT_INFO;
  }
}

export function saveContactInfo(info) {
  try {
    if (typeof localStorage === 'undefined') return info;
    const current = getContactInfo();
    const updated = {
      header: { ...current.header, ...(info?.header || {}) },
      whatsapp: { ...current.whatsapp, ...(info?.whatsapp || {}) },
      email: { ...current.email, ...(info?.email || {}) },
      sede: { ...current.sede, ...(info?.sede || {}) },
      horario: { ...current.horario, ...(info?.horario || {}) }
    };
    localStorage.setItem(STORAGE_KEYS.CONTACT_INFO, JSON.stringify(updated));
    emitAtapUpdate(STORAGE_KEYS.CONTACT_INFO, updated);
    return updated;
  } catch (e) {
    console.error('Error saving contact info:', e);
    return DEFAULT_CONTACT_INFO;
  }
}

export function resetContactInfo() {
  return saveContactInfo(DEFAULT_CONTACT_INFO);
}

// =========================================================
// CLAVE MAESTRA DIARIA DE RECUPERACIÓN (MÁXIMO 9 DÍGITOS)
// =========================================================

function generate8DigitKey() {
  // Genera un número entero seguro de 8 dígitos (máximo 9 dígitos)
  const min = 10000000;
  const max = 99999999;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

export function getDailyRecoveryKey() {
  try {
    if (typeof localStorage === 'undefined') return '84920173';
    const todayStr = new Date().toLocaleDateString('sv'); // 'YYYY-MM-DD'
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_RECOVERY_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.date === todayStr && data.key && String(data.key).length <= 9) {
        return String(data.key);
      }
    }
    // Generar nueva clave de 8 dígitos para hoy
    const newKey = generate8DigitKey();
    const payload = { date: todayStr, key: newKey };
    localStorage.setItem(STORAGE_KEYS.DAILY_RECOVERY_KEY, JSON.stringify(payload));
    emitAtapUpdate(STORAGE_KEYS.DAILY_RECOVERY_KEY, payload);
    return newKey;
  } catch (e) {
    console.error('Error in getDailyRecoveryKey:', e);
    return '84920173';
  }
}

export function regenerateDailyRecoveryKey() {
  try {
    const todayStr = new Date().toLocaleDateString('sv');
    const newKey = generate8DigitKey();
    const payload = { date: todayStr, key: newKey };
    localStorage.setItem(STORAGE_KEYS.DAILY_RECOVERY_KEY, JSON.stringify(payload));
    emitAtapUpdate(STORAGE_KEYS.DAILY_RECOVERY_KEY, payload);
    return newKey;
  } catch (e) {
    console.error('Error in regenerateDailyRecoveryKey:', e);
    return '84920173';
  }
}

export function validateDailyRecoveryKey(inputCode) {
  if (!inputCode) return false;
  const activeKey = getDailyRecoveryKey();
  const cleanInput = inputCode.toString().trim().replace(/\s+/g, '').toUpperCase();
  const cleanActive = activeKey.toString().trim().replace(/\s+/g, '').toUpperCase();
  return cleanInput === cleanActive;
}

export function resetUserPassword(identifier, newPassword, recoveryKey) {
  if (!validateDailyRecoveryKey(recoveryKey)) {
    return { error: 'La clave de recuperación ingresada es incorrecta o ha expirado.' };
  }

  const cleanPass = (newPassword || '').toString().trim();
  if (cleanPass.length < 8) {
    return { error: 'La nueva clave debe tener al menos 8 caracteres obligatorios.' };
  }

  const cleanId = (identifier || '').toString().trim().toLowerCase().replace(/\s+/g, '');
  if (!cleanId) {
    return { error: 'Por favor ingresa tu DNI o Correo electrónico.' };
  }

  const users = getRegisteredUsers();
  const targetUser = users.find((u) => {
    const uEmail = (u.email || '').toLowerCase().trim();
    const uDni = (u.dni || u.documentoIdentidad || '').toString().trim().replace(/\s+/g, '');
    const uDniClean = uDni.replace(/\*/g, '');
    return (
      uEmail === cleanId ||
      uDni === cleanId ||
      (cleanId.length >= 3 && uDni.endsWith(cleanId.slice(-3))) ||
      (uDniClean && cleanId.includes(uDniClean))
    );
  });

  if (!targetUser) {
    return { error: 'No se encontró ningún jugador registrado con este DNI o correo electrónico.' };
  }

  targetUser.password = cleanPass;
  saveRegisteredUser(targetUser);

  return { success: true, user: targetUser };
}



