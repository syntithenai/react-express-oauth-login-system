// COULD ALSO USE PASSPORT
//```npm install passport-http-bearer```
//Configuration

//```
//passport.use(new BearerStrategy(
  //function(token, done) {
    //User.findOne({ token: token }, function (err, user) {
      //if (err) { return done(err); }
      //if (!user) { return done(null, false); }
      //return done(null, user, { scope: 'read' });
    //});
  //}
//));
//```

//Protect Endpoints
//```
//app.get('/api/me',
  //passport.authenticate('bearer', { session: false }),
  //function(req, res) {
    //res.json(req.user);
  //});
//```

const oauthMiddlewares = require('./oauth/oauthServerMiddlewares');
const database = require('./oauth/database');
database.connect();

function authenticate() {
	return oauthMiddlewares.authenticate
}

module.exports = authenticate;
