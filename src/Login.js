/* eslint-disable */ 

import React, { Component } from 'react';
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'

import googleImage from './images/google-brands.svg'
import twitterImage from './images/twitter-brands.svg'
import facebookImage from './images/facebook-brands.svg'
import githubImage from './images/github-brands.svg'

let brandImages={google:googleImage,twitter:twitterImage,facebook:facebookImage,github:githubImage}

export default  class Login extends Component {
    
    constructor(props) {
        super(props);
        this.state={signin_username:'',signin_password:'',rememberme:false};
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
			let image = brandImages[key]
			return <span key={key} >&nbsp;<a className='btn btn-primary' href={link} ><img alt={title} src={image} style={{marginRight: '0.6em', height: '2em'}} />{title}</a></span>                         
		 });
		 
		
           return <div> 
         
         <Link to="/login/forgot" style={{clear:'both',display:'inline'}} ><div style={{float:'right', marginRight:'0.3em',marginLeft:'0.5em'}} className='btn btn-primary' >Forgot Password</div></Link>
         <Link to="/login/register" style={{clear:'both',display:'inline'}} ><div style={{float:'right', marginRight:'0.3em',marginLeft:'0.5em'}} className='btn btn-primary' >Register</div></Link>
          <h1 className="h3 mb-3 font-weight-normal" style={{textAlign:'left'}}>Sign in</h1>
         {loginButtonsEnabled && loginButtonsEnabled.length > 0 && <div style={{float:'right'}}> using {loginButtons}  <br/> </div>}
             
           <form className="form-signin" onSubmit={(e) => {e.preventDefault();  this.props.submitSignIn(this.state.signin_username,this.state.signin_password); return false;}}>
                             
   
          {this.props.warning_message && <div className='warning-message' style={{clear:'both'}} >{this.props.warning_message}</div>}
                            
          <label htmlFor="inputEmail" className="sr-only">Email address</label>
          <input type="text" name="signin_username" id="inputEmail" className="form-control" placeholder="Email address" required  onChange={this.change} value={this.state.signin_username} autoComplete="signin_username" />
          <label htmlFor="inputPassword" className="sr-only">Password</label>
          <input type="password" name="signin_password" id="inputPassword" className="form-control" placeholder="Password" required onChange={this.change}  value={this.state.signin_password} autoComplete="signin_password" />

          <button className="btn btn-lg btn-success btn-block" type="submit">Sign in</button>  
                   
        </form>
       </div>
    };
}
 
