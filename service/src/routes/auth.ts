import { Router } from 'express';
import { register, login, refreshToken, logout } from '../controllers/authController';
import { validateLogin, validateRegister, authenticateToken } from '../middleware';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', authenticateToken, refreshToken);
router.post('/logout', authenticateToken, logout);

export default router;