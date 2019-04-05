/* eslint-disable */ 

import React, { Component } from 'react';
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'
import {getCookie} from './axiosCSRF'  

export default  class LoginRedirect extends Component {
    
    constructor(props) {
        super(props);
        this.state={};
    };
         
	componentDidMount() {
		let that = this;
		if (!this.props.user || !this.props.user._id) {
			let accessToken = getCookie('access-token')
			if (accessToken && accessToken.length > 0) {
				that.props.refreshLogin(accessToken).then(function(user) {
					console.log(['LOGINSUCCESS refreshed',user,that.props])
					if (that.props.location.pathname === "/login/success") {
						that.props.onLogin(user,that.props)
					} else {
						that.props.setUser(user);
					}
				});
			}
		}
	}; 

    render() {
       return <div></div>
    };
}
 
