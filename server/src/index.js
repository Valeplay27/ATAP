import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import inscriptionRoutes from './routes/inscriptionRoutes.js';
import fixtureRoutes from './routes/fixtureRoutes.js';
import rankingRoutes from './routes/rankingRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import contentRoutes from './routes/contentRoutes.js';

import { initDatabase } from './db/initDb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Servir archivos subidos estáticamente
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Rutas de la API REST
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/inscriptions', inscriptionRoutes);
app.use('/api/fixtures', fixtureRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/content', contentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ATAP Backend API',
    database: 'MySQL',
    timestamp: new Date().toISOString()
  });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'La imagen excede el límite máximo permitido de 5 MB.'
    });
  }
  console.error('Error no capturado en servidor:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor.'
  });
});

// Inicializar base de datos y arrancar servidor
async function startServer() {
  console.log('[ATAP] Iniciando servidor backend...');
  try {
    await initDatabase();
  } catch (dbErr) {
    console.warn('[ATAP] Advertencia al inicializar base de datos:', dbErr.message);
  }

  app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(`🎾 ATAP Backend API corriendo en puerto ${PORT}`);
    console.log(`🚀 URL Base: http://localhost:${PORT}`);
    console.log(`📁 Carpeta de imágenes: ${uploadsPath}`);
    console.log(`=============================================`);
  });
}

startServer();
