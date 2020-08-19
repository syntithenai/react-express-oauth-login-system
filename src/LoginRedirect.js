/* esslint-disable */ 

import React, { Component } from 'react';
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'
import {getCookie} from './helpers'  

export default  class LoginRedirect extends Component {
    
    constructor(props) {
        super(props);
        this.state={};
    };
         
	componentDidMount() {
		let that = this;
        console.log(['login redire',that.props])
		if (!this.props.user || !this.props.user._id) {
            console.log(['login redire need user',that.props])
			let accessToken = getCookie('access-token')
            console.log(['login redire to\ken',that.props])
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
 
