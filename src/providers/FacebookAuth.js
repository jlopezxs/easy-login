import { Strategy as FacebookStrategy } from 'passport-facebook';

/**
 * Sign in with Facebook.
 */
export default function facebookAuth({ UserModel, urlPath, passport, facebookId, facebookSecret,
  profileFields = ['name', 'email', 'link', 'locale', 'timezone'] }) {

  passport.use(new FacebookStrategy({
    clientID: facebookId || process.env.FACEBOOK_ID,
    clientSecret: facebookSecret || process.env.FACEBOOK_SECRET,
    callbackURL: `/${urlPath}/facebook/callback`,
    profileFields,
    passReqToCallback: true
  }, (req, accessToken, refreshToken, profile, done) => {
    if (req.user) {
      UserModel.findOne({ facebook: profile.id }, (err, existingUser) => {
        if (err) { return done(err); }
        if (existingUser) {
          req.flash('errors', { msg: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
          done(err);
        } else {
          UserModel.findById(req.user.id, (err, user) => {
            if (err) { return done(err); }
            user.facebook = profile.id;
            user.tokens.push({ kind: 'facebook', accessToken });
            user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
            user.profile.gender = user.profile.gender || profile._json.gender;
            user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
            user.save((err) => {
              req.flash('info', { msg: 'Facebook account has been linked.' });
              done(err, user);
            });
          });
        }
      });
    } else {
      UserModel.findOne({ facebook: profile.id }, (err, existingUser) => {
        if (err) { return done(err); }
        if (existingUser) {
          return done(null, existingUser);
        }
        UserModel.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
          if (err) { return done(err); }
          if (existingEmailUser) {
            req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.' });
            done(err);
          } else {
            const user = new User();
            user.email = profile._json.email;
            user.facebook = profile.id;
            user.tokens.push({ kind: 'facebook', accessToken });
            user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
            user.profile.gender = profile._json.gender;
            user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
            user.profile.location = (profile._json.location) ? profile._json.location.name : '';
            user.save((err) => {
              done(err, user);
            });
          }
        });
      });
    }
  }));
}
