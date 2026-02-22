import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import config from './index';

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

        if(user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user)
        }

        const newUser = new User({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails?.[0].value,
          // businessName: '', // These fields are now required, so we can't set them to empty
          // businessType: '',
          // businessPhoneNumber: ''
        });

        // If the user doesn't exist and we couldn't find them by email either,
        // we need to signal that registration is required.
        // We pass the profile to the auth.controller.ts via the info argument of done.
        return done(null, false, { message: 'Registration required', profile: profile });
        
        // Removed: await newUser.save(); and done(null, newUser);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

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
