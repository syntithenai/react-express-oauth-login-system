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
                authServer={process.env.REACT_APP_authServer} 
                 authServerHostname={process.env.REACT_APP_authServerHostname} 
            >
            {(user,setUser,getAxiosClient,getMediaQueryString,getCsrfQueryString, isLoggedIn, loadUser, useRefreshToken, logout, saveUser) => {
                
                    function   getList() {
                          //console.log(['GeT LIST '])
                          // use client factory for auto headers - csrf and auth
                          let client = getAxiosClient(user && user.token && user.token.access_token ? user.token.access_token : '')
                          client.get('/api/getlist', {
                              headers: {
                                'Content-Type': 'application/json',
                              },
                            }).then(function(res) {
                                //console.log(['GOT LIST ',res])
                                return res.data  
                            }).then(function(data) {
                                
                                that.setState({list:data})
                            }).catch(function(err) {
                                console.log(err);
                            });	
                      }
                
                
                  	const protectedMediaImage = '/api/protectedimage?'+getMediaQueryString(user && user.token && user.token.refresh_token ? user.token.refresh_token : '')
                    const csrfMediaImage = '/api/csrfimage?'+getCsrfQueryString()  
                    return  <React.Fragment>
                        {this.state.waiting && <div className="overlay" onClick={this.stopWaiting} >LOADING</div>}
                        <header className="App-header">
                           {isLoggedIn() && <div><button onClick={getList} >GET LIST</button> {JSON.stringify(this.state.list)}</div>}
                           <Router>
                                <div style={{width:'70%'}}>
                                    <img style={{height: '30px'}} src={csrfMediaImage} alt='csrf' />
                                    <img style={{height: '30px'}}  src={protectedMediaImage} alt='Not logged in' />
                                    {!isLoggedIn() && <a href="/login/login"><button className='btn btn-primary'>Login</button></a>}
                                    {isLoggedIn() && <a href="/login/profile"><button className='btn btn-primary'>Profile</button></a>}
                                    <hr style={{backgroundColor:'white'}}/>
                                    <Route path='/login'  render={
                                    (props) => <LoginSystem  
                                       match={props.match}
                                       location={props.location}
                                       history={props.history}
                                       authServer={process.env.REACT_APP_authServer} 
                                        // also need external link to auth server (combind authServerHostname + authServer) for google, github, .. login buttons
                                        authServerHostname={process.env.REACT_APP_authServerHostname} 
                                        // update for login api location, use package.json proxy config to map other host/port to local link
                                       loginButtons={process.env.REACT_APP_loginButtons?process.env.REACT_APP_loginButtons.split(","):[]}
                                        // optional callbacks
                                        logoutRedirect={'/'}
                                       user={user} setUser={setUser} isLoggedIn={isLoggedIn} logout={logout} saveUser={saveUser} startWaiting={that.startWaiting} stopWaiting={that.stopWaiting} 
                                     />}
                                     />
                                </div>
                           </Router>
                        </header>
                    </React.Fragment>
                }
            }
        </LoginSystemContext>
      </div>
    );
  }
}

export default App;
// <Route  exact={true} path='/' component={RedirectToLogin} />
		  
          
