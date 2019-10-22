const React = require('react');
const DefaultLayout = require('./layouts/default');
const {Router, Link, Route, Switch} = require('react-router-dom');

class RegisterLayout extends React.Component{
    render(){
        return <DefaultLayout title={'Register User'} moduleJSX={'Register.jsx'}>
            <div id={'main'}> </div>
        </DefaultLayout>
    }
}

module.exports = RegisterLayout;