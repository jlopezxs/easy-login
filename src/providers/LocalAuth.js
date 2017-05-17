import { Strategy as LocalStrategy } from 'passport-local';
/**
 * Sign in using Email and Password.
 */
export default function localAuth({ UserModel, passport }) {
	passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
	  User.findOne({ email: email.toLowerCase() }, (err, user) => {
	    if (err) { return done(err); }
	    if (!user) {
	      return done(null, false, { msg: `Email ${email} not found.` });
	    }
	    user.comparePassword(password, (err, isMatch) => {
	      if (err) { return done(err); }
	      if (isMatch) {
	        return done(null, user);
	      }
	      return done(null, false, { msg: 'Invalid email or password.' });
	    });
	  });
	}));
}
