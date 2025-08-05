import { Router } from 'express';
import { getData, getProfile } from '../controllers/dataController';
import { authenticateToken } from '../middleware';

const router = Router();

router.get('/data', authenticateToken, getData);
router.get('/profile', authenticateToken, getProfile);

export default router;