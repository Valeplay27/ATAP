// Centralized Storage Service for ATAP
// Manages Tournaments, Inscriptions, Brackets, Ranking Leaderboard, and Site Images

export const STORAGE_KEYS = {
  TOURNEYS: 'atap_torneos',
  RANKING: 'atap_ranking',
  IMAGES: 'atap_site_images',
  USER: 'atap_usuario'
};

export const INITIAL_TOURNAMENTS = [
  {
    id: 'torneo-1',
    title: 'Torneo Nacional Open',
    level: 'Nacional',
    place: 'Lima, Perú',
    date: '12 May - 18 May 2025',
    image: 'https://images.unsplash.com/photo-1530915365347-9b4b6e0b3d16?auto=format&fit=crop&w=500&q=85',
    precio: 120,
    estado: 'inscripciones_abiertas',
    inscripciones: [
      {
        id: 'insc-sample-1',
        nombre: 'Diego Sánchez',
        email: 'diego.sanchez@atap.pe',
        dni: '72345678',
        telefono: '987654321',
        categoria: '1ra Categoría',
        estadoPago: 'aprobado',
        fechaRegistro: '2025-05-01',
        metodoPago: 'Yape / Plin'
      },
      {
        id: 'insc-sample-2',
        nombre: 'Luciana Pérez',
        email: 'luciana.perez@atap.pe',
        dni: '71234567',
        telefono: '987112233',
        categoria: '1ra Categoría',
        estadoPago: 'aprobado',
        fechaRegistro: '2025-05-02',
        metodoPago: 'Transferencia BCP'
      },
      {
        id: 'insc-sample-3',
        nombre: 'Valeria Torres',
        email: 'valeria.torres@atap.pe',
        dni: '73456789',
        telefono: '987334455',
        categoria: '2da Categoría',
        estadoPago: 'aprobado',
        fechaRegistro: '2025-05-03',
        metodoPago: 'Yape / Plin'
      },
      {
        id: 'insc-sample-4',
        nombre: 'Mateo Rojas',
        email: 'mateo.rojas@atap.pe',
        dni: '74567890',
        telefono: '987556677',
        categoria: '2da Categoría',
        estadoPago: 'aprobado',
        fechaRegistro: '2025-05-04',
        metodoPago: 'Transferencia BCP'
      },
      {
        id: 'insc-sample-5',
        nombre: 'Camila Mendoza',
        email: 'camila.mendoza@atap.pe',
        dni: '75678901',
        telefono: '987778899',
        categoria: '3ra Categoría',
        estadoPago: 'pendiente',
        fechaRegistro: '2025-05-05',
        metodoPago: 'Yape / Plin'
      },
      {
        id: 'insc-sample-6',
        nombre: 'Rodrigo Alva',
        email: 'rodrigo.alva@atap.pe',
        dni: '76789012',
        telefono: '987990011',
        categoria: '3ra Categoría',
        estadoPago: 'pendiente',
        fechaRegistro: '2025-05-06',
        metodoPago: 'Yape / Plin'
      }
    ],
    bracket: null
  },
  {
    id: 'torneo-2',
    title: 'Copa Ciudad de Lima',
    level: 'Regional',
    place: 'Lima, Perú',
    date: '20 May - 24 May 2025',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=500&q=85',
    precio: 80,
    estado: 'inscripciones_abiertas',
    inscripciones: [],
    bracket: null
  },
  {
    id: 'torneo-3',
    title: 'ITF World Tennis Tour',
    level: 'Internacional',
    place: 'Trujillo, Perú',
    date: '5 Jun - 15 Jun 2025',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=500&q=85',
    precio: 150,
    estado: 'inscripciones_abiertas',
    inscripciones: [],
    bracket: null
  },
  {
    id: 'torneo-4',
    title: 'Masters Juvenil',
    level: 'Regional',
    place: 'Lima, Perú',
    date: '21 Jun - 28 Jun 2025',
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=500&q=85',
    precio: 90,
    estado: 'inscripciones_abiertas',
    inscripciones: [],
    bracket: null
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
    categoria: '1ra Categoría',
    titulos: 4,
    golpe: 'Drive cruzado',
    mano: 'Diestro',
    efectividad: '88%',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-2',
    position: '02',
    name: 'Diego Sánchez',
    country: 'PER',
    points: '1,180 pts',
    puntosNum: 1180,
    categoria: '1ra Categoría',
    titulos: 3,
    golpe: 'Reves – 1 mano',
    mano: 'Zurdo',
    efectividad: '84%',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-3',
    position: '03',
    name: 'Valeria Torres',
    country: 'PER',
    points: '1,095 pts',
    puntosNum: 1095,
    categoria: '2da Categoría',
    titulos: 2,
    golpe: 'Saque plano',
    mano: 'Diestro',
    efectividad: '79%',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-4',
    position: '04',
    name: 'Mateo Rojas',
    country: 'PER',
    points: '980 pts',
    puntosNum: 980,
    categoria: '2da Categoría',
    titulos: 1,
    golpe: 'Drive paralelo',
    mano: 'Diestro',
    efectividad: '75%',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-5',
    position: '05',
    name: 'Camila Mendoza',
    country: 'PER',
    points: '920 pts',
    puntosNum: 920,
    categoria: '3ra Categoría',
    titulos: 1,
    golpe: 'Drop Shot',
    mano: 'Diestro',
    efectividad: '72%',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-6',
    position: '06',
    name: 'Rodrigo Alva',
    country: 'PER',
    points: '860 pts',
    puntosNum: 860,
    categoria: '3ra Categoría',
    titulos: 0,
    golpe: 'Slice defensivo',
    mano: 'Diestro',
    efectividad: '68%',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-7',
    position: '07',
    name: 'Andrea Flores',
    country: 'PER',
    points: '810 pts',
    puntosNum: 810,
    categoria: '3ra Categoría',
    titulos: 0,
    golpe: 'Reves a 2 manos',
    mano: 'Diestro',
    efectividad: '65%',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=85'
  },
  {
    id: 'p-8',
    position: '08',
    name: 'Joaquín Vargas',
    country: 'PER',
    points: '775 pts',
    puntosNum: 775,
    categoria: '4ta Categoría',
    titulos: 0,
    golpe: 'Drive cruzado',
    mano: 'Zurdo',
    efectividad: '61%',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=85'
  }
];

export const INITIAL_HERO_SLIDES = [
  {
    id: 'slide-1',
    image: '/assets/hero1.png',
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
  heroBanner: '/assets/hero1.png',
  heroSlides: INITIAL_HERO_SLIDES,
  eventoBanner: '/assets/Evento.png',
  logoPlatino: '/assets/Logo Platino.png',
  logoAtap: '/assets/logo.png'
};

export function emitAtapUpdate(key, data) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('atap_data_updated', {
      detail: { key, data }
    }));
  }
}

// ----------------- TOURNAMENT METHODS -----------------

export function getTournaments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TOURNEYS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TOURNEYS, JSON.stringify(INITIAL_TOURNAMENTS));
      return INITIAL_TOURNAMENTS;
    }
    const parsed = JSON.parse(raw);
    let changed = false;
    const withModality = parsed.map((t) => {
      if (!t.modalidad) {
        changed = true;
        return { ...t, modalidad: t.id === 'torneo-2' ? 'dobles' : 'singles' };
      }
      return t;
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.TOURNEYS, JSON.stringify(withModality));
    }
    return withModality;
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

  const newTourney = {
    id: 'torneo-' + Date.now(),
    title: (data.title || '').trim() || 'Nuevo Torneo ATAP',
    date: (data.date || '').trim() || 'Fecha por definir',
    place: (data.place || '').trim() || 'Lima, Perú',
    precio: Number(data.precio) || 100,
    level: data.level || 'Nacional',
    modalidad: data.modalidad || 'singles',
    image: (data.image || '').trim() || randomImg,
    estado: 'inscripciones_abiertas',
    inscripciones: [],
    bracket: null
  };

  tournaments.push(newTourney);
  saveTournaments(tournaments);
  return newTourney;
}

export function deleteTournament(tournamentId) {
  const tournaments = getTournaments();
  const filtered = tournaments.filter((t) => t.id !== tournamentId);
  saveTournaments(filtered);
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
    modalidad: updatedData.modalidad !== undefined ? updatedData.modalidad : (current.modalidad || 'singles'),
    image: updatedData.image !== undefined ? updatedData.image.trim() : current.image
  };

  saveTournaments(tournaments);
  return tournaments[index];
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

export function registerPlayerToTournament(tournamentId, playerData) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1) return null;

  const newRegistration = {
    id: 'insc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    nombre: playerData.nombre,
    email: playerData.email,
    dni: playerData.dni || '',
    telefono: playerData.telefono || '',
    categoria: playerData.categoria || '3ra Categoría',
    estadoPago: 'pendiente',
    fechaRegistro: new Date().toISOString().split('T')[0],
    metodoPago: playerData.metodoPago || 'Yape / Plin',
    comprobanteInfo: playerData.comprobanteInfo || ''
  };

  if (!tournaments[index].inscripciones) {
    tournaments[index].inscripciones = [];
  }

  tournaments[index].inscripciones.push(newRegistration);
  saveTournaments(tournaments);
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

  // Determine bracket size: 4 or 8
  const bracketSize = pool.length >= 6 ? 8 : 4;

  // Complete pool if needed with ranking players
  const rankings = getRanking();
  let rankIdx = 0;
  while (pool.length < bracketSize) {
    const rankP = rankings[rankIdx % rankings.length];
    rankIdx++;
    pool.push({
      id: 'seed-' + pool.length,
      nombre: rankP.name,
      categoria: rankP.categoria,
      image: rankP.image
    });
  }

  const participants = pool.slice(0, bracketSize);
  let rounds = [];

  if (bracketSize === 4) {
    // Round 1: Semifinales (2 matches)
    const m1 = {
      id: 'm-sf-1',
      round: 'Semifinales',
      matchNum: 1,
      player1: { name: participants[0].nombre, categoria: participants[0].categoria },
      player2: { name: participants[1].nombre, categoria: participants[1].categoria },
      score: '',
      winnerSlot: null,
      winnerName: null,
      nextMatchId: 'm-f-1',
      nextSlot: 1
    };
    const m2 = {
      id: 'm-sf-2',
      round: 'Semifinales',
      matchNum: 2,
      player1: { name: participants[2].nombre, categoria: participants[2].categoria },
      player2: { name: participants[3].nombre, categoria: participants[3].categoria },
      score: '',
      winnerSlot: null,
      winnerName: null,
      nextMatchId: 'm-f-1',
      nextSlot: 2
    };
    const mf = {
      id: 'm-f-1',
      round: 'Gran Final',
      matchNum: 3,
      player1: null,
      player2: null,
      score: '',
      winnerSlot: null,
      winnerName: null,
      nextMatchId: null,
      nextSlot: null
    };

    rounds = [
      { name: 'Semifinales', matches: [m1, m2] },
      { name: 'Gran Final', matches: [mf] }
    ];
  } else {
    // 8 players: Cuartos -> Semis -> Final
    const qfMatches = [];
    for (let i = 0; i < 4; i++) {
      qfMatches.push({
        id: 'm-qf-' + (i + 1),
        round: 'Cuartos de final',
        matchNum: i + 1,
        player1: { name: participants[i * 2].nombre, categoria: participants[i * 2].categoria },
        player2: { name: participants[i * 2 + 1].nombre, categoria: participants[i * 2 + 1].categoria },
        score: '',
        winnerSlot: null,
        winnerName: null,
        nextMatchId: i < 2 ? 'm-sf-1' : 'm-sf-2',
        nextSlot: (i % 2) + 1
      });
    }

    const sfMatches = [
      {
        id: 'm-sf-1',
        round: 'Semifinales',
        matchNum: 5,
        player1: null,
        player2: null,
        score: '',
        winnerSlot: null,
        winnerName: null,
        nextMatchId: 'm-f-1',
        nextSlot: 1
      },
      {
        id: 'm-sf-2',
        round: 'Semifinales',
        matchNum: 6,
        player1: null,
        player2: null,
        score: '',
        winnerSlot: null,
        winnerName: null,
        nextMatchId: 'm-f-1',
        nextSlot: 2
      }
    ];

    const finalMatch = {
      id: 'm-f-1',
      round: 'Gran Final',
      matchNum: 7,
      player1: null,
      player2: null,
      score: '',
      winnerSlot: null,
      winnerName: null,
      nextMatchId: null,
      nextSlot: null
    };

    rounds = [
      { name: 'Cuartos de final', matches: qfMatches },
      { name: 'Semifinales', matches: sfMatches },
      { name: 'Gran Final', matches: [finalMatch] }
    ];
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

export function recordMatchResult(tournamentId, matchId, winnerSlot, scoreString, pointsAward = 100) {
  const tournaments = getTournaments();
  const index = tournaments.findIndex((t) => t.id === tournamentId);
  if (index === -1 || !tournaments[index].bracket) return { error: 'Bracket no encontrado.' };

  const bracket = tournaments[index].bracket;
  let targetMatch = null;
  let allMatches = [];

  bracket.rounds.forEach((r) => {
    allMatches.push(...r.matches);
  });

  targetMatch = allMatches.find((m) => m.id === matchId);
  if (!targetMatch) return { error: 'Partido no encontrado.' };

  const winnerPlayer = winnerSlot === 1 ? targetMatch.player1 : targetMatch.player2;
  if (!winnerPlayer) return { error: 'El jugador seleccionado aún no está definido.' };

  targetMatch.score = scoreString || '6-4, 6-4';
  targetMatch.winnerSlot = winnerSlot;
  targetMatch.winnerName = winnerPlayer.name;

  // Advance winner if next match exists
  if (targetMatch.nextMatchId) {
    const nextMatch = allMatches.find((m) => m.id === targetMatch.nextMatchId);
    if (nextMatch) {
      if (targetMatch.nextSlot === 1) {
        nextMatch.player1 = { ...winnerPlayer };
      } else {
        nextMatch.player2 = { ...winnerPlayer };
      }
    }
  } else {
    // This was the Gran Final!
    bracket.champion = { ...winnerPlayer };
    tournaments[index].estado = 'finalizado';
    pointsAward = Math.max(pointsAward, 250); // Champion bonus
  }

  // Award points to winner and update live ranking
  if (winnerPlayer.name) {
    awardPointsToPlayer(winnerPlayer.name, pointsAward);
  }

  saveTournaments(tournaments);
  return { success: true, match: targetMatch, champion: bracket.champion };
}

// ----------------- RANKING METHODS -----------------

export function getRanking() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RANKING);
    let list = raw ? JSON.parse(raw) : INITIAL_RANKING;

    list.sort((a, b) => (b.puntosNum || 0) - (a.puntosNum || 0));
    list = list.map((p, idx) => {
      const pos = String(idx + 1).padStart(2, '0');
      return {
        ...p,
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

export function awardPointsToPlayer(playerName, pointsToAdd) {
  const ranking = getRanking();
  let player = ranking.find((p) => p.name.toLowerCase() === playerName.toLowerCase());

  if (!player) {
    player = {
      id: 'p-' + Date.now(),
      name: playerName,
      country: 'PER',
      puntosNum: Number(pointsToAdd),
      categoria: '1ra Categoría',
      titulos: 1,
      golpe: 'Drive cruzado',
      mano: 'Diestro',
      efectividad: '75%',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=85'
    };
    ranking.push(player);
  } else {
    player.puntosNum = (player.puntosNum || 0) + Number(pointsToAdd);
  }

  saveRanking(ranking);
  return player;
}

export function updatePlayerAvatar(playerNameOrId, newAvatarUrl) {
  const ranking = getRanking();
  const player = ranking.find(
    (p) =>
      p.id === playerNameOrId ||
      p.name.toLowerCase() === playerNameOrId.toLowerCase()
  );

  if (player) {
    player.image = newAvatarUrl;
    saveRanking(ranking);

    // Also sync with active user session if matching
    try {
      const activeUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
      if (activeUser && activeUser.nombre && activeUser.nombre.toLowerCase() === player.name.toLowerCase()) {
        activeUser.avatar = newAvatarUrl;
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
      if (parsed.heroBanner && parsed.heroBanner !== '/assets/hero1.png') {
        parsed.heroSlides[0] = { ...parsed.heroSlides[0], image: parsed.heroBanner };
      }
      changed = true;
    }
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(parsed));
    }
    return { ...INITIAL_SITE_IMAGES, ...parsed };
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
    localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(current));
    emitAtapUpdate(STORAGE_KEYS.IMAGES, current);
    return true;
  } catch (e) {
    console.error('Error saving site image:', e);
    return false;
  }
}
