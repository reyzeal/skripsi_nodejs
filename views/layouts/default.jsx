const React = require('react');

class DefaultLayout extends React.Component{
    render(){
        let moduleJSX = this.props.moduleJSX?<script type="text/babel" src={`/javascripts/${this.props.moduleJSX}`}/>:'';
        return <html>
            <head>
                <title>{this.props.title}</title>
                <link type={"text/css"} rel={"stylesheet"} href={"/stylesheets/bootstrap.min.css"}/>
            </head>
            <body className="min-vh-100">
                {this.props.children}
                <script src="/javascripts/react.production.min.js"/>
                <script src="/javascripts/react-dom.production.min.js"/>
                <script src="/javascripts/react-router-dom.min.js"/>
                <script src="/javascripts/react-transition-group.min.js"/>
                <script src="/javascripts/reactstrap.min.js"/>
                <script src="/javascripts/babel.min.js"/>
                {moduleJSX}
            </body>
        </html>;
    }
}

module.exports = DefaultLayout;