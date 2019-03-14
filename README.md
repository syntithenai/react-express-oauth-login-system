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

```git clone https://github.com/syntithenai/react-express-oauth-login-system.git```

Copy config.sample.js to config.js and edit to update any configuration settings including email delivery and external api keys.

Edit src/App.js and update the properties to disable any unused external authentication buttons.

```
npm i
npm start
```

Open https://localhost/ 


## Integration into your application


1. Add the provided routes to your express server.
	- /index.js provides an example of integrating the login system routes.
	
```
router.use('/api/login',require('react-express-oauth-login-system/routes/loginsystem.js'));
```

2. Use the LoginSystem component on the root client route (/)  in your React application
	- React Router is required
	- /src/App.js provides an example of integrating the login UI components into your React app.

```
const routeProps = {
		authServer: 'https://localhost/api/login',
		// pass an updated user back to the application
		setUser: this.setUser, 
		// pass an updated user that just logged in (so perhaps redirect)
		onLogin: this.onLogin,
		onLogout: this.onLogout,
		// hook for waiting overlay
		startWaiting: this.startWaiting,
		stopWaiting: this.stopWaiting,
		// enable external authentication services buttons
		loginButtons: ['google','twitter','facebook','github']
	}
	return (
      <div className="App">
        {this.state.waiting && <div className="overlay" onClick={this.stopWaiting} ><img alt="loading" src='/loading.gif' /> </div>}
        <header className="App-header">
           <Router><div style={{width:'70%'}}>
           <Route  exact={true} path='/' component={HomePage} />
		   <PropsRoute path='/' component={LoginSystem}  {...routeProps}  />
        </div></Router>
        </header>
      </div>
    );

```

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

To secure an endpoint, include the authenticate function and use it as express middleware.

```
var authenticate = require('react-express-oauth-login-system/authenticate.js')

// An api endpoint that returns a short list of items
router.get('/api/getList',authenticate, (req,res) => {
	var list = ["item1", "item2", "item3"];
	// note that res.user is available after authentication
	res.json([{items:list,user:res.user}]);
	console.log('Sent list of items');
});


```

## Login With External Services

To enable login using external services you will need a key and secret from each of the services. Obtaining these keys may include filling a number of forms to justify your use of their API.

Keys are added to the config.js file.

To request keys visit the following links.

https://github.com/settings/applications

https://developer.twitter.com/

https://www.instagram.com/developer/

https://developers.facebook.com/apps/

https://console.developers.google.com/
