import { Router } from 'express';
import { signup, login } from './auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
// router.post('/refresh-token', refreshToken); // To be implemented later

export default router;
