import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
/**
 * Sign in with LinkedIn.
 */
export default function linkedinAuth({ UserModel, passport, linkedinId, linkedinSecret, linkedinCallbackUrl,
	scope = ['r_basicprofile', 'r_emailaddress'] }) {

	passport.use(new LinkedInStrategy({
	  clientID: linkedinId || process.env.LINKEDIN_ID,
	  clientSecret: linkedinSecret || process.env.LINKEDIN_SECRET,
	  callbackURL: linkedinCallbackUrl || process.env.LINKEDIN_CALLBACK_URL,
	  scope,
	  passReqToCallback: true
	}, (req, accessToken, refreshToken, profile, done) => {
	  if (req.user) {
	    User.findOne({ linkedin: profile.id }, (err, existingUser) => {
	      if (err) { return done(err); }
	      if (existingUser) {
	        req.flash('errors', { msg: 'There is already a LinkedIn account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
	        done(err);
	      } else {
	        User.findById(req.user.id, (err, user) => {
	          if (err) { return done(err); }
	          user.linkedin = profile.id;
	          user.tokens.push({ kind: 'linkedin', accessToken });
	          user.profile.name = user.profile.name || profile.displayName;
	          user.profile.location = user.profile.location || profile._json.location.name;
	          user.profile.picture = user.profile.picture || profile._json.pictureUrl;
	          user.profile.website = user.profile.website || profile._json.publicProfileUrl;
	          user.save((err) => {
	            if (err) { return done(err); }
	            req.flash('info', { msg: 'LinkedIn account has been linked.' });
	            done(err, user);
	          });
	        });
	      }
	    });
	  } else {
	    User.findOne({ linkedin: profile.id }, (err, existingUser) => {
	      if (err) { return done(err); }
	      if (existingUser) {
	        return done(null, existingUser);
	      }
	      User.findOne({ email: profile._json.emailAddress }, (err, existingEmailUser) => {
	        if (err) { return done(err); }
	        if (existingEmailUser) {
	          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with LinkedIn manually from Account Settings.' });
	          done(err);
	        } else {
	          const user = new User();
	          user.linkedin = profile.id;
	          user.tokens.push({ kind: 'linkedin', accessToken });
	          user.email = profile._json.emailAddress;
	          user.profile.name = profile.displayName;
	          user.profile.location = profile._json.location.name;
	          user.profile.picture = profile._json.pictureUrl;
	          user.profile.website = profile._json.publicProfileUrl;
	          user.save((err) => {
	            done(err, user);
	          });
	        }
	      });
	    });
	  }
	}));
}
