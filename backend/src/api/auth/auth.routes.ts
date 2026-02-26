import { Router } from 'express';
import { signup, login, refreshToken, googleCallback, forgotPassword, resetPassword, googleCompleteRegistration } from './auth.controller';
import passport from 'passport';
import { uploadLogo } from '../../middleware/logoUpload'; // NEW IMPORT
import config from '../../config';

const router = Router();

router.post('/signup', uploadLogo, signup); // Add uploadLogo middleware
router.post('/login', login);
router.post('/refresh-token', refreshToken);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.post('/google-complete-registration', uploadLogo, googleCompleteRegistration); // Add uploadLogo middleware

router.get('/google', (req, res, next) => {
  if (!config.google.clientId || !config.google.clientSecret) {
    return res.status(503).json({ message: 'Google OAuth is not configured.' });
  }
  return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get(
    '/google/callback',
    (req, res, next) => {
      if (!config.google.clientId || !config.google.clientSecret) {
        return res.status(503).json({ message: 'Google OAuth is not configured.' });
      }
      return passport.authenticate('google', { failureRedirect: '/login' })(req, res, next);
    },
    googleCallback
);

export default router;
