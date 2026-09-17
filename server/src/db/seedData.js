import bcrypt from 'bcryptjs';
import { maskDni, hashDni } from '../utils/dniHelper.js';

export const ADMIN_SEED = {
  id: 'user-admin-atap',
  nombre: 'Administrador ATAP',
  email: 'vladimiryt18@gmail.com',
  password_hash: bcrypt.hashSync('admin123', 10),
  auth_provider: 'local',
  dni_masked: '*****000',
  dni_hash: hashDni('00000000'),
  telefono: '987654321',
  whatsapp: '987654321',
  categoria: 'Comité ATAP',
  rol: 'Administrador',
  es_admin: true,
  perfil_incompleto: false,
  completado_onboarding: true,
  avatar_url: '/assets/logo.png',
  fecha_registro: '2026-01-01'
};

export const RANKING_SEED = [
  { id: 'p-1', name: 'Carlos Mendoza', dni: '*****567', country: 'PER', puntosNum: 1450, points: '1,450 pts', categoria: '4ta', titulos: 3, golpe: 'Drive invertido', mano: 'Diestro', efectividad: '85%', image: '/assets/logo.png' },
  { id: 'p-2', name: 'Alonso Herrera', dni: '*****678', country: 'PER', puntosNum: 1320, points: '1,320 pts', categoria: '4ta', titulos: 2, golpe: 'Drop shot', mano: 'Diestro', efectividad: '82%', image: '/assets/logo.png' },
  { id: 'p-3', name: 'Santiago Gómez', dni: '*****789', country: 'PER', puntosNum: 1210, points: '1,210 pts', categoria: '4ta', titulos: 1, golpe: 'Reves paralelo', mano: 'Zurdo', efectividad: '78%', image: '/assets/logo.png' },
  { id: 'p-4', name: 'Renato Vargas', dni: '*****890', country: 'PER', puntosNum: 1100, points: '1,100 pts', categoria: '4ta', titulos: 1, golpe: 'Saque plano', mano: 'Diestro', efectividad: '75%', image: '/assets/logo.png' },
  { id: 'p-5', name: 'Luciana Pérez', dni: '*****901', country: 'PER', puntosNum: 1280, points: '1,280 pts', categoria: '5ta A', titulos: 2, golpe: 'Drive cruzado', mano: 'Diestro', efectividad: '84%', image: '/assets/logo.png' },
  { id: 'p-6', name: 'Diego Sánchez', dni: '*****012', country: 'PER', puntosNum: 1150, points: '1,150 pts', categoria: '5ta A', titulos: 1, golpe: 'Slice defensivo', mano: 'Diestro', efectividad: '79%', image: '/assets/logo.png' },
  { id: 'p-7', name: 'Valeria Torres', dni: '*****456', country: 'PER', puntosNum: 1040, points: '1,040 pts', categoria: '5ta A', titulos: 1, golpe: 'Reves a dos manos', mano: 'Zurdo', efectividad: '76%', image: '/assets/logo.png' },
  { id: 'p-8', name: 'Mateo Castillo', dni: '*****234', country: 'PER', puntosNum: 950, points: '950 pts', categoria: '5ta A', titulos: 0, golpe: 'Volea de bloqueo', mano: 'Diestro', efectividad: '71%', image: '/assets/logo.png' },
  { id: 'p-9', name: 'Joaquín Silva', dni: '*****123', country: 'PER', puntosNum: 1190, points: '1,190 pts', categoria: '5ta B', titulos: 2, golpe: 'Drive con topspin', mano: 'Diestro', efectividad: '80%', image: '/assets/logo.png' },
  { id: 'p-10', name: 'Camila Morales', dni: '*****234', country: 'PER', puntosNum: 1080, points: '1,080 pts', categoria: '5ta B', titulos: 1, golpe: 'Saque con slice', mano: 'Diestro', efectividad: '77%', image: '/assets/logo.png' },
  { id: 'p-11', name: 'Sebastián Reyes', dni: '*****145', country: 'PER', puntosNum: 970, points: '970 pts', categoria: '5ta B', titulos: 0, golpe: 'Passing shot', mano: 'Zurdo', efectividad: '73%', image: '/assets/logo.png' },
  { id: 'p-12', name: 'Gabriel Rojas', dni: '*****201', country: 'PER', puntosNum: 890, points: '890 pts', categoria: '5ta B', titulos: 0, golpe: 'Globo ofensivo', mano: 'Diestro', efectividad: '69%', image: '/assets/logo.png' },
  { id: 'p-13', name: 'Ignacio Vega', dni: '*****312', country: 'PER', puntosNum: 980, points: '980 pts', categoria: '6ta', titulos: 1, golpe: 'Drive plano', mano: 'Diestro', efectividad: '74%', image: '/assets/logo.png' },
  { id: 'p-14', name: 'Mariana Flores', dni: '*****423', country: 'PER', puntosNum: 870, points: '870 pts', categoria: '6ta', titulos: 0, golpe: 'Reves cortado', mano: 'Diestro', efectividad: '70%', image: '/assets/logo.png' },
  { id: 'p-15', name: 'Álvaro Campos', dni: '*****534', country: 'PER', puntosNum: 790, points: '790 pts', categoria: '6ta', titulos: 0, golpe: 'Saque liftado', mano: 'Diestro', efectividad: '67%', image: '/assets/logo.png' },
  { id: 'p-16', name: 'Rodrigo Paredes', dni: '*****645', country: 'PER', puntosNum: 720, points: '720 pts', categoria: '6ta', titulos: 0, golpe: 'Drop shot', mano: 'Zurdo', efectividad: '65%', image: '/assets/logo.png' }
];

export const TOURNAMENTS_SEED = [
  {
    id: 't-apertura-2026',
    title: 'Torneo Apertura ATAP 2026',
    slug: 'torneo-apertura-atap-2026',
    estado: 'abierto',
    modalidad: 'singles',
    categoria: '4ta, 5ta A, 5ta B, 6ta',
    fechasDisplay: '15 Mar - 29 Mar 2026',
    fechaInicio: '2026-03-15',
    fechaFin: '2026-03-29',
    sede: 'Club Lawn Tennis de la Exposición',
    direccion: 'Av. 28 de Julio 744, Jesús María, Lima',
    superficie: 'Arcilla / Polvo de Ladrillo',
    precio: 85.00,
    precioDisplay: 'S/ 85.00',
    premio: 'S/ 2,500 + Trofeos Oficiales',
    imagenUrl: '/assets/apertura.jpg',
    descripcion: 'El torneo oficial inaugural del Circuito Amateur de Tenis del Perú (ATAP) 2026.',
    esDestacado: true,
    categoriasCupos: [
      { id: 'cat-4', nombre: '4ta', cupos: 16, inscritos: 8 },
      { id: 'cat-5a', nombre: '5ta A', cupos: 16, inscritos: 12 },
      { id: 'cat-5b', nombre: '5ta B', cupos: 32, inscritos: 16 },
      { id: 'cat-6', nombre: '6ta', cupos: 32, inscritos: 20 }
    ],
    grupos: [
      { id: 'grupo-a', nombre: 'Grupo A', participantes: [], partidos: [] },
      { id: 'grupo-b', nombre: 'Grupo B', participantes: [], partidos: [] },
      { id: 'grupo-c', nombre: 'Grupo C', participantes: [], partidos: [] },
      { id: 'grupo-d', nombre: 'Grupo D', participantes: [], partidos: [] }
    ],
    bracket: {
      rounds: [
        { roundIndex: 1, roundName: 'Cuartos de final', matches: [] },
        { roundIndex: 2, roundName: 'Semifinales', matches: [] },
        { roundIndex: 3, roundName: 'Final', matches: [] }
      ],
      champion: null
    }
  },
  {
    id: 't-copa-dobles-2026',
    title: 'Copa Nacional de Dúos y Dobles ATAP',
    slug: 'copa-nacional-duos-dobles-atap-2026',
    estado: 'proximo',
    modalidad: 'dobles',
    categoria: '4ta Dobles, 5ta A Dobles, 5ta B Dobles',
    fechasDisplay: '12 Abr - 26 Abr 2026',
    fechaInicio: '2026-04-12',
    fechaFin: '2026-04-26',
    sede: 'Rinconada Country Club',
    direccion: 'Av. Manuel Prado Ugarteche 901, La Molina, Lima',
    superficie: 'Arcilla / Polvo de Ladrillo',
    precio: 140.00,
    precioDisplay: 'S/ 140.00 por dupla',
    premio: 'S/ 3,000 + Palas/Raquetas Oficiales',
    imagenUrl: '/assets/dobles.jpg',
    descripcion: 'Competición en parejas y dúos oficiales del circuito amateur en Lima.',
    esDestacado: false,
    categoriasCupos: [
      { id: 'cat-d4', nombre: '4ta Dobles', cupos: 16, inscritos: 4 },
      { id: 'cat-d5a', nombre: '5ta A Dobles', cupos: 16, inscritos: 6 },
      { id: 'cat-d5b', nombre: '5ta B Dobles', cupos: 16, inscritos: 8 }
    ],
    grupos: [],
    bracket: null
  }
];

export const SPONSORS_SEED = [
  { id: 'sp-1', name: 'Wilson Perú', category: 'Equipamiento Oficial', logoUrl: '/assets/sponsors/wilson.png', link: 'https://wilson.com', description: 'Pelotas oficiales y raquetas del circuito ATAP', active: true, orderIndex: 1 },
  { id: 'sp-2', name: 'Gatorade', category: 'Hidratación Oficial', logoUrl: '/assets/sponsors/gatorade.png', link: 'https://gatorade.com', description: 'Bebidas isotónicas en todas las sedes del circuito', active: true, orderIndex: 2 },
  { id: 'sp-3', name: 'Babolat', category: 'Partner Técnico', logoUrl: '/assets/sponsors/babolat.png', link: 'https://babolat.com', description: 'Encordado oficial y accesorios de tenis', active: true, orderIndex: 3 }
];

export const NEWS_SEED = [
  {
    id: 'news-1',
    title: 'Arranca la Temporada Oficial 2026 del Circuito ATAP',
    summary: 'Más de 200 tenistas amateurs disputarán el Torneo Apertura en las mejores canchas de Lima.',
    content: 'La Asociación de Tenistas Amateur del Perú da inicio a su calendario oficial 2026 con 6 torneos puntuables y el Master Final de fin de año.',
    category: 'Institucional',
    imageUrl: '/assets/news1.jpg',
    author: 'Comité Directivo ATAP',
    dateDisplay: '10 Feb 2026',
    featured: true
  }
];
