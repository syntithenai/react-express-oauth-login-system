/* eslint-disable */ 

import React, { Component } from 'react';
//import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'
import 'whatwg-fetch'
import {FaSignOutAlt as LogoutButton} from 'react-icons/fa';
import {FaSave as SaveButton} from 'react-icons/fa';
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'

//import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
 
export default class Profile extends Component {

    constructor(props) {
        super(props);
        this.change = this.change.bind(this);
        this.saveUser = this.saveUser.bind(this);
        this.state = {
            warning_message: '',
        }
    };
    
      
    change(e) {
        let state = {...this.props.user};
        var key = e.target.name;
        if (e.target.name.startsWith('fake_')) {
            key = e.target.name.slice(5);
        }
        state[key] =  e.target.value;
        this.props.setUser(state);
        return true;
    };
    
    
    saveUser(e) {
        e.preventDefault();
        this.props.saveUser(this.props.user);
        return false;
    };
    
    
    
    componentDidMount() {
		let that =this;
		if (!that.props.user) {
		   that.props.history.push("/login/login");
	   }
	};
    
    componentDidUpdate() {
        if (!this.props.user) {
           this.props.history.push("/login/login");
       }
    };
    
    render() {
		if (this.props.user) {
           return (
            <form method="POST" onSubmit={this.saveUser} autoComplete="false" >
                    <div className="form-group" style={{width: '70%',marginLeft:'4em'}} >
                               {this.props.isLoggedIn() && <Link to="/login/logout"   ><button className='btn btn-danger' style={{padding:'0.5em',margin:'0.5em',float:'right'}} ><LogoutButton  /> Logout</button></Link>}
                 <Link to="/login/login" style={{clear:'both',display:'inline'}} ><div style={{float:'right', marginRight:'0.3em',marginLeft:'0.5em'}} className='btn btn-primary' >Login</div></Link>
                            <h3  style={{textAlign: 'left'}} >Profile</h3>
                            {this.props.warning_message && <div className='warning-message'  >{this.props.warning_message}</div>}
         
                               <label htmlFor="username" className='row'>Email </label><input autoComplete="false" id="username" readOnly={true} type='text' name='username' onChange={this.change} value={this.props.user.username}   className="form-control" />
                                
                                <label htmlFor="name" className='row'>Name </label><input autoComplete="false" id="name" type='text' name='name' onChange={this.change} value={this.props.user.name} className="form-control" />
                                <label htmlFor="avatar" className='row'>Avatar </label><input autoComplete="false" id="avatar" type='text' name='avatar' onChange={this.change} value={this.props.user.avatar}  className="form-control" />
                                
                            
                                <label htmlFor="password" className='row'>Password</label> <input  autoComplete="false" id="password" type='password' name='fake_password' onChange={this.change}    className="form-control"  />
                                <label htmlFor="password2" className='row'>Repeat Password</label><input  autoComplete="false" id="password2" type='password' name='fake_password2' onChange={this.change}   className="form-control" />
                                <input id="id" type='hidden' name='_id' value={this.props.user._id} />
                                <br/>
                                <br/>
                                <button  className='btn btn-lg btn-success btn-block'><SaveButton/> Save</button>
                   
                </div>
                </form>
                    
            )
        } else return '';
    };
}
