import { Router } from 'express';
import { getAllPlayers, savePlayer, deletePlayer, updateAvatar } from '../controllers/playerController.js';
import { requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', getAllPlayers);
router.post('/', requireAdmin, savePlayer);
router.delete('/:id', requireAdmin, deletePlayer);
router.patch('/:id/avatar', requireAdmin, updateAvatar);

export default router;
