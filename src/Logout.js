import  { Component } from 'react';
//import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'
export default  class Logout extends Component {
  
    componentDidMount() {
		console.log('LOGOUT COMPONENT',this.props.logout);
       if (this.props.logout) {
           this.props.logout(this.props.user,this.props);
       } 
    }; 
    
    render() {
       return null;
    };
}
