import { Router } from 'express';
import crypto from 'crypto';
import { signup, login, refreshToken, googleCallback, exchangeGoogleAuthCode, forgotPassword, resetPassword, googleCompleteRegistration, googleRegistrationContext, changePassword } from './auth.controller';
import passport from 'passport';
import { uploadLogo } from '../../middleware/logoUpload'; 
import { authenticate } from '../../middleware/auth.middleware';
import config from '../../config';

const router = Router();
const GOOGLE_OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const googleOAuthStateStore = new Map<string, number>();

const pruneExpiredStates = () => {
  const now = Date.now();
  for (const [state, expiresAt] of googleOAuthStateStore.entries()) {
    if (expiresAt <= now) {
      googleOAuthStateStore.delete(state);
    }
  }
};

router.post('/signup', uploadLogo, signup); 
router.post('/login', login);
router.post('/refresh-token', refreshToken);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/change-password', authenticate, changePassword);

router.post('/google-complete-registration', uploadLogo, googleCompleteRegistration); 
router.post('/google/exchange-code', exchangeGoogleAuthCode);
router.post('/google/registration-context', googleRegistrationContext);

router.get('/google', async (req, res, next) => {
  if (!config.google.clientId || !config.google.clientSecret) {
    return res.status(503).json({ message: 'Google OAuth is not configured.' });
  }

  pruneExpiredStates();
  const state = crypto.randomBytes(24).toString('hex');
  googleOAuthStateStore.set(state, Date.now() + GOOGLE_OAUTH_STATE_TTL_MS);
  return passport.authenticate('google', { scope: ['profile', 'email'], state, session: false })(req, res, next);
});

router.get(
    '/google/callback',
    async (req, res, next) => {
      if (!config.google.clientId || !config.google.clientSecret) {
        return res.status(503).json({ message: 'Google OAuth is not configured.' });
      }

      pruneExpiredStates();
      const state = typeof req.query.state === 'string' ? req.query.state : '';
      if (!state || !googleOAuthStateStore.has(state)) {
        return res.status(400).json({ message: 'Invalid OAuth state.' });
      }
      googleOAuthStateStore.delete(state);
      return passport.authenticate('google', { failureRedirect: `${config.frontendUrl}/login`, session: false })(req, res, next);
    },
    googleCallback
);

export default router;
