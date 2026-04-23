import { Router } from 'express';
import crypto from 'crypto';
import { signup, login, refreshToken, googleCallback, exchangeGoogleAuthCode, forgotPassword, resetPassword, googleCompleteRegistration, googleRegistrationContext, changePassword } from './auth.controller';
import passport from 'passport';
import { uploadLogo } from '../../middleware/logoUpload'; 
import { authMiddleware } from '../../middleware/auth.middleware';
import { authRateLimiter, passwordResetRateLimiter } from '../../middleware/rateLimit';
import config from '../../config';
import { validate, signupSchema, loginSchema, refreshTokenSchema, googleAuthCodeSchema, googleRegistrationContextSchema, googleCompleteRegistrationSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../../middleware/validation';

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

setInterval(pruneExpiredStates, 60_000).unref();

router.post('/signup', authRateLimiter, uploadLogo, validate(signupSchema), signup); 
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);

router.post('/forgot-password', passwordResetRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', passwordResetRateLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/change-password', authMiddleware, validate(changePasswordSchema), changePassword);

router.post('/google-complete-registration', authRateLimiter, uploadLogo, validate(googleCompleteRegistrationSchema), googleCompleteRegistration); 
router.post('/google/exchange-code', authRateLimiter, validate(googleAuthCodeSchema), exchangeGoogleAuthCode);
router.post('/google/registration-context', authRateLimiter, validate(googleRegistrationContextSchema), googleRegistrationContext);

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
        return res.redirect(`${config.frontendUrl}/login?error=google_oauth_not_configured`);
      }

      pruneExpiredStates();
      const state = typeof req.query.state === 'string' ? req.query.state : '';
      if (!state || !googleOAuthStateStore.has(state)) {
        return res.redirect(`${config.frontendUrl}/login?error=invalid_oauth_state`);
      }
      googleOAuthStateStore.delete(state);
      return passport.authenticate('google', { session: false })(req, res, next);
    },
    googleCallback
);

export default router;
