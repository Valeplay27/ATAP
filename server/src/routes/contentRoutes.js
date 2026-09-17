import { Router } from 'express';
import {
  getNews,
  saveNews,
  deleteNews,
  getSponsors,
  saveSponsor,
  deleteSponsor,
  getSetting,
  saveSetting
} from '../controllers/contentController.js';
import { requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Noticias
router.get('/news', getNews);
router.post('/news', requireAdmin, saveNews);
router.delete('/news/:id', requireAdmin, deleteNews);

// Auspiciadores
router.get('/sponsors', getSponsors);
router.post('/sponsors', requireAdmin, saveSponsor);
router.delete('/sponsors/:id', requireAdmin, deleteSponsor);

// Ajustes y configuraciones
router.get('/settings/:key', getSetting);
router.put('/settings/:key', requireAdmin, saveSetting);

export default router;
