import { Router } from 'express';
import { signup, login, googleCallback, forgotPassword, resetPassword, googleCompleteRegistration } from './auth.controller';
import passport from 'passport';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.post('/google-complete-registration', googleCompleteRegistration);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    googleCallback
);

// router.post('/refresh-token', refreshToken); // To be implemented later

export default router;
