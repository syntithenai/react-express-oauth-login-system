import React, { Component } from 'react';
import './App.css';
import LoginSystem from './LoginSystem'

import PropsRoute from './PropsRoute'

import {BrowserRouter as Router,Route} from 'react-router-dom'

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

//let config = require('./config');



class App extends Component {
	
  constructor(props) {
	  super(props);
	  this.state = {waiting: false};
	  this.setUser = this.setUser.bind(this);
	  this.onLogin = this.onLogin.bind(this);
	  this.onLogout = this.onLogout.bind(this);
	  this.startWaiting = this.startWaiting.bind(this);
	  this.stopWaiting = this.stopWaiting.bind(this);
  }	
	
  setUser(user) {
	  this.setState({user:user});	  
  }	
	
  onLogin(user,props) {
	 // console.log(['APP LOGIN',user,props])
	  this.setUser(user);
	  props.history.push("/login/profile");		
  }
  
  onLogout(user,props) {
	  //console.log(['APP LOGout',user])
	  this.setState({user:null});
	  props.history.push("/login/login");
  }
  
  startWaiting() {
	  this.setState({waiting:true})
  }
  
  stopWaiting() {
	  this.setState({waiting:false})
  }
	
  render() {
    const RedirectToLogin = function(props) {
		props.history.push("/login");
		return <b></b>;
	};
	const routeProps = {
		authServer: 'https://localhost/api/login',
		setUser: this.setUser, 
		onLogin: this.onLogin,
		onLogout: this.onLogout,
		startWaiting: this.startWaiting,
		stopWaiting: this.stopWaiting,
		loginButtons: ['google','twitter','facebook','github']
	}
	return (
      <div className="App">
        {this.state.waiting && <div className="overlay" onClick={this.stopWaiting} ><img alt="loading" src='/loading.gif' /> </div>}
        <header className="App-header">
           <Router><div style={{width:'70%'}}>
           <Route  exact={true} path='/' component={RedirectToLogin} />
		   <PropsRoute path='/' component={LoginSystem}  {...routeProps}  />
        </div></Router>
        </header>
      </div>
    );
  }
}

export default App;
