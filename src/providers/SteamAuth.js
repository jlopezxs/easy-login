import request from 'request';
import { Strategy as OpenIDStrategy } from 'passport-openid';

/**
 * Steam API OpenID.
 */
export default function steamAuth({ UserModel, urlPath, passport, steamKey }) {
	passport.use(new OpenIDStrategy({
	  apiKey: steamKey || process.env.STEAM_KEY,
	  providerURL: 'http://steamcommunity.com/openid',
	  returnURL: `/${urlPath}/steam/callback`,
	  realm: 'http://localhost:3000/',
	  stateless: true
	}, (identifier, done) => {
	  const steamId = identifier.match(/\d+$/)[0];
	  const profileURL = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey || process.env.STEAM_KEY}&steamids=${steamId}`;

	  User.findOne({ steam: steamId }, (err, existingUser) => {
	    if (err) { return done(err); }
	    if (existingUser) return done(err, existingUser);
	    request(profileURL, (error, response, body) => {
	      if (!error && response.statusCode === 200) {
	        const data = JSON.parse(body);
	        const profile = data.response.players[0];

	        const user = new User();
	        user.steam = steamId;
	        user.email = `${steamId}@steam.com`; // steam does not disclose emails, prevent duplicate keys
	        user.tokens.push({ kind: 'steam', accessToken: steamId });
	        user.profile.name = profile.personaname;
	        user.profile.picture = profile.avatarmedium;
	        user.save((err) => {
	          done(err, user);
	        });
	      } else {
	        done(error, null);
	      }
	    });
	  });
	}));
}
