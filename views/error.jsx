const React = require('react');
const DefaultLayout = require('./layouts/default');

class Error extends React.Component{
    render(){
        return <DefaultLayout title={'Error'}>
            <h1>Error {this.props.status} : {this.props.message}</h1>
            {this.props.stack}
        </DefaultLayout>
    }
}
module.exports = Error;

