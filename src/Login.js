/* eslint-disable */ 

import React, { Component } from 'react';
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'

export default  class Login extends Component {
    
    constructor(props) {
        super(props);
        this.state={signin_username:'aa@syntithenai.com',signin_password:'aaa',rememberme:false};
        this.change = this.change.bind(this);
    };
         
    change(e) {
        var state = {};
        state[e.target.name] =  e.target.value;
        this.setState(state);
        return true;
    };
     
    componentDidMount() {
        if (this.props.isLoggedIn()) {
	         this.props.history.push("/login/profile");
       }
    }; 
    componentDidUpdate() {
        if (this.props.isLoggedIn()) {
	       this.props.history.push("/login/profile");
       }
    };
     
    render() {
		let that = this;
		let loginButtonsEnabled = this.props.loginButtons && this.props.loginButtons.length > 0 ? this.props.loginButtons : []
		 let loginButtons = loginButtonsEnabled.map(function(key) {
			let link = that.props.authServer + '/'+ key;
			let title = key.slice(0,1).toUpperCase() + key.slice(1);
			return <span key={key} >&nbsp;<a className='btn btn-primary' href={link} ><img alt={title} src={'/'+key+'-brands.svg'} style={{marginRight: '0.6em', height: '2em'}} />{title}</a></span>                         
		 });
		 
		
           return  <form className="form-signin" onSubmit={(e) => {e.preventDefault();  this.props.submitSignIn(this.state.signin_username,this.state.signin_password); return false;}}>
         
         <Link to="/login/forgot" style={{clear:'both',display:'inline'}} ><button style={{float:'right', marginRight:'0.3em',marginLeft:'0.5em'}} className='btn btn-primary' >Forgot Password</button></Link>
         <Link to="/login/register" style={{clear:'both',display:'inline'}} ><button style={{float:'right', marginRight:'0.3em',marginLeft:'0.5em'}} className='btn btn-primary' >Register</button></Link>
          <h1 className="h3 mb-3 font-weight-normal" style={{textAlign:'left'}}>Sign in</h1>
         {loginButtonsEnabled && loginButtonsEnabled.length > 0 && <div style={{float:'right'}}> using {loginButtons}  <br/> </div>}                      
   
          {this.props.warning_message && <div className='warning-message' style={{clear:'both'}} >{this.props.warning_message}</div>}
                            
          <label htmlFor="inputEmail" className="sr-only">Email address</label>
          <input type="text" name="signin_username" id="inputEmail" className="form-control" placeholder="Email address" required  onChange={this.change} value={this.state.signin_username} autoComplete="signin_username" />
          <label htmlFor="inputPassword" className="sr-only">Password</label>
          <input type="password" name="signin_password" id="inputPassword" className="form-control" placeholder="Password" required onChange={this.change}  value={this.state.signin_password} autoComplete="signin_password" />

          <button className="btn btn-lg btn-success btn-block" type="submit">Sign in</button>  
                   
        </form>
       
    };
}
 
