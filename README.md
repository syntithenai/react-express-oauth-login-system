# React Login System

This package provides an easy way to add user registration and login to a React web application. 

Add the routes to your express application and use the LoginSystem component in your client.

It integrates a complete oauth2 server implementation and uses that for local authentication and token generation so passwords are never given to the web clients.

The delegated authentication provided by the oauth2 server is useful to allow third party web sites granular access to your application data.  For example, a public facing oauth server is required when developing apps for Google Home or Amazon Alexa that require user identification and account linking.

It also integrates passport.js to enable login using Google, Twitter, Facebook and Github. Passport includes solutions for many more authentication providers.

In the box
- React components to implement a login and registration system.
- Express routes to support login, registration, password recovery, oauth authorization and oauth login from various providers using passport.js
- Express routes to implement an oauth2 server using the oauth library and the mongodb
- Example web application.

Features
- Configurable CSRF checks for appropriates routes while leaving oauth routes and passport callback routes exposed.
- JWT tokens to allow query free distributed authentication
- Helper functions to create an axios client that supports csrf and authentication without extra effort.
- Refresh token flow using HttpOnly cookies to keep users logged in securely
- CORS headers to support distributed authentication
- LoginSystemContext Component to hold user state above application and LoginSystem component to add as DOM route.
- Built in privacy page

## Quickstart

The demo assumes there is a mongodb server running on localhost. See example/config.js for details.

To see the suite in action

```
git clone https://github.com/syntithenai/react-express-oauth-login-system.git
```

- Copy example/config.sample.js to example/config.js and edit to update any configuration settings including email delivery and external api keys.
- Edit example/src/App.js and update the properties to disable any unused external authentication buttons.


```
cd react-express-oauth-login-system/
npm i
cd example
cp config.js.sample config.js
# nano config.js
npm i
npm start
```

Open https://localhost/ 


## Integration into your application

0. Install the package from npm

```
npm i react-express-oauth-login-system
```

1. Add the provided routes to your express server.
	- /index.js provides an example of integrating the login system routes.
	
```
var loginSystem = require('react-express-oauth-login-system/routes/loginsystem.js')
// async connect to db THEN add routes, start server
loginSystem(config).then(function({router, authenticate,csrf}) {

    const app = express();
    app.use(bodyParser.json());
    app.use(cookieParser());
    // session required for twitter login
    app.use(session({ secret: config.sessionSalt ? config.sessionSalt : 'board GOAT boring do boat'}));
    app.use('/api/login',loginRouter);
    // endpoint requiring authentication
    app.use('/protected',authenticate,loginRouter);
    
     app.listen(port, () => {
      console.log(`Login system example listening at http://localhost:${port}`)
    })
})
    
```

2. Use the LoginSystem component on the root client route (/)  in your React application
	- React Router is required, the login system assumes that it exists inside a <Router> element as a <PropsRoute>
	- /src/App.js provides an example of integrating the login UI components into your React app.

```
import LoginSystem from 'react-express-oauth-login-system'


<Router><div style={{width:'70%'}}>
   <Route  exact={true} path='/' component={RedirectToLogin} />
   <PropsRoute path='/' component={LoginSystem}  
   // update for login api location, use package.json proxy config to map other host/port to local link
    authServer={'/api/login'} 
    // also need external link to auth server (combind authServerHostname + authServer) for google, github, .. login buttons
    authServerHostname={'http://localhost:5000'} 
    loginButtons={['google','twitter','facebook','github','amazon']}
    setUser={this.setUser} onLogin={this.onLogin} onLogout={this.onLogout} startWaiting={this.startWaiting} stopWaiting={this.stopWaiting} 
   />
</div></Router>

```

The email templates for registration and forgot password can be set in config.

To make layout changes, extend the LoginSystem class and override render. 



3. Protecting your web API's

All requests to your secured API endpoints must include an Authorization header including a bearer token

```
	fetch(that.props.authServer+'/saveuser', {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer '+user.token.access_token
	  },
	  body: JSON.stringify(user)
	})
```

The module exports a number of helper functions to React including getAxiosClient that adds authentications and csrf headers to ajax requests automatically.
```
import {getCookie,getAxiosClient} from './helpers'  
this.axiosClient = getAxiosClient();
that.axiosClient( {
  url: that.props.authServer+'/signin',
  method: 'post',
  data: {
    username: user,
    password: pass
  }
})
.then(this.checkStatus)
.then(function(res) {
  return res.data;  
})
.then(function(user) {})
```



## Login With External Services

To enable login using external services you will need a key and secret from each of the services. Obtaining these keys may include filling a number of forms to justify your use of their API.

Keys are added to the config.js file.

To request keys visit the following links.

https://github.com/settings/applications

https://developer.twitter.com/

https://developers.facebook.com/apps/

https://console.developers.google.com/

https://developer.amazon.com/settings/console/securityprofile/overview.html




## Authorizing external services

External services can use the oauth routes to obtain a token to access your API directly.
In developing skills for Alexa(https://developer.amazon.com/) or Google Actions (https://console.actions.google.com/), 
the project administration website allows for entering
- authorization URL
- token URL
- clientId
- clientSecret

The authorization and token urls are immediately under the path that you located the loginsystem express routes.
For example 
- https://localhost/api/login/authorize
- https://localhost/api/login/token


[Some services also allow a choice between implicit and authorization code flows. Use authorization code.]


In the mongo database, create an entry in the oauthclients collection for each external service that can authenticate.


Client entries can also include fields to be used on the authorization page that is loaded when the external service redirects to your website to ask the user permission to grant access. 
- name
- website_url
- privacy_url


```
mongo browserexample
> db.users.insert({"_id" : ObjectId("5c859a7a64997a72a107065b"), "clientId" : "newclient", "clientSecret" : "testpass", "name" : "New Client", "website_url" : "https://client.com", "privacy_url" : "https://client.com/privacy", "grants" : [ "authorization_code", "password", "refresh_token", "client_credentials" ], "redirectUris" : []})
```

The server creates an initial client based on configuration settings for local authentication purposes. Examine that item for details.

```
mongo browserexample
> db.oauthclients.find()
{ "_id" : ObjectId("5c859a7a64997a72a107065b"), "clientId" : "test", "clientSecret" : "testpass", "name" : "Test Client", "website_url" : "https://localhost", "privacy_url" : "https://localhost/privacy", "grants" : [ "authorization_code", "password", "refresh_token", "client_credentials" ], "redirectUris" : [ ], "__v" : 0 }
```



## Cross Site Request Forgery (CSRF) Protection

The example provides code to protect against Cross Site Request Forgery by
- setting a cookie csrf-token when the react app loads  (see routes/loginsystem.js)
- ensuring that the ajax library used in React sets the header x-csrf-token to the value of the cookie  (see src/LoginSystem.js)
- checking that the cookie and the header match for routes that need protecting. Externally available API endpoints should not use CSRF checking.


## Links

- https://github.com/14gasher/oauth-example#url
- https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/#refresh_token
- https://oauth2-server.readthedocs.io/en/latest/index.html
- https://github.com/slavab89/oauth2-server-example-mongodb
