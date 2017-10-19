## easy-login

[![Greenkeeper badge](https://badges.greenkeeper.io/jlopezxs/easy-login.svg)](https://greenkeeper.io/)

> Social Login for you expressjs apps in the easiest way

Allows login to *Facebook*, *Github*, *Google*, *Instagram*, *Linkedin*, *Pinterest*, *Steam* and *Twitter*.

## Requirements and Use

```bash
// npm install easy-login --save
yarn add easy-login
```

### Use
```javascript
import express from 'express';
import easyLogin from 'easy-login';
import log from 'log-decorator';

import UserModel from './models/UserModel';

const app = express();

easyLogin({
	UserModel: UserModel,
	app: app,
	providersConfig: {
		facebook: {
			facebookId: process.env.FACEBOOK_ID,
			facebookSecret: process.env.FACEBOOK_SECRET,
			scope: ['read_stream', 'publish_actions']
		},
		google: true
	}
});
```

The package easy-login automatically generates two routes to have social login in your application:

`/auth/facebook`

`/auth/facebook/callback`

For this you need pass to easy login an instance of your express application and a user model like that:
```javascript
import mongoose from 'mongoose';

/**
 * User Schema
 */
const userSchema = new mongoose.Schema({
	name: { type: String, index: true },
	email: { type: String, unique: true, index: true },
	password: { type: String },
	facebook: { type: String },
	twitter: { type: String },
	google: { type: String },
	github: { type: String },
	instagram: { type: String },
	linkedin: { type: String },
	steam: { type: String },
	profile: {
	  name: { type: String },
	  gender: { type: String },
	  location: { type: String },
	  website: { type: String },
	  picture: { type: String }
	}
});

/**
 * Registration
 */
const User = mongoose.model('User', userSchema);
module.exports = User;
```
