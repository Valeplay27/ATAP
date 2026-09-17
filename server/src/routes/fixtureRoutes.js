import { Router } from 'express';
import { saveGroups, saveBracket, recordMatchScore } from '../controllers/fixtureController.js';
import { requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.put('/:tournamentId/groups', requireAdmin, saveGroups);
router.put('/:tournamentId/bracket', requireAdmin, saveBracket);
router.post('/:tournamentId/matches/:matchId/score', requireAdmin, recordMatchScore);

export default router;
