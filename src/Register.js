/* eslint-disable */ 

import React, { Component } from 'react';
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'
var faker = require('faker');
           
export default class Register extends Component {
    
    constructor(props) {
        super(props);
        this.state={
            warning_message:'',
            signin_warning_message:'',
            signup_warning_message:'',
            email_login:'',
            password_login:'',
            name:'',
            email:'',
            password:'',
            password2:'',
            justSignedUp: false,
            forgotPassword: false,
            avatar: faker.commerce.productAdjective()+faker.name.firstName()
            
        }
        this.change = this.change.bind(this);
        this.submitSignUp = this.submitSignUp.bind(this);
        
    };
    
    
    submitSignUp(e) {
       // console.log('SSU');
       // console.log(this.props);
        e.preventDefault();
        this.props.submitSignUp(this.state.name,this.state.avatar,this.state.email,this.state.password,this.state.password2);
        //this.setState('');
        return false;
    };
    
    change(e) {
        var state = {};
        state[e.target.name] =  e.target.value;
        this.setState(state);
        return true;
    };
    
    render() { //req,vars/
        return (
            <div id="registrationform" >
                
                <div style={{paddingLeft:'1em',clear:'both'}}>
                   
                    <form className="col-lg-12" style={{minWidth: '400px'}} method="POST" onSubmit={(e) => this.submitSignUp(e)}  >
                            <div className="form-group">
                         
                           
							<Link to="/login/forgot" >
							  <button style={{float:'right', marginRight:'0.3em',marginLeft:'0.5em'}} className='btn btn-primary' >Forgot Password</button></Link>
                           <Link to="/login/login" style={{clear:'both',display:'inline'}} ><button style={{float:'right', marginRight:'0.3em',marginLeft:'0.5em'}} className='btn btn-primary' >Login</button></Link>

                            <h3 style={{textAlign:'left'}} className="card-title">Registration</h3>
                           
                           {this.state.warning_message && <div className='warning-message' >{this.state.warning_message}</div>}
                            {this.props.warning_message && <div className='warning-message' >{this.props.warning_message}</div>}
                             {this.state.signup_warning_message && <div style={{float:'right'}}  className='warning-message'>{this.state.signup_warning_message}</div>}

                                <label htmlFor="name" style={{float:'left'}}>Name</label><input className='form-control' autoComplete="false" id="name" type='text' value={this.state.name} name='name' onChange={this.change} />
                                <label htmlFor="avatar" className='row'>Avatar </label><input className='form-control' autoComplete="false" id="avatar" type='text'  name='avatar' value={this.state.avatar} onChange={this.change} />
                                <label htmlFor="email" className='row'>Email </label><input className='form-control' autoComplete="false" id="email" type='text' name='email' value={this.state.email} onChange={this.change} />
                                <label htmlFor="password" className='row'>Password</label> <input value={this.state.password} className='form-control' autoComplete="false"  id="password" type='password' name='password' onChange={this.change} />
                                <label htmlFor="password2" className='row'>Repeat Password</label><input className='form-control'  autoComplete="false"  id="password2" type='password' name='password2' value={this.state.password2} onChange={this.change} />
                                
                            </div>
                            <br/>
                            <br/>
                            <button  className='btn btn-lg btn-success btn-block'>Register</button>
                    </form>
                </div>
              
            </div>
        )
    }


}
  
