# React Login System

This package provides an easy way to add user registration and login to a React web application. 

Add the routes to your express application and use the LoginSystem component in your client.

It integrates a complete oauth2 server implementation and uses that for local authentication and token generation so passwords are never given to the web clients.

The delegated authentication provided by the oauth2 server is useful to allow third party web sites granular access to your application data.  For example, a public facing oauth server is required when developing apps for Google Home or Amazon Alexa that require user identification.

It also integrates passport.js to enable login using Google, Twitter, Facebook and Github. Passport includes solutions for many more authentication providers.

In the box
- React components to implement a login and registration system.
- Routes to support login, registration, password recovery and oauth login from various providers using passport.js
- Routes to implement an oauth2 server using the oauth library and the mongodb integration from https://github.com/slavab89/oauth2-server-example-mongodb


## Quickstart

To see the suite in action

```git clone```

Copy config.sample.js to config.js and edit to update any configuration settings including email delivery and external api keys.

Edit src/App.js and update the properties to disable any unused external authentication buttons.

```
npm i
npm start
```

Open https://localhost/ 








## Protecting web API's

```npm install passport-http-bearer```
Configuration

```
passport.use(new BearerStrategy(
  function(token, done) {
    User.findOne({ token: token }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user, { scope: 'read' });
    });
  }
));
```login/login

Protect Endpoints
```
app.get('/api/me',
  passport.authenticate('bearer', { session: false }),
  function(req, res) {
    res.json(req.user);
  });
```



## Login With 

To enable login using external services you will need a key and secret from each of the services. Obtaining these keys may include filling a number of forms to justify your use of their API.

Keys are added to the config.js file.

To request keys visit the following links.

https://github.com/settings/applications

https://developer.twitter.com/

https://www.instagram.com/developer/

https://developers.facebook.com/apps/

https://console.developers.google.com/
