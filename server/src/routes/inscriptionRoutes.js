import { Router } from 'express';
import {
  createInscription,
  updateStatus,
  addToBank,
  deleteInscription
} from '../controllers/inscriptionController.js';
import { requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/:tournamentId', createInscription);
router.patch('/:id/status', requireAdmin, updateStatus);
router.post('/:tournamentId/bank', requireAdmin, addToBank);
router.delete('/:id', requireAdmin, deleteInscription);

export default router;
