let config = global.gConfig;
// CONFIGURE AND INITIALISE PASSPORT 
	var passport = require('passport')

	passport.serializeUser(function(user, done) {
	  done(null, user);
	});

	passport.deserializeUser(function(user, done) {
	  done(null, user);
	});


	var LocalStrategy = require('passport-local').Strategy;

	// username/password
	passport.use(new LocalStrategy(
	  function(username, password, done) {
		database.User.findOne({ username: username,password:password }, function (err, user) {
		  if (err) { return done(err); }
		  if (!user) {
			return done(null, false, { message: 'Incorrect login details' });
		  }
		 // console.log('LOGIN',user.toObject());
		  return done(null, user);
		});
	  }
	));


	var GoogleStrategy = require('passport-google-oauth20').Strategy;
	passport.use(new GoogleStrategy({
		clientID: config.googleClientId,
		clientSecret: config.googleClientSecret,
		callbackURL: config.authServer + '/googlecallback'
	  },
	  function(accessToken, refreshToken, profile, cb) {
		if (profile && profile.emails && profile.emails.length > 0) {
				let email = profile.emails[0].value
				findOrCreateUser(profile.displayName,email,cb);
			} else {
				cb('google did not provide an email',null);
			}
		}
	));



	var TwitterStrategy = require('passport-twitter').Strategy;

	passport.use(new TwitterStrategy({
		consumerKey: config.twitterConsumerKey,
		consumerSecret: config.twitterConsumerSecret,
		callbackURL: config.authServer + '/twittercallback',
		userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
	  },
	  function(token, tokenSecret, profile, cb) {
		//	console.log(['twitter LOGIN STRAT',token, tokenSecret, profile,profile.emails,profile.entities,profile.status,profile.photos]);
			if (profile && profile.emails && profile.emails.length > 0) {
				let email = profile.emails[0].value
				findOrCreateUser(profile.displayName,email,cb);
			} else {
				cb('twitter did not provide an email',null);
			}
	  }
	));


	var FacebookStrategy = require('passport-facebook').Strategy;

	passport.use(new FacebookStrategy({
		clientID: config.facebookAppId,
		clientSecret: config.facebookAppSecret,
		callbackURL: config.authServer + '/facebookcallback',
		profileFields: ['id', 'displayName', 'photos', 'email']
	  },
	  function(token, tokenSecret, profile, cb) {
			//console.log(['FacebookStrategy LOGIN STRAT',token, tokenSecret, profile,profile.emails,profile.entities,profile.status,profile.photos]);
			if (profile && profile.emails && profile.emails.length > 0) {
				let email = profile.emails[0].value
				findOrCreateUser(profile.displayName,email,cb);
			} else {
				cb('FacebookStrategy did not provide an email',null);
			}
	  }
	));
	// NO ACCESS TO EMAIL ADDRESS
	//var InstagramStrategy = require('passport-instagram').Strategy;

	//passport.use(new InstagramStrategy({
		//clientID: config.instagramClientId,
		//clientSecret: config.instagramClientSecret,
		//callbackURL: config.authServer+"/instagramcallback"
	  //},
	  //function(accessToken, refreshToken, profile, cb) {
		//console.log([profile,profile.emails]);
		//if (profile && profile.emails && profile.emails.length > 0) {
			//let email = profile.emails[0].value
			//findOrCreateUser(profile.displayName,email,cb);
		//} else {
			//cb('instagram did not provide an email',null);
		//}
	  //}
	//));

	var GithubStrategy = require('passport-github2').Strategy;

	passport.use(new GithubStrategy({
		clientID: config.githubClientId,
		clientSecret: config.githubClientSecret,
		callbackURL: config.authServer+"/githubcallback",
	  },
	  function(accessToken, refreshToken, profile, cb) {
		//  console.log([profile,profile.emails]);
		console.log(['GITHUB STRATEGRY ',profile])
		if (profile && profile.emails && profile.emails.length > 0) {
			let email = profile.emails[0].value
			console.log(['GITHUB STRATEGY ',email])
			findOrCreateUser(profile.displayName ? profile.displayName : profile.username,email,cb);
		} else {
			cb('github did not provide an email',null);
		}
	  }
	));
    
module.exports = passport
