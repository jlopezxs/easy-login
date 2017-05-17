import passport from 'passport';
import requireDir from 'require-dir';
import capitalize from 'lodash.capitalize';

const authProviders = requireDir('./providers');

/**
 * @param  {Mongoose.Model} UserModel
 * @param  {Express.Application} app
 * @param  {String} [urlPath='auth']
 * @param  {Object} [providersConfig={}]
 * @return {Passport}
 */
export default function easyLogin({ UserModel, app, urlPath = 'auth', providersConfig = {} } = {}) {

	passport.serializeUser((user, done) => {
	  done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
	  User.findById(id, (err, user) => {
	    done(err, user);
	  });
	});

	const authProvidersNames = Object.keys(providersConfig);
	authProvidersNames.forEach(authProviderName => {
		const capitalizedAuthProviderName = capitalize(authProviderName);
		const fnName = `${capitalizedAuthProviderName}Auth`;
		const authProviderFunction = authProviders[fnName];

    if (authProviderFunction && typeof authProviderFunction.default !== 'function') {
      throw new Error(`No AuthProvider for: ${authProviderName}`);
    }

		const params = Object.assign({}, { UserModel, passport, urlPath }, providersConfig[authProviderName]);
    authProviderFunction.default(params);

		app.get(`/${urlPath}/${authProviderName}`, passport.authenticate(authProviderName, { scope: params.scope, state: params.state }));
		app.get(`/${urlPath}/${authProviderName}/callback`, passport.authenticate(authProviderName, { failureRedirect: '/login' }), (req, res) => {
		  res.redirect(req.session.returnTo || '/');
		});
	});

	return passport;
}
