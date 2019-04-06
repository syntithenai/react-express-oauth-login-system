import React, { Component } from 'react';
import './App.css';
import LoginSystem,{getAxiosClient,getMediaQueryString,getCsrfQueryString}  from 'react-express-oauth-login-system'

import {BrowserRouter as Router,Route,Link} from 'react-router-dom'
import PropsRoute from './PropsRoute'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


class App extends Component {
	
  constructor(props) {
	  super(props);
	  this.state = {waiting: false,list:[]};
	  this.setUser = this.setUser.bind(this);
	  this.onLogin = this.onLogin.bind(this);
	  this.onLogout = this.onLogout.bind(this);
	  this.startWaiting = this.startWaiting.bind(this);
	  this.stopWaiting = this.stopWaiting.bind(this);
	  this.getList = this.getList.bind(this);
	  
	  
  }	
	

  setUser(user) {
	  this.setState({user:user});	  
  }	
	
  onLogin(user,props) {
	  console.log(['APP LOGIN',user,props])
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
  
  getList() {
	  let that = this;
	  console.log('getliste')
	  // use client factory for auto headers - csrf and auth
	  let client = getAxiosClient()
	  client.get('/api/getlist', {
		  headers: {
			'Content-Type': 'application/json',
		  },
		}).then(function(res) {
			return res.data  
		}).then(function(data) {
			console.log(['GOT LIST',data]);
			that.setState({list:data})
		}).catch(function(err) {
			console.log(err);
		});	
  }
	      
  render() {
    const RedirectToLogin = function(props) {
		props.history.push("/login");
		return <b></b>;
	};
		let protectedMediaImage = '/api/protectedimage?'+getMediaQueryString()
		let csrfMediaImage = '/api/csrfimage?'+getCsrfQueryString()
	   
      return (
      <div className="App">
        {this.state.waiting && <div className="overlay" onClick={this.stopWaiting} ><img alt="loading" src='/loading.gif' /> </div>}
        <header className="App-header">
           {this.state.user && this.state.user.token && <div><button onClick={this.getList} >GET LIST</button> {JSON.stringify(this.state.list)}</div>}
           <Router>
           <div style={{width:'70%'}}>
       CSRF <img style={{height: '30px'}} src={csrfMediaImage} alt='csrf' />
       <img style={{height: '30px'}}  src={protectedMediaImage} alt='Not logged in' />
        <Link to="/login/login" style={{clear:'both',display:'inline'}} ><div style={{float:'right', marginRight:'0.3em',marginLeft:'0.5em'}} className='btn btn-primary' >Login</div></Link>
                
			<hr style={{backgroundColor:'white'}}/>
           <Route  exact={true} path='/' component={RedirectToLogin} />
		   <PropsRoute path='/' component={LoginSystem}  authServer={'/api/login'} setUser={this.setUser} onLogin={this.onLogin} onLogout={this.onLogout} startWaiting={this.startWaiting} stopWaiting={this.stopWaiting} loginButtons={['google','twitter','facebook','github']} />
        </div>
        </Router>
        </header>
      </div>
    );
  }
}

export default App;
