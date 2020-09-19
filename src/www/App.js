import React, { Component } from 'react';
import './App.css';
import {LoginSystem,LoginSystemContext, getAxiosClient,getMediaQueryString,getCsrfQueryString} from 'react-express-oauth-login-system-components'

import {BrowserRouter as Router, Route, Link} from 'react-router-dom'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {
	
  constructor(props) {
	  super(props);
	  this.state = {waiting: false,list:[]};
	  this.setUser = this.setUser.bind(this);
      this.startWaiting = this.startWaiting.bind(this);
	  this.stopWaiting = this.stopWaiting.bind(this);
  }	
	

  setUser(user) {
	  this.setState({user:user});	  
  }	

  startWaiting() {
	  this.setState({waiting:true})
  }
  
  stopWaiting() {
	  this.setState({waiting:false})
  }
  

	      
  render() {
    	
	   let that = this;
      return (
      <div className="App">
            <LoginSystemContext  
            >
            {(user,setUser,getAxiosClient,getMediaQueryString,getCsrfQueryString, isLoggedIn, loadUser, useRefreshToken, logout, authServer, authServerHostname, allowedOrigins) => {
                  return  <React.Fragment>
                       {this.state.waiting && <div className="overlay" onClick={this.stopWaiting} >LOADING</div>}
                        <header className="App-header">
                           <Router>
                                <div style={{width:'70%'}}>
                                    <Route path='/'  render={
                                    (props) => <LoginSystem  
                                       match={props.match}
                                       location={props.location}
                                       history={props.history}
                                       authServer={authServer} 
                                        // also need external link to auth server (combind authServerHostname + authServer) for google, github, .. login buttons
                                       authServerHostname={authServerHostname} 
                                       logoutRedirect={'/'}
                                       user={user} setUser={setUser} isLoggedIn={isLoggedIn} logout={logout}  startWaiting={that.startWaiting} stopWaiting={that.stopWaiting} allowedOrigins={allowedOrigins}
                                     />}
                                     />
                                </div>
                           </Router>
                        </header>
                    </React.Fragment>
           
              
            }}
        </LoginSystemContext>
      </div>
    );
  }
}

export default App;
// <Route  exact={true} path='/' component={RedirectToLogin} />
		  
          
