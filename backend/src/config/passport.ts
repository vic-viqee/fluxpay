import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import config from './index';
import logger from '../utils/logger';

if (config.google.clientId && config.google.clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientId,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existingUser = await User.findOne({ googleId: profile.id });

          if (existingUser) {
            return done(null, existingUser);
          }

          const user = await User.findOne({ email: profile.emails?.[0].value });

          if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }

          // If the user does not exist, signal the frontend to complete registration.
          return done(null, false, { message: 'Registration required', profile: profile });
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
} else {
  logger.warn('Google OAuth strategy disabled: GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET not set.');
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, false);
    }
});

export default passport;
