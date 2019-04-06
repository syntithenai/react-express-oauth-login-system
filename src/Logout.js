import  { Component } from 'react';
export default  class Logout extends Component {
  
    componentDidMount() {
       if (this.props.logout) {
           this.props.logout(this.props.user,this.props);
       } 
    }; 
    
    render() {
       return null;
    };
}
