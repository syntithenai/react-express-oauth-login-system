/* eslint-disable */ 

import React, { Component } from 'react';
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'


export default  class ForgotPassword extends Component {
    
    constructor(props) {
        super(props);
        this.state={signin_username:'syntithenai@gmail.com',signin_password:'aaa',rememberme:false};
        this.change = this.change.bind(this);
    };
         
    change(e) {
        var state = {};
        state[e.target.name] =  e.target.value;
        this.setState(state);
        return true;
    };
     
     
    render() {
           return  <form className="form-signin" onSubmit={(e) => {e.preventDefault(); this.props.recoverPassword(this.state.email,this.state.password,this.state.password2); return false} }>
        
                                
         <Link to="/login/register" style={{clear:'both',display:'inline'}} ><button style={{float:'right', marginRight:'0.3em',marginLeft:'0.5em'}} className='btn btn-primary' >Register</button></Link>
         
         <Link to="/login/login" style={{clear:'both',display:'inline'}} ><button style={{float:'right', marginRight:'0.3em',marginLeft:'0.5em'}} className='btn btn-primary' >Login</button></Link>
        
          <h1 className="h3 mb-3 font-weight-normal" style={{textAlign:'left'}}>Password Recovery</h1>
           
          {this.props.warning_message && <div className='warning-message'  >{this.props.warning_message}</div>}
                            
          <fieldset className='col-12' >
				<label htmlFor="email" className='row'>Email </label><input  autocomplete='signin_email'  id="email" type='email' name='email' onChange={this.change} />
				<label htmlFor="password" className='row'>New Password</label> <input  autoComplete="off"  id="password" type='password' name='password' onChange={this.change} />
				<label htmlFor="password2" className='row'>Repeat New Password</label><input  autoComplete="off"  id="password2" type='password' name='password2' onChange={this.change} />
				<br/>
				<br/>
				<button className="btn btn-lg btn-success btn-block" type="submit">Send Recovery Email</button>  

			</fieldset>
        </form>
       
    };
}
  

