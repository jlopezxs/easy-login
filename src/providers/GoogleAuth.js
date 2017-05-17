import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
/**
 * Sign in with Google.
 */
export default function googleAuth({ UserModel, urlPath, passport, googleId, googleSecret }) {
	passport.use(new GoogleStrategy({
	  clientID: process.env.GOOGLE_ID,
	  clientSecret: process.env.GOOGLE_SECRET,
	  callbackURL: `/${urlPath}/google/callback`,
	  passReqToCallback: true
	}, (req, accessToken, refreshToken, profile, done) => {
	  if (req.user) {
	    User.findOne({ google: profile.id }, (err, existingUser) => {
	      if (err) { return done(err); }
	      if (existingUser) {
	        req.flash('errors', { msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
	        done(err);
	      } else {
	        User.findById(req.user.id, (err, user) => {
	          if (err) { return done(err); }
	          user.google = profile.id;
	          user.tokens.push({ kind: 'google', accessToken });
	          user.profile.name = user.profile.name || profile.displayName;
	          user.profile.gender = user.profile.gender || profile._json.gender;
	          user.profile.picture = user.profile.picture || profile._json.image.url;
	          user.save((err) => {
	            req.flash('info', { msg: 'Google account has been linked.' });
	            done(err, user);
	          });
	        });
	      }
	    });
	  } else {
	    User.findOne({ google: profile.id }, (err, existingUser) => {
	      if (err) { return done(err); }
	      if (existingUser) {
	        return done(null, existingUser);
	      }
	      User.findOne({ email: profile.emails[0].value }, (err, existingEmailUser) => {
	        if (err) { return done(err); }
	        if (existingEmailUser) {
	          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.' });
	          done(err);
	        } else {
	          const user = new User();
	          user.email = profile.emails[0].value;
	          user.google = profile.id;
	          user.tokens.push({ kind: 'google', accessToken });
	          user.profile.name = profile.displayName;
	          user.profile.gender = profile._json.gender;
	          user.profile.picture = profile._json.image.url;
	          user.save((err) => {
	            done(err, user);
	          });
	        }
	      });
	    });
	  }
	}));
}
