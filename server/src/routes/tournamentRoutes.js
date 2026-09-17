import { Router } from 'express';
import {
  getAllTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament
} from '../controllers/tournamentController.js';
import { requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', getAllTournaments);
router.get('/:id', getTournamentById);
router.post('/', requireAdmin, createTournament);
router.put('/:id', requireAdmin, updateTournament);
router.delete('/:id', requireAdmin, deleteTournament);

export default router;
