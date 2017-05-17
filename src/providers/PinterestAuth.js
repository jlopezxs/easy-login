import { OAuth2Strategy } from 'passport-oauth';
/**
 * Pinterest API OAuth.
 */
export default function pinterestAuth({ UserModel, passport, pinterestId, pinterestSecret, pinterestRedirectUrl }) {
	passport.use('pinterest', new OAuth2Strategy({
	  authorizationURL: 'https://api.pinterest.com/oauth/',
	  tokenURL: 'https://api.pinterest.com/v1/oauth/token',
	  clientID: pinterestId || process.env.PINTEREST_ID,
	  clientSecret: pinterestSecret || process.env.PINTEREST_SECRET,
	  callbackURL: pinterestRedirectUrl || process.env.PINTEREST_REDIRECT_URL,
	  passReqToCallback: true
	},
	  (req, accessToken, refreshToken, profile, done) => {
	    User.findById(req.user._id, (err, user) => {
	      if (err) { return done(err); }
	      user.tokens.push({ kind: 'pinterest', accessToken });
	      user.save((err) => {
	        done(err, user);
	      });
	    });
	  }
	));
}
