import React, { Component } from 'react';
//import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'

export default  class OAuth extends Component {
    
    constructor(props) {
        super(props);
        this.state={};
        this.change = this.change.bind(this);
        this.cancelAuthRequest = this.cancelAuthRequest.bind(this);
     }
         
    change(e) {
        var state = {};
        state[e.target.name] =  e.target.value;
        this.setState(state);
        return true;
    }
    
    cancelAuthRequest(e) {
		e.preventDefault();
		this.setState({authRequest:null})
		localStorage.setItem('auth_request','')
		window.location='/'
		return false;
	}
    
    
    componentDidUpdate() {
        if (!this.props.isLoggedIn()) {
           this.props.history.push("/login/login");
       }
    };
  
    componentDidMount() {
		let that = this;
        if (!this.props.isLoggedIn()) {
           this.props.history.push("/login/login");
       } else {
			console.log(['OAUTH MOUNt',this.props]);
			// extract request info
			let params = this.props.location.search ? this.props.location.search.slice(1).split("&") : [];
			let paramsObject = {};
			params.map(function(keyAndData) {
				let parts = keyAndData.split("=");
				if (parts.length === 2) {
					paramsObject[parts[0]] = parts[1]
				}
				return null;
			})
			if (paramsObject.response_type && paramsObject.response_type.length > 0 && paramsObject.client_id && paramsObject.client_id.length > 0) {
				let authRequest={client_id:paramsObject.client_id,redirect_uri:paramsObject.redirect_uri,response_type:paramsObject.response_type,scope:paramsObject.scope,state:paramsObject.state}
				// lookup oauth client extra label info
				 if (that.props.startWaiting) that.props.startWaiting();
				 fetch(that.props.authServer+'/oauthclient?clientId='+paramsObject.client_id, {
					  method: 'GET',
					  headers: {
						'Content-Type': 'application/json',
						'Authorization': 'Bearer '+that.props.user.token.access_code
					  }
					}).then(this.checkStatus)
				  .then(function(data) {
					  return that.parseJSON(data) 
				   })
				  .then(function(data) {
					  console.log(['OAUTH COMPLETE',data])
						if (that.props.stopWaiting) that.props.stopWaiting();
						if (data.error) {
							console.log(data.error,data);
							that.props.submitWarning(data.error);
						} else {
							authRequest.name = data.name;
							authRequest.website_url = data.website_url;
							authRequest.privacy_url = data.privacy_url;
							authRequest.user = that.props.user ? that.props.user.username : '';
							console.log(['SET AUTH REQ',authRequest])
							localStorage.setItem('auth_request',JSON.stringify(authRequest))
							that.setState({authRequest: authRequest});
							// request captured, now redirect to login
							if (!that.props.isLoggedIn()) {
								console.log('GO TO LOGIN ')
								//that.props.history.push('/login/login');
							} 
							//else {
								//that.props.history.push('/login/oauth');
							//}
						}
				  }).catch(function(error) {
					console.log(['SIGN IN request failed', error])
				  });
				
				
			} else {
				let authRequest = localStorage.getItem('auth_request');
				console.log(['recover OAUTH req',authRequest]);
			
				that.setState({authRequest: JSON.parse(authRequest)});						
			}
		}
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
    
    
    render() {
		return <div>
		{this.state.authRequest && 
			<div className='row'>
			<h1>Authorize {this.state.authRequest.name}</h1>
			
			<div>Do you want to allow {this.state.authRequest.name} to login {this.props.user ? ' as '+ this.props.user.name : ''}?<br/></div>
			<br/>
			<br/>
			<div style={{fontSize:'1.2em', width:'100%',clear:'both'}} >
				<a target='_new' style={{float:'left'}}  href={this.state.authRequest.website_url} >Website</a>
				<a target='_new' style={{float:'right'}} href={this.state.authRequest.privacy_url} >Privacy Policy</a>
			</div>
         
         <br/>
			
			<div style={{ width: '100%',fontSize:'0.8em', padding: '0.2em', border: '1px solid grey', textAlign:'left'}} >Authorization will allow {this.state.authRequest.name} to<br/>
			
			<ul style={{ marginLeft: '-1em'}} >
				<li>See your name and email address</li>
				<li>Interact with this website on your behalf</li>
			</ul>
						
			<form  style={{width:'100%'}}  action={this.props.authServer+'/authorize'} method="POST">
			<input type='hidden' name='response_type'  value={this.state.authRequest.response_type} />
			<input type='hidden' name='client_id'  value={this.state.authRequest.client_id}/>
			<input type='hidden' name='client_secret'  value={this.state.authRequest.client_secret}/>
			<input type='hidden' name='redirect_uri'  value={this.state.authRequest.redirect_uri}/>
			<input type='hidden' name='scope'  value={this.state.authRequest.scope}/>
			<input type='hidden' name='state'  value={this.state.authRequest.state}/>
			<input type='hidden' name='access_token'  value={this.props.user && this.props.user.token ? this.props.user.token.access_token : ''}/>
			<div style={{fontSize:'1.1em', clear:'both', width: '100%'}} className='row' >
				<div className='col-6' >
				<button type='submit' style={{color: 'black', width:'100%', fontWeight: 'bold'}}  className='btn btn-block btn-lg  btn-success'  ><img src='/check-solid.svg' style={{marginRight: '0.2em', height: '1.2em'}} alt="Yes" />&nbsp;Yes</button>
				</div>
				<div className='col-6' >
				<button  style={{color: 'black', width:'100%', fontWeight: 'bold'}} className='btn  btn-block btn-lg  btn-danger' onClick={this.cancelAuthRequest} ><img src='/times-circle-solid.svg' style={{marginRight: '0.2em', height: '1.2em'}} alt="No"  />&nbsp;No</button>
				</div>
			</div>
			</form>

            
			</div>
			<br/>
			<br/>
			<br/>
			
			
			</div>
			
			
		}
         </div>
          
    };
}
 
