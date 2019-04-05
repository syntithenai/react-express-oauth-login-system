/* global document */
/* dis-eslint-disable */
import React, { Component } from 'react';
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'
import Logout from './Logout'
import PropsRoute from './PropsRoute'
import Profile from './Profile'
import Login from './Login'
import Register from './Register'
import LoginRedirect from './LoginRedirect'
import ForgotPassword from './ForgotPassword'
import OAuth from './OAuth'
import {getCookie,getAxiosClient} from './axiosCSRF'  

//var config=require('./config')

export default  class LoginSystem extends Component {
    
    constructor(props) {
        super(props);
        this.timeout = null;
        this.refreshInterval = null;
        this.state={warning_message:null};
        // XHR
        this.submitSignUp = this.submitSignUp.bind(this);
        this.submitSignIn = this.submitSignIn.bind(this);
        this.recoverPassword = this.recoverPassword.bind(this);
        this.saveUser = this.saveUser.bind(this);
        this.setUser = this.setUser.bind(this);
        
        this.refreshLogin = this.refreshLogin.bind(this);
       
       this.logout = this.logout.bind(this);
       this.onLogin = this.onLogin.bind(this);
       this.isLoggedIn = this.isLoggedIn.bind(this)
       this.submitWarning = this.submitWarning.bind(this);
       this.axiosClient = null;
    };
    
    componentDidMount() {
        let that=this;
 			// ensure xsrf header in all ajax requests
			this.axiosClient = getAxiosClient();
	};
   
    saveUser(user) {
         let that = this;
         if (this.props.startWaiting) this.props.startWaiting();
         return that.axiosClient( {
          url: that.props.authServer+'/saveuser',
          method: 'post',
          headers: {
            'Authorization': 'Bearer '+user.token.access_token
          },
          data: user
        }).then(function(res) {
            if (that.props.stopWaiting) that.props.stopWaiting();
            return res.data;  
        }).then(function(res) {
            if (res.user) that.setState({user:res.user});
            if (res.warning_message) that.submitWarning(res.warning_message);
        }).catch(function(err) {
            console.log(err);
        });
    };
    
    submitSignIn(user,pass) {
		console.log(['SUBMITSIGNIN',user,pass])
        var that=this;
        this.submitWarning('');
        if (this.props.startWaiting) this.props.startWaiting();
        setTimeout(function() {
           that.axiosClient( {
              url: that.props.authServer+'/signin',
              method: 'post',
              data: {
                username: user,
                password: pass
              }
            })
            .then(this.checkStatus)
            .then(function(res) {
            return res.data;  
		   })
          .then(function(user) {
                if (that.props.stopWaiting) that.props.stopWaiting();
                if (user.message) {
                    that.submitWarning(user.message);
                } else {
					console.log(['SUBMIT SIGNIN',user])
					if (user && user.token && user.token.access_token && user.token.access_token.length > 0 ) {
						let authRequest = localStorage.getItem('auth_request');
						console.log(['AUTH REQ',authRequest])
						if (authRequest) {
							// using the showButton property, a button will be shown instead of immediate automatic redirect
							if (that.props.showButton) {
								that.setState({authRequest:authRequest});
							} else {
								// if there is an auth request pending, jump to that
								that.setUser(user);
								that.props.history.push('/login/oauth');
							}
						} else {
							that.onLogin(user,that.props);
						//	that.props.history.push('/login/profile');
						}
					} 
					
				}
          }).catch(function(error) {
            console.log(['SIGN IN request failed', error])
          });
           
       },100);
    };
    
    submitSignUp(name,avatar,email,password,password2) {
		console.log(['SUBMIT SIGNUP',name,avatar,email,password,password2])
       var that=this;
       this.submitWarning('');
       if (this.props.startWaiting) this.props.startWaiting();
       that.axiosClient( {
          url: that.props.authServer+'/signup',
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            name: name,
            avatar: avatar,
            username: email,
            password: password,
            password2: password2,
          }
        })
        .then(this.checkStatus)
        .then(function(res) {
            return res.data;  
		  })
          .then(function(data) {
		  if (that.props.stopWaiting) that.props.stopWaiting();
			if (data.warning) {
                that.submitWarning(data.warning);
            } else if (data.message) {
                that.submitWarning(data.message);
            }
      }).catch(function(error) {
        console.log(['request failed', error]);
      });
    }; 
 
    recoverPassword(email,password,password2) {
        let that = this;
       console.log(['recover',email,password,password2]);
        if (this.props.startWaiting) this.props.startWaiting();
       that.axiosClient({
          url: that.props.authServer+'/recover',
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          data: {
            email: email,
            password: password,
            password2: password2,
            code: Math.random().toString(36).replace(/[^a-z]+/g, '')
          }
        }).then(this.checkStatus)
      .then(function(res) {
            return res.data;  
		  })
       .then(function(data) {
            if (that.props.stopWaiting) that.props.stopWaiting();
       
            if (data.warning_message) {
                that.submitWarning(data.warning_message);
            } else if (data.message) {
                that.submitWarning(data.message);
            }
            
      }).catch(function(error) {
        console.log(['recover request failed', error])
      });
        return false;
    };
  
 
	refreshLogin (token) {
		console.log('refresh login')
		let that = this;
		return new Promise(function(resolve,reject) {
			console.log(['refresh login sp',that])
		//console.log('refresh login token '+token)
		//resolve();
			if (token) {
				that.axiosClient = getAxiosClient();
				that.axiosClient.post( that.props.authServer+'/me',{
				  headers: {
					'Authorization': 'Bearer '+token
				  }
				})
				.then(function(res) {
				console.log('refresh login data')
				  return res.data;  
				})
				.then(function(user) {
					console.log(['refreshed ',user])
					that.setUser(user);
					resolve(user);
				}).catch(function(err) {
					console.log(err);
					reject();
				});				
			} else {
				reject();
			}
		})
	}
   
    // xhr processing chain
    checkStatus(response) {
      if (response.status >= 200 && response.status < 300) {
        return response
      } else {
        var error = new Error(response.statusText)
        error.response = response
        throw error
      }
    }


    parseJSON(response) {
      return response.json()
    }
    
    
   isLoggedIn() { 
	  let token = getCookie('access-token');
	  if (token && token.length > 0) {
		return true;  
	  //} 
	  //// console.log(['IS LOGGED IN',this.state.user])
      //if (this.state.user  && this.state.user.token && this.state.user.token.access_token  && this.state.user.token.access_token.length > 0) {
          //return true;
      } else {
          return false;
      }
    }; 
     
    onLogin(user,props) {
		let that =this;
		// just the token into localstorage
       // localStorage.setItem('token',JSON.stringify(user.token));
        this.setState({user:user});
        clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(function() {
			that.refreshLogin(getCookie('access-token'))
		},180000);
        if (this.props.onLogin) this.props.onLogin(user,props);
    };
    
    setUser(user) {
		// just the token into localstorage
        this.setState({user:user});
        if (this.props.setUser) this.props.setUser(user);
    };
    
    submitWarning(warning) {
        let that=this;
        clearTimeout(this.timeout);
        this.setState({'warning_message':warning});
        this.timeout = setTimeout(function() {
            that.setState({'warning_message':''});
        },6000);
    };
    
     
  
  logout() {
	  let that = this;
	  console.log('DO LOGOUT')
      //localStorage.setItem('token',null);
	  let user = this.state.user;
	  this.setState({user:null});
	  that.axiosClient( {
		  url: that.props.authServer+'/logout',
		  method: 'post',
		  headers: {
			'Content-Type': 'application/json',
		  },
		}).then(function(res) {
			console.log('DOne LOGOUT')
			if (that.props.onLogout) that.props.onLogout(user,that.props);  
		}).catch(function(err) {
			console.log(err);
		});	
      
  };
  
    
    render() {
		let that = this;
        let callBackFunctions = {
            submitSignUp : this.submitSignUp,
            submitSignIn : this.submitSignIn,
            recoverPassword : this.recoverPassword,
            onLogin : this.props.onLogin,
            refreshLogin : this.refreshLogin,
            logout : this.logout,
            isLoggedIn : this.isLoggedIn,
            saveUser : this.saveUser,
            setUser:  this.setUser,
            submitWarning : this.submitWarning,
            user:this.state.user,
            warning_message: this.state.warning_message,
            authServer: this.props.authServer,
            loginButtons: this.props.loginButtons
        };
        //console.log('ren log sys');
        
		// route for /login/
        const DefaultRedirect = function(props) {
            //if (!that.isLoggedIn()) {
            if (props.location.pathname==='/login' || props.location.pathname==='/login/') {
               props.history.push("/login/login");
            }
            //} else if (that.isLoggedIn()) {
				// just the parent callback (for redirects)
		//		that.props.onLogin(this.state.user);
			//}
            return <b></b>;
        };
    
        
        if (this.state.authRequest) {
			return <div className='pending-auth-request' ><Link to='/login/auth' className='btn btn-success'  >Pending Authentication Request</Link></div>
		} else {
			return (<div>
		        <Route path='/login' component={DefaultRedirect} />
                <PropsRoute {...callBackFunctions} path='/' component={LoginRedirect} />
                <PropsRoute {...callBackFunctions} path='/login/profile' component={Profile}   />
                <PropsRoute {...callBackFunctions} path='/login/login' component={Login} />
                <PropsRoute {...callBackFunctions} path='/login/register' component={Register} />
                <PropsRoute {...callBackFunctions} path='/login/logout' component={Logout} />
                <PropsRoute {...callBackFunctions} path='/login/oauth' component={OAuth} />
                <PropsRoute {...callBackFunctions} exact={true} path='/login' component={DefaultRedirect} />
                <PropsRoute {...callBackFunctions} exact={true} path='/login/forgot' component={ForgotPassword} />
            </div>)
         }
    };
    


}

//<PropsRoute {...callBackFunctions} path='/login/confirm/:token' component={ConfirmRegistration} />
                
// moved down
//{(this.state.warning_message) && <div className='warning' >{this.state.warning_message}</div>}
                
