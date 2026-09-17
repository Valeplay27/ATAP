import { Router } from 'express';
import { getLeaderboard, getPlayerDetail } from '../controllers/rankingController.js';

const router = Router();

router.get('/', getLeaderboard);
router.get('/:id', getPlayerDetail);

export default router;
